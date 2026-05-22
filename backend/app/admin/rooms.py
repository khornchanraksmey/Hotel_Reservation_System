from fastapi import APIRouter, Depends, Query, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from typing import Optional
from app.database import get_db
from app.models.room import Room, RoomAmenity, RoomStatus
from app.models.user import User
from app.schemas.room import RoomCreate, RoomUpdate, RoomResponse
from app.schemas.common import PaginatedResponse
from app.dependencies import get_current_admin
from app.utils.pagination import paginate, get_offset
from app.utils.file_utils import save_upload_file

router = APIRouter(prefix="/admin/rooms", tags=["Admin - Rooms"])


@router.get("", response_model=PaginatedResponse)
async def list_rooms(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    page_size: Optional[int] = Query(None),   # legacy alias
    room_type_id: Optional[int] = None,
    status: Optional[RoomStatus] = None,
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    limit = page_size if page_size is not None else per_page
    filters = []
    if room_type_id:
        filters.append(Room.room_type_id == room_type_id)
    if status:
        filters.append(Room.status == status)
    if search:
        filters.append(
            or_(
                Room.room_number.ilike(f"%{search}%"),
                Room.description.ilike(f"%{search}%"),
            )
        )
    base = and_(*filters) if filters else True  # type: ignore
    total = (await db.execute(select(func.count(Room.id)).where(base))).scalar() or 0
    rooms = (await db.execute(select(Room).where(base).offset(get_offset(page, limit)).limit(limit))).scalars().all()
    return paginate([RoomResponse.from_orm_room(r).model_dump() for r in rooms], total, page, limit)


@router.post("", response_model=RoomResponse, status_code=201)
async def create_room(data: RoomCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin)):
    if (await db.execute(select(Room).where(Room.room_number == data.room_number))).scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Room number already exists")
    room = Room(room_number=data.room_number, room_type_id=data.room_type_id, floor=data.floor,
                price_per_night=data.price_per_night, description=data.description,
                images=data.images or [], size_sqft=data.size_sqm,
                bed_type=data.bed_type, max_capacity=data.max_capacity,
                **({'status': data.status} if data.status else {}))
    db.add(room)
    await db.flush()
    if data.amenity_ids:
        for aid in data.amenity_ids:
            db.add(RoomAmenity(room_id=room.id, amenity_id=aid))
        await db.flush()
    await db.refresh(room)
    return RoomResponse.from_orm_room(room)


@router.get("/{room_id}", response_model=RoomResponse)
async def get_room(room_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin)):
    room = (await db.execute(select(Room).where(Room.id == room_id))).scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return RoomResponse.from_orm_room(room)


@router.put("/{room_id}", response_model=RoomResponse)
async def update_room(room_id: int, data: RoomUpdate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin)):
    room = (await db.execute(select(Room).where(Room.id == room_id))).scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    update_data = data.model_dump(exclude_none=True, exclude={"amenity_ids", "size_sqm"})
    for field, value in update_data.items():
        setattr(room, field, value)
    if data.size_sqm is not None:
        room.size_sqft = data.size_sqm
    if data.amenity_ids is not None:
        for ra in (await db.execute(select(RoomAmenity).where(RoomAmenity.room_id == room_id))).scalars().all():
            await db.delete(ra)
        await db.flush()
        for aid in data.amenity_ids:
            db.add(RoomAmenity(room_id=room_id, amenity_id=aid))
    await db.flush()
    await db.refresh(room)
    return RoomResponse.from_orm_room(room)


@router.delete("/{room_id}")
async def delete_room(room_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin)):
    room = (await db.execute(select(Room).where(Room.id == room_id))).scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    await db.delete(room)
    return {"message": "Room deleted"}


@router.post("/{room_id}/upload-image")
async def upload_image(room_id: int, file: UploadFile = File(...), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin)):
    room = (await db.execute(select(Room).where(Room.id == room_id))).scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    url = await save_upload_file(file, folder="rooms")
    images = list(room.images or [])
    images.append(url)
    room.images = images
    await db.flush()
    return {"url": url, "images": images}

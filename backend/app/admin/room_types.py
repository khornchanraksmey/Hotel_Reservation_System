from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.room_type import RoomType
from app.models.user import User
from app.schemas.room_type import RoomTypeCreate, RoomTypeUpdate, RoomTypeResponse
from app.dependencies import get_current_admin

router = APIRouter(prefix="/admin/room-types", tags=["Admin - Room Types"])


@router.get("", response_model=list[RoomTypeResponse])
async def list_rt(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin)):
    return (await db.execute(select(RoomType))).scalars().all()


@router.post("", response_model=RoomTypeResponse, status_code=201)
async def create_rt(data: RoomTypeCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin)):
    if (await db.execute(select(RoomType).where(RoomType.name == data.name))).scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Room type already exists")
    rt = RoomType(
        name=data.name,
        description=data.description,
        base_price=data.base_price,
        capacity=data.max_capacity,   # map max_capacity → DB column capacity
        image_url=data.image_url,
    )
    db.add(rt)
    await db.flush()
    await db.refresh(rt)
    return rt


@router.put("/{rt_id}", response_model=RoomTypeResponse)
async def update_rt(rt_id: int, data: RoomTypeUpdate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin)):
    rt = (await db.execute(select(RoomType).where(RoomType.id == rt_id))).scalar_one_or_none()
    if not rt:
        raise HTTPException(status_code=404, detail="Room type not found")
    update_dict = data.model_dump(exclude_none=True)
    if "max_capacity" in update_dict:
        rt.capacity = update_dict.pop("max_capacity")  # map max_capacity → DB column capacity
    for f, v in update_dict.items():
        setattr(rt, f, v)
    await db.flush()
    await db.refresh(rt)
    return rt


@router.delete("/{rt_id}")
async def delete_rt(rt_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin)):
    rt = (await db.execute(select(RoomType).where(RoomType.id == rt_id))).scalar_one_or_none()
    if not rt:
        raise HTTPException(status_code=404, detail="Room type not found")
    await db.delete(rt)
    return {"message": "Room type deleted"}

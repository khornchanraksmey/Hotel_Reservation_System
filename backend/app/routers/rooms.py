from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, asc, desc
from typing import Optional
from app.database import get_db
from app.models.room import Room, RoomAmenity, RoomStatus
from app.models.room_type import RoomType
from app.models.reservation import Reservation
from app.models.feedback import Feedback
from app.schemas.room import RoomResponse
from app.schemas.common import PaginatedResponse
from app.utils.pagination import paginate, get_offset

router = APIRouter(prefix="/rooms", tags=["Rooms"])


def _avg_rating_subq():
    return (
        select(func.avg(Feedback.rating))
        .join(Reservation, Reservation.id == Feedback.reservation_id)
        .where(Reservation.room_id == Room.id)
        .scalar_subquery()
    )


@router.get("", response_model=PaginatedResponse)
async def list_rooms(
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    page_size: Optional[int] = Query(None),          # legacy alias
    type: Optional[str] = Query(None),               # comma-separated room_type IDs
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    status: Optional[RoomStatus] = None,
    capacity: Optional[int] = None,                  # min guests
    amenity: Optional[str] = Query(None),            # comma-separated amenity IDs
    sort: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    limit = page_size if page_size is not None else per_page

    filters = []

    # Room type filter (comma-separated IDs)
    if type:
        type_ids = [int(t) for t in type.split(",") if t.strip().isdigit()]
        if type_ids:
            filters.append(Room.room_type_id.in_(type_ids))

    # Price filters
    if min_price is not None:
        filters.append(Room.price_per_night >= min_price)
    if max_price is not None:
        filters.append(Room.price_per_night <= max_price)

    # Status filter (default to available-only on public page)
    if status:
        filters.append(Room.status == status)
    else:
        filters.append(Room.status == RoomStatus.available)

    # Capacity filter via room_type join
    if capacity:
        filters.append(
            Room.room_type_id.in_(
                select(RoomType.id).where(RoomType.capacity >= capacity)
            )
        )

    # Amenity filter — room must have ALL selected amenities
    if amenity:
        amenity_ids = [int(a) for a in amenity.split(",") if a.strip().isdigit()]
        for aid in amenity_ids:
            filters.append(
                Room.id.in_(
                    select(RoomAmenity.room_id).where(RoomAmenity.amenity_id == aid)
                )
            )

    base = and_(*filters) if filters else True  # type: ignore

    if sort == "price_desc":
        order = desc(Room.price_per_night)
    elif sort == "newest":
        order = desc(Room.id)
    elif sort == "rating":
        order = desc(_avg_rating_subq())
    else:
        order = asc(Room.price_per_night)

    total = (await db.execute(select(func.count(Room.id)).where(base))).scalar() or 0
    rooms = (await db.execute(
        select(Room).where(base).order_by(order).offset(get_offset(page, limit)).limit(limit)
    )).scalars().all()
    return paginate([RoomResponse.from_orm_room(r).model_dump() for r in rooms], total, page, limit)


@router.get("/{room_id}", response_model=RoomResponse)
async def get_room(room_id: int, db: AsyncSession = Depends(get_db)):
    room = (await db.execute(select(Room).where(Room.id == room_id))).scalar_one_or_none()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return RoomResponse.from_orm_room(room)

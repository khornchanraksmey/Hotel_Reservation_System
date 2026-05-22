from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from app.models.reservation import Reservation, ReservationStatus
from app.models.room import Room, RoomStatus


async def get_available_rooms(
    db: AsyncSession,
    check_in: datetime,
    check_out: datetime,
    room_type_id: int | None = None,
    num_guests: int = 1,
) -> list[Room]:
    conflict = select(Reservation.room_id).where(
        and_(
            Reservation.status.in_([ReservationStatus.confirmed, ReservationStatus.checked_in, ReservationStatus.pending]),
            or_(
                and_(Reservation.check_in <= check_in, Reservation.check_out > check_in),
                and_(Reservation.check_in < check_out, Reservation.check_out >= check_out),
                and_(Reservation.check_in >= check_in, Reservation.check_out <= check_out),
            ),
        )
    )
    booked_ids = [r[0] for r in (await db.execute(conflict)).fetchall()]

    stmt = select(Room).where(Room.status == RoomStatus.available)
    if booked_ids:
        stmt = stmt.where(Room.id.not_in(booked_ids))
    if room_type_id:
        stmt = stmt.where(Room.room_type_id == room_type_id)

    rooms = (await db.execute(stmt)).scalars().all()
    return [r for r in rooms if r.room_type and r.room_type.capacity >= num_guests]


async def is_room_available(
    db: AsyncSession,
    room_id: int,
    check_in: datetime,
    check_out: datetime,
    exclude_id: int | None = None,
) -> bool:
    stmt = select(Reservation).where(
        and_(
            Reservation.room_id == room_id,
            Reservation.status.in_([ReservationStatus.confirmed, ReservationStatus.checked_in, ReservationStatus.pending]),
            or_(
                and_(Reservation.check_in <= check_in, Reservation.check_out > check_in),
                and_(Reservation.check_in < check_out, Reservation.check_out >= check_out),
                and_(Reservation.check_in >= check_in, Reservation.check_out <= check_out),
            ),
        )
    )
    if exclude_id:
        stmt = stmt.where(Reservation.id != exclude_id)
    return (await db.execute(stmt)).scalar_one_or_none() is None

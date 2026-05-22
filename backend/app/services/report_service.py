from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models.reservation import Reservation, ReservationStatus
from app.models.payment import Payment, PaymentStatus
from app.models.room import Room
from app.models.user import User, UserRole
from app.models.feedback import Feedback


async def get_dashboard_stats(db: AsyncSession) -> dict:
    total_revenue = float((await db.execute(
        select(func.sum(Payment.amount)).where(Payment.status == PaymentStatus.completed)
    )).scalar() or 0)

    active_bookings = (await db.execute(
        select(func.count(Reservation.id)).where(
            Reservation.status.in_([ReservationStatus.confirmed, ReservationStatus.checked_in, ReservationStatus.pending])
        )
    )).scalar() or 0

    total_guests = (await db.execute(
        select(func.count(User.id)).where(User.role == UserRole.guest)
    )).scalar() or 0

    total_rooms = (await db.execute(select(func.count(Room.id)))).scalar() or 0

    occupied = (await db.execute(
        select(func.count(Reservation.id)).where(Reservation.status == ReservationStatus.checked_in)
    )).scalar() or 0

    avg_rating = float((await db.execute(
        select(func.avg(Feedback.rating)).where(Feedback.is_public == True)
    )).scalar() or 0)

    return {
        "total_revenue": total_revenue,
        "active_bookings": active_bookings,
        "total_guests": total_guests,
        "total_rooms": total_rooms,
        "occupancy_rate": round((occupied / total_rooms * 100) if total_rooms else 0, 1),
        "avg_rating": round(avg_rating, 1),
    }


async def get_revenue_chart(db: AsyncSession, days: int = 30) -> list[dict]:
    start = datetime.now(timezone.utc) - timedelta(days=days)
    rows = (await db.execute(
        select(func.date(Payment.created_at).label("date"), func.sum(Payment.amount).label("revenue"))
        .where(and_(Payment.status == PaymentStatus.completed, Payment.created_at >= start))
        .group_by(func.date(Payment.created_at))
        .order_by(func.date(Payment.created_at))
    )).fetchall()
    return [{"date": str(r.date), "revenue": float(r.revenue)} for r in rows]


async def get_bookings_by_type(db: AsyncSession) -> list[dict]:
    rows = (await db.execute(
        select(Room.room_type_id, func.count(Reservation.id).label("count"))
        .join(Reservation, Reservation.room_id == Room.id)
        .where(Reservation.status != ReservationStatus.cancelled)
        .group_by(Room.room_type_id)
    )).fetchall()
    return [{"room_type_id": r.room_type_id, "count": r.count} for r in rows]

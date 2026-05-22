from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import datetime, timezone, timedelta
from typing import Optional
from app.database import get_db
from app.models.reservation import Reservation, ReservationStatus
from app.models.payment import Payment, PaymentStatus
from app.models.room import Room
from app.models.user import User, UserRole
from app.dependencies import get_current_admin

router = APIRouter(prefix="/admin/reports", tags=["Admin - Reports"])


@router.get("/revenue")
async def revenue_report(
    start_date: Optional[datetime] = None, end_date: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin),
):
    if not start_date:
        start_date = datetime.now(timezone.utc) - timedelta(days=30)
    if not end_date:
        end_date = datetime.now(timezone.utc)
    row = (await db.execute(
        select(func.sum(Payment.amount), func.count(Payment.id))
        .where(and_(Payment.status == PaymentStatus.completed, Payment.created_at >= start_date, Payment.created_at <= end_date))
    )).first()
    total_revenue = float(row[0] or 0)
    total_payments = int(row[1] or 0)
    return {"start_date": start_date.isoformat(), "end_date": end_date.isoformat(),
            "total_revenue": total_revenue, "total_payments": total_payments,
            "avg_payment": round(total_revenue / total_payments, 2) if total_payments else 0}


@router.get("/occupancy")
async def occupancy_report(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin)):
    total_rooms = (await db.execute(select(func.count(Room.id)))).scalar() or 0
    occupied = (await db.execute(select(func.count(Reservation.id)).where(Reservation.status == ReservationStatus.checked_in))).scalar() or 0
    confirmed = (await db.execute(select(func.count(Reservation.id)).where(Reservation.status == ReservationStatus.confirmed))).scalar() or 0
    return {"total_rooms": total_rooms, "occupied": occupied, "confirmed": confirmed,
            "available": total_rooms - occupied,
            "occupancy_rate": round((occupied / total_rooms * 100) if total_rooms else 0, 1)}


@router.get("/guests")
async def guests_report(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin)):
    total = (await db.execute(select(func.count(User.id)).where(User.role == UserRole.guest))).scalar() or 0
    start_of_month = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    new_this_month = (await db.execute(
        select(func.count(User.id)).where(and_(User.role == UserRole.guest, User.created_at >= start_of_month))
    )).scalar() or 0
    return {"total_guests": total, "new_this_month": new_this_month}

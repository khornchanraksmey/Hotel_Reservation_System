from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from typing import Optional
from app.database import get_db
from app.models.reservation import Reservation, ReservationStatus
from app.models.user import User
from app.schemas.reservation import ReservationResponse, ReservationUpdate
from app.schemas.common import PaginatedResponse
from app.dependencies import get_current_admin
from app.utils.pagination import paginate, get_offset

router = APIRouter(prefix="/admin/reservations", tags=["Admin - Reservations"])


@router.get("", response_model=PaginatedResponse)
async def list_reservations(
    page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100),
    status: Optional[ReservationStatus] = None, guest_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin),
):
    filters = []
    if status:
        filters.append(Reservation.status == status)
    if guest_id:
        filters.append(Reservation.guest_id == guest_id)
    base = and_(*filters) if filters else True  # type: ignore
    total = (await db.execute(select(func.count(Reservation.id)).where(base))).scalar() or 0
    rows = (await db.execute(select(Reservation).where(base).order_by(Reservation.created_at.desc()).offset(get_offset(page, page_size)).limit(page_size))).scalars().all()
    return paginate([ReservationResponse.model_validate(r).model_dump() for r in rows], total, page, page_size)


@router.get("/{reservation_id}", response_model=ReservationResponse)
async def get_reservation(reservation_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin)):
    r = (await db.execute(select(Reservation).where(Reservation.id == reservation_id))).scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return r


@router.put("/{reservation_id}", response_model=ReservationResponse)
async def update_reservation(reservation_id: int, data: ReservationUpdate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin)):
    r = (await db.execute(select(Reservation).where(Reservation.id == reservation_id))).scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=404, detail="Reservation not found")
    for f, v in data.model_dump(exclude_none=True).items():
        setattr(r, f, v)
    await db.flush()
    await db.refresh(r)
    return r

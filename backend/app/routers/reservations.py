from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from app.database import get_db
from app.models.reservation import Reservation
from app.models.user import User, UserRole
from app.schemas.reservation import ReservationCreate, ReservationResponse
from app.schemas.common import PaginatedResponse
from app.services.booking_service import create_reservation, cancel_reservation
from app.dependencies import get_current_user
from app.utils.pagination import paginate, get_offset

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("", response_model=ReservationResponse, status_code=201)
async def create(data: ReservationCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return ReservationResponse.model_validate(await create_reservation(data, current_user, db))


@router.get("/my", response_model=List[ReservationResponse])
async def list_mine(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    rows = (await db.execute(
        select(Reservation)
        .where(Reservation.guest_id == current_user.id)
        .order_by(Reservation.created_at.desc())
    )).scalars().all()
    return [ReservationResponse.model_validate(r) for r in rows]


@router.get("", response_model=PaginatedResponse)
async def list_paginated(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    total = (await db.execute(select(func.count(Reservation.id)).where(Reservation.guest_id == current_user.id))).scalar() or 0
    rows = (await db.execute(
        select(Reservation).where(Reservation.guest_id == current_user.id)
        .order_by(Reservation.created_at.desc())
        .offset(get_offset(page, page_size)).limit(page_size)
    )).scalars().all()
    return paginate([ReservationResponse.model_validate(r).model_dump() for r in rows], total, page, page_size)


@router.get("/by-reference/{reference}", response_model=ReservationResponse)
async def get_by_reference(reference: str, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    r = (await db.execute(select(Reservation).where(Reservation.reference == reference))).scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=404, detail="Reservation not found")
    if current_user.role == UserRole.guest and r.guest_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return ReservationResponse.model_validate(r)


@router.get("/{reservation_id}", response_model=ReservationResponse)
async def get_one(reservation_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    r = (await db.execute(select(Reservation).where(Reservation.id == reservation_id))).scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=404, detail="Reservation not found")
    if current_user.role == UserRole.guest and r.guest_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return ReservationResponse.model_validate(r)


@router.post("/{reservation_id}/cancel", response_model=ReservationResponse)
async def cancel_post(reservation_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return ReservationResponse.model_validate(await cancel_reservation(reservation_id, current_user, db))


@router.delete("/{reservation_id}/cancel", response_model=ReservationResponse)
async def cancel_delete(reservation_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return ReservationResponse.model_validate(await cancel_reservation(reservation_id, current_user, db))

import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from app.models.payment import Payment, PaymentStatus
from app.models.reservation import Reservation, ReservationStatus
from app.schemas.payment import PaymentCreate


async def process_payment(data: PaymentCreate, db: AsyncSession) -> Payment:
    reservation = (await db.execute(select(Reservation).where(Reservation.id == data.reservation_id))).scalar_one_or_none()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    if reservation.status == ReservationStatus.cancelled:
        raise HTTPException(status_code=400, detail="Reservation is cancelled")
    if reservation.payment:
        raise HTTPException(status_code=400, detail="Reservation already has a payment")

    import json as _json
    notes_data: dict = {}
    if data.slip_image:
        notes_data["slip"] = data.slip_image
    if data.transaction_ref:
        notes_data["ref"] = data.transaction_ref

    payment = Payment(
        reservation_id=data.reservation_id,
        amount=reservation.total_amount,
        method=data.method,
        status=PaymentStatus.pending,
        transaction_id=f"TXN-{uuid.uuid4().hex[:12].upper()}",
        notes=_json.dumps(notes_data) if notes_data else None,
    )
    db.add(payment)
    await db.flush()
    await db.refresh(payment)
    return payment

import logging
from fastapi import APIRouter, Request, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone

from app.database import get_db
from app.models.payment import Payment, PaymentStatus
from app.models.reservation import Reservation, ReservationStatus
from app.services.telegram_service import send_message
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/telegram", tags=["Telegram Webhook"])


@router.post("/webhook")
async def telegram_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """
    Telegram calls this endpoint when the admin taps Approve or Reject.
    Must ALWAYS return 200 {"ok": True} — if we return 5xx, Telegram retries.
    DB changes are committed first; Telegram reply is best-effort.
    """
    # ── 1. Parse body safely ─────────────────────────────────────────
    try:
        body = await request.json()
    except Exception:
        return {"ok": True}

    # Only handle inline-button taps (callback_query)
    callback = body.get("callback_query")
    if not callback:
        return {"ok": True}

    chat_id = str(callback["from"]["id"])
    data    = callback.get("data", "")

    # Security: ignore requests from anyone except the configured admin
    if chat_id != str(settings.TELEGRAM_ADMIN_CHAT_ID):
        return {"ok": True}

    if ":" not in data:
        return {"ok": True}

    # ── 2. Parse action and payment ID ──────────────────────────────
    try:
        action, payment_id_str = data.split(":", 1)
        payment_id = int(payment_id_str)
    except (ValueError, IndexError):
        return {"ok": True}

    # ── 3. Load payment from DB ──────────────────────────────────────
    payment = (
        await db.execute(select(Payment).where(Payment.id == payment_id))
    ).scalar_one_or_none()

    if not payment:
        await _reply(chat_id, "❌ Payment not found.")
        return {"ok": True}

    # ── 4. Load reservation ──────────────────────────────────────────
    reservation = (
        await db.execute(
            select(Reservation).where(Reservation.id == payment.reservation_id)
        )
    ).scalar_one_or_none()

    ref = reservation.reference if reservation else f"#{payment.reservation_id}"

    # ── 5. Apply action and FLUSH before any network call ────────────
    if action == "approve":
        if payment.status == PaymentStatus.completed:
            await _reply(chat_id, f"ℹ️ Payment <code>{ref}</code> was already approved.")
            return {"ok": True}

        payment.status  = PaymentStatus.completed
        payment.paid_at = datetime.now(timezone.utc)
        if reservation:
            reservation.status = ReservationStatus.confirmed
        await db.flush()   # write to DB — get_db will commit on success

        # Telegram reply is best-effort; failure must NOT roll back the DB
        await _reply(
            chat_id,
            f"✅ Payment approved for booking <code>{ref}</code>.\nBooking is now confirmed."
        )

    elif action == "reject":
        if payment.status == PaymentStatus.failed:
            await _reply(chat_id, f"ℹ️ Payment <code>{ref}</code> was already rejected.")
            return {"ok": True}

        payment.status = PaymentStatus.failed
        await db.flush()

        await _reply(
            chat_id,
            f"❌ Payment rejected for booking <code>{ref}</code>.\nGuest will need to re-upload."
        )

    return {"ok": True}


async def _reply(chat_id: str, text: str) -> None:
    """Send a Telegram message, swallowing any errors so the DB is never rolled back."""
    try:
        await send_message(chat_id, text)
    except Exception as exc:
        logger.warning("Telegram reply failed: %s", exc)

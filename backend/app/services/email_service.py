import logging
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.config import settings

logger = logging.getLogger(__name__)


def _mail_config() -> ConnectionConfig:
    return ConnectionConfig(
        MAIL_USERNAME=settings.MAIL_USERNAME,
        MAIL_PASSWORD=settings.MAIL_PASSWORD,
        MAIL_FROM=settings.MAIL_FROM or "noreply@hotel.com",
        MAIL_PORT=settings.MAIL_PORT,
        MAIL_SERVER=settings.MAIL_SERVER,
        MAIL_STARTTLS=settings.MAIL_STARTTLS,
        MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
        USE_CREDENTIALS=bool(settings.MAIL_USERNAME),
        VALIDATE_CERTS=True,
    )


async def send_booking_confirmation(
    email: str, name: str, reference: str,
    room_number: str, check_in: str, check_out: str, total: float,
) -> None:
    if not settings.MAIL_USERNAME:
        logger.info(f"[Email disabled] Booking confirmation for {email} ref={reference}")
        return
    try:
        html = f"""
        <h2>Booking Confirmed ✅</h2>
        <p>Dear {name},</p>
        <p>Your reservation is confirmed:</p>
        <table border="1" cellpadding="6">
          <tr><td><b>Reference</b></td><td>{reference}</td></tr>
          <tr><td><b>Room</b></td><td>{room_number}</td></tr>
          <tr><td><b>Check-in</b></td><td>{check_in}</td></tr>
          <tr><td><b>Check-out</b></td><td>{check_out}</td></tr>
          <tr><td><b>Total</b></td><td>${total:,.2f}</td></tr>
        </table>
        <p>Thank you for choosing us!</p>
        """
        await FastMail(_mail_config()).send_message(
            MessageSchema(subject="Booking Confirmation", recipients=[email], body=html, subtype=MessageType.html)
        )
    except Exception as e:
        logger.error(f"Email failed: {e}")

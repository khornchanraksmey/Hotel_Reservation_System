import json
import httpx
from app.config import settings


def _api(method: str) -> str:
    return f"https://api.telegram.org/bot{settings.TELEGRAM_BOT_TOKEN}/{method}"


async def send_receipt_to_admin(payment_id: int, reservation_ref: str, guest_name: str, amount: float, slip_url: str):
    """Send receipt photo to admin with Approve/Reject buttons."""

    caption = (
        f"🧾 *New Payment Receipt*\n\n"
        f"📋 Booking: `{reservation_ref}`\n"
        f"👤 Guest: {guest_name}\n"
        f"💰 Amount: *${amount:.2f}*\n\n"
        f"Please review and approve or reject."
    )

    reply_markup = json.dumps({
        "inline_keyboard": [[
            {"text": "✅ Approve", "callback_data": f"approve:{payment_id}"},
            {"text": "❌ Reject",  "callback_data": f"reject:{payment_id}"},
        ]]
    })

    async with httpx.AsyncClient(timeout=30) as client:
        # Try sending as photo URL directly first (faster, no download needed)
        resp = await client.post(
            _api("sendPhoto"),
            json={
                "chat_id": settings.TELEGRAM_ADMIN_CHAT_ID,
                "photo": slip_url,
                "caption": caption,
                "parse_mode": "Markdown",
                "reply_markup": json.loads(reply_markup),
            }
        )
        result = resp.json()

        # If URL send failed, download and upload as file
        if not result.get("ok"):
            img_response = await client.get(slip_url)
            img_bytes = img_response.content
            await client.post(
                _api("sendPhoto"),
                data={
                    "chat_id": settings.TELEGRAM_ADMIN_CHAT_ID,
                    "caption": caption,
                    "parse_mode": "Markdown",
                    "reply_markup": reply_markup,
                },
                files={"photo": ("receipt.jpg", img_bytes, "image/jpeg")},
            )


async def send_message(chat_id: str, text: str):
    async with httpx.AsyncClient(timeout=10) as client:
        await client.post(
            _api("sendMessage"),
            json={
                "chat_id": chat_id,
                "text": text,
                "parse_mode": "HTML",
            }
        )
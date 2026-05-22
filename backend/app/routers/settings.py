from fastapi import APIRouter
from app.admin.settings import _load

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("/payment")
async def get_payment_settings():
    return _load()

import json
import os
from fastapi import APIRouter, Depends, UploadFile, File
from app.models.user import User
from app.dependencies import get_current_admin
from app.utils.file_utils import save_upload_file

router = APIRouter(prefix="/admin/settings", tags=["Admin - Settings"])

SETTINGS_PATH = os.path.join("uploads", "settings", "payment.json")

DEFAULT_SETTINGS = {
    "qr_code_url": None,
    "bank_name": "ABA Bank",
    "account_name": "Grand Luxe Hotel Co.",
    "account_number": "123-4-56789-0",
}


def _load() -> dict:
    if os.path.exists(SETTINGS_PATH):
        with open(SETTINGS_PATH, "r") as f:
            return {**DEFAULT_SETTINGS, **json.load(f)}
    return dict(DEFAULT_SETTINGS)


def _save(data: dict) -> None:
    os.makedirs(os.path.dirname(SETTINGS_PATH), exist_ok=True)
    with open(SETTINGS_PATH, "w") as f:
        json.dump(data, f)


@router.get("/payment")
async def get_payment_settings(_: User = Depends(get_current_admin)):
    return _load()


@router.put("/payment")
async def update_payment_settings(
    bank_name: str | None = None,
    account_name: str | None = None,
    account_number: str | None = None,
    _: User = Depends(get_current_admin),
):
    settings = _load()
    if bank_name is not None:
        settings["bank_name"] = bank_name
    if account_name is not None:
        settings["account_name"] = account_name
    if account_number is not None:
        settings["account_number"] = account_number
    _save(settings)
    return settings


@router.post("/payment/qr")
async def upload_qr_code(file: UploadFile = File(...), _: User = Depends(get_current_admin)):
    url = await save_upload_file(file, folder="settings")
    settings = _load()
    settings["qr_code_url"] = url
    _save(settings)
    return settings

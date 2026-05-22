import os
import uuid
import aiofiles
from fastapi import UploadFile, HTTPException
from app.config import settings

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


async def save_upload_file(file: UploadFile, folder: str = "rooms") -> str:
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Only image files are allowed")
    contents = await file.read()
    if len(contents) > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")
    ext = (file.filename or "file.jpg").split(".")[-1]
    filename = f"{uuid.uuid4().hex}.{ext}"
    dir_path = os.path.join(settings.UPLOAD_DIR, folder)
    os.makedirs(dir_path, exist_ok=True)
    async with aiofiles.open(os.path.join(dir_path, filename), "wb") as f:
        await f.write(contents)
    return f"/{settings.UPLOAD_DIR}/{folder}/{filename}"

from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.user import User
from app.utils.file_utils import save_upload_file
from app.dependencies import get_current_user

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("/avatar")
async def upload_avatar(file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    url = await save_upload_file(file, folder="avatars")
    current_user.avatar = url
    await db.flush()
    return {"url": url}

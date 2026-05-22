from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.room_type import RoomType
from app.schemas.room_type import RoomTypeResponse

router = APIRouter(prefix="/room-types", tags=["Room Types"])


@router.get("", response_model=list[RoomTypeResponse])
async def list_room_types(db: AsyncSession = Depends(get_db)):
    return (await db.execute(select(RoomType))).scalars().all()


@router.get("/{rt_id}", response_model=RoomTypeResponse)
async def get_room_type(rt_id: int, db: AsyncSession = Depends(get_db)):
    rt = (await db.execute(select(RoomType).where(RoomType.id == rt_id))).scalar_one_or_none()
    if not rt:
        raise HTTPException(status_code=404, detail="Room type not found")
    return rt

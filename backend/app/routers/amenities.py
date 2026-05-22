from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.amenity import Amenity
from app.schemas.amenity import AmenityResponse

router = APIRouter(prefix="/amenities", tags=["Amenities"])


@router.get("", response_model=list[AmenityResponse])
async def list_amenities(db: AsyncSession = Depends(get_db)):
    return (await db.execute(select(Amenity))).scalars().all()

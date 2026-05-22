from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.amenity import Amenity
from app.models.user import User
from app.schemas.amenity import AmenityCreate, AmenityUpdate, AmenityResponse
from app.dependencies import get_current_admin

router = APIRouter(prefix="/admin/amenities", tags=["Admin - Amenities"])


@router.get("", response_model=list[AmenityResponse])
async def list_amenities(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin)):
    return (await db.execute(select(Amenity))).scalars().all()


@router.post("", response_model=AmenityResponse, status_code=201)
async def create_amenity(data: AmenityCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin)):
    a = Amenity(**data.model_dump())
    db.add(a)
    await db.flush()
    await db.refresh(a)
    return a


@router.put("/{amenity_id}", response_model=AmenityResponse)
async def update_amenity(amenity_id: int, data: AmenityUpdate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin)):
    a = (await db.execute(select(Amenity).where(Amenity.id == amenity_id))).scalar_one_or_none()
    if not a:
        raise HTTPException(status_code=404, detail="Amenity not found")
    for f, v in data.model_dump(exclude_none=True).items():
        setattr(a, f, v)
    await db.flush()
    await db.refresh(a)
    return a


@router.delete("/{amenity_id}")
async def delete_amenity(amenity_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin)):
    a = (await db.execute(select(Amenity).where(Amenity.id == amenity_id))).scalar_one_or_none()
    if not a:
        raise HTTPException(status_code=404, detail="Amenity not found")
    await db.delete(a)
    return {"message": "Amenity deleted"}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.database import get_db
from app.models.promotion import Promotion
from app.models.user import User
from app.schemas.promotion import PromotionCreate, PromotionUpdate, PromotionResponse
from app.dependencies import get_current_admin

router = APIRouter(prefix="/admin/promotions", tags=["Admin - Promotions"])


@router.get("", response_model=List[PromotionResponse])
async def list_promotions(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin)):
    rows = (await db.execute(select(Promotion).order_by(Promotion.created_at.desc()))).scalars().all()
    return [PromotionResponse.model_validate(p) for p in rows]


@router.post("", response_model=PromotionResponse, status_code=201)
async def create_promotion(data: PromotionCreate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin)):
    if (await db.execute(select(Promotion).where(Promotion.code == data.promo_code.upper()))).scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Promo code already exists")
    p = Promotion(
        code=data.promo_code.upper(),
        description=data.description,
        discount_percent=data.discount_percent,
        valid_from=data.valid_from,
        valid_until=data.valid_to,
        is_active=data.is_active,
        usage_limit=data.usage_limit,
    )
    db.add(p)
    await db.flush()
    await db.refresh(p)
    return PromotionResponse.model_validate(p)


@router.get("/{promo_id}", response_model=PromotionResponse)
async def get_promotion(promo_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin)):
    p = (await db.execute(select(Promotion).where(Promotion.id == promo_id))).scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Promotion not found")
    return PromotionResponse.model_validate(p)


@router.put("/{promo_id}", response_model=PromotionResponse)
async def update_promotion(promo_id: int, data: PromotionUpdate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin)):
    p = (await db.execute(select(Promotion).where(Promotion.id == promo_id))).scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Promotion not found")
    update = data.model_dump(exclude_none=True)
    if "valid_to" in update:
        p.valid_until = update.pop("valid_to")
    for field, value in update.items():
        setattr(p, field, value)
    await db.flush()
    await db.refresh(p)
    return PromotionResponse.model_validate(p)


@router.delete("/{promo_id}")
async def delete_promotion(promo_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin)):
    p = (await db.execute(select(Promotion).where(Promotion.id == promo_id))).scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=404, detail="Promotion not found")
    await db.delete(p)
    return {"message": "Promotion deleted"}

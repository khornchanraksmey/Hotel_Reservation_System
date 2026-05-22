from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.promotion import PromoValidate, PromoValidateResponse
from app.services.booking_service import validate_promo

router = APIRouter(prefix="/promotions", tags=["Promotions"])


@router.post("/validate", response_model=PromoValidateResponse)
async def validate_promotion(data: PromoValidate, db: AsyncSession = Depends(get_db)):
    promo = await validate_promo(db, data.code)
    if not promo:
        raise HTTPException(status_code=400, detail="Invalid or expired promo code")
    return PromoValidateResponse(valid=True, discount_percent=float(promo.discount_percent), message=f"{float(promo.discount_percent):.0f}% discount applied!")

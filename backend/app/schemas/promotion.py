from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class PromotionCreate(BaseModel):
    promo_code: str
    description: Optional[str] = None
    discount_percent: float
    valid_from: datetime
    valid_to: datetime
    is_active: bool = True
    usage_limit: Optional[int] = None


class PromotionUpdate(BaseModel):
    description: Optional[str] = None
    discount_percent: Optional[float] = None
    valid_from: Optional[datetime] = None
    valid_to: Optional[datetime] = None
    is_active: Optional[bool] = None
    usage_limit: Optional[int] = None


class PromotionResponse(BaseModel):
    id: int
    promo_code: str = Field(validation_alias="code")
    description: Optional[str] = None
    discount_percent: float
    valid_from: datetime
    valid_to: datetime = Field(validation_alias="valid_until")
    times_used: int = Field(validation_alias="used_count")
    is_active: bool

    model_config = {"from_attributes": True, "populate_by_name": True}


class PromoValidate(BaseModel):
    code: str


class PromoValidateResponse(BaseModel):
    valid: bool
    discount_percent: float
    message: str

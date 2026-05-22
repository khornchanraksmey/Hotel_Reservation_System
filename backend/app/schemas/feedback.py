from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
from app.schemas.user import UserResponse


class FeedbackCreate(BaseModel):
    reservation_id: int
    rating: int
    comment: Optional[str] = None
    is_public: bool = True

    @field_validator("rating")
    @classmethod
    def rating_range(cls, v: int) -> int:
        if v < 1 or v > 5:
            raise ValueError("Rating must be between 1 and 5")
        return v


class FeedbackUpdate(BaseModel):
    rating: Optional[int] = None
    comment: Optional[str] = None
    is_public: Optional[bool] = None

    @field_validator("rating")
    @classmethod
    def rating_range(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and (v < 1 or v > 5):
            raise ValueError("Rating must be between 1 and 5")
        return v


class FeedbackResponse(BaseModel):
    id: int
    user_id: int
    reservation_id: int
    rating: int
    comment: Optional[str] = None
    is_public: bool
    created_at: datetime
    user: Optional[UserResponse] = None

    model_config = {"from_attributes": True}

from pydantic import BaseModel, Field, model_validator
from typing import Optional
from datetime import datetime
from app.models.reservation import ReservationStatus
from app.schemas.room import RoomListResponse
from app.schemas.user import UserResponse
from app.schemas.payment import PaymentResponse


class ReservationCreate(BaseModel):
    room_id: int
    check_in_date: str
    check_out_date: str
    num_guests: int = 1
    promo_code: Optional[str] = None
    special_requests: Optional[str] = None
    # Extra fields sent by frontend — derived from auth token, ignored here
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None


class ReservationUpdate(BaseModel):
    status: Optional[ReservationStatus] = None
    special_requests: Optional[str] = None
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None


class ReservationResponse(BaseModel):
    id: int
    booking_reference: str = Field(validation_alias="reference")
    guest_id: int
    room_id: int
    check_in_date: datetime = Field(validation_alias="check_in")
    check_out_date: datetime = Field(validation_alias="check_out")
    num_guests: int
    reservation_status: ReservationStatus = Field(validation_alias="status")
    promo_code: Optional[str] = None
    discount_percent: float
    subtotal: float
    discount_amount: float
    tax_amount: float
    total_amount: float
    special_requests: Optional[str] = None
    nights: int = 0
    payment_status: str = "pending"
    created_at: datetime
    updated_at: datetime
    room: Optional[RoomListResponse] = None
    guest: Optional[UserResponse] = None
    payment: Optional[PaymentResponse] = None

    model_config = {"from_attributes": True, "populate_by_name": True}

    @model_validator(mode="after")
    def compute_derived(self) -> "ReservationResponse":
        delta = self.check_out_date - self.check_in_date
        self.nights = max(delta.days, 0)
        if self.payment:
            self.payment_status = self.payment.status.value
        return self

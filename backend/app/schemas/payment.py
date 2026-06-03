import json
from pydantic import BaseModel, model_validator
from typing import Optional
from datetime import datetime
from app.models.payment import PaymentStatus, PaymentMethod


class PaymentCreate(BaseModel):
    reservation_id: int
    method: PaymentMethod = PaymentMethod.bank_transfer
    slip_image: Optional[str] = None       # slip file path
    transaction_ref: Optional[str] = None  # user-provided bank ref


class PaymentUpdate(BaseModel):
    status: Optional[PaymentStatus] = None
    transaction_id: Optional[str] = None
    notes: Optional[str] = None


class PaymentResponse(BaseModel):
    id: int
    reservation_id: int
    amount: float
    method: PaymentMethod
    status: PaymentStatus
    transaction_id: Optional[str] = None
    notes: Optional[str] = None      # raw DB field; parsed below
    slip_image: Optional[str] = None
    transaction_ref: Optional[str] = None
    paid_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}

    @model_validator(mode="after")
    def parse_notes(self) -> "PaymentResponse":
        """notes stores JSON {"slip": "/uploads/...", "ref": "TXN123"} written by the router."""
        if self.notes:
            try:
                data = json.loads(self.notes)
                self.slip_image = data.get("slip")
                self.transaction_ref = data.get("ref")
            except (json.JSONDecodeError, TypeError):
                # Fallback: treat notes as raw slip path
                if self.notes.startswith("/uploads/"):
                    self.slip_image = self.notes
        return self


class PaymentWithBookingResponse(PaymentResponse):
    """Extended payment response with reservation details for the guest payment history page."""
    booking_reference: Optional[str] = None
    check_in_date: Optional[datetime] = None
    check_out_date: Optional[datetime] = None
    room_number: Optional[str] = None
    room_type_name: Optional[str] = None

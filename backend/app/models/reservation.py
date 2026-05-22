import enum
from sqlalchemy import String, Integer, ForeignKey, Enum as SAEnum, Numeric, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.database import Base


class ReservationStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    checked_in = "checked_in"
    checked_out = "checked_out"
    cancelled = "cancelled"
    no_show = "no_show"


class Reservation(Base):
    __tablename__ = "reservations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    reference: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    guest_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id"))
    check_in: Mapped[DateTime] = mapped_column(DateTime(timezone=True))
    check_out: Mapped[DateTime] = mapped_column(DateTime(timezone=True))
    num_guests: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[ReservationStatus] = mapped_column(SAEnum(ReservationStatus), default=ReservationStatus.pending)
    promo_code: Mapped[str | None] = mapped_column(String(50), nullable=True)
    discount_percent: Mapped[float] = mapped_column(Numeric(5, 2), default=0)
    subtotal: Mapped[float] = mapped_column(Numeric(10, 2))
    discount_amount: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    tax_amount: Mapped[float] = mapped_column(Numeric(10, 2))
    total_amount: Mapped[float] = mapped_column(Numeric(10, 2))
    special_requests: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    guest: Mapped["User"] = relationship(back_populates="reservations", lazy="selectin")  # type: ignore
    room: Mapped["Room"] = relationship(back_populates="reservations", lazy="selectin")  # type: ignore
    payment: Mapped["Payment | None"] = relationship(back_populates="reservation", uselist=False, lazy="selectin")  # type: ignore
    feedback: Mapped["Feedback | None"] = relationship(back_populates="reservation", uselist=False, lazy="selectin")  # type: ignore

import enum
from sqlalchemy import String, Text, Integer, ForeignKey, Enum as SAEnum, Numeric, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class RoomStatus(str, enum.Enum):
    available = "available"
    occupied = "occupied"
    maintenance = "maintenance"
    reserved = "reserved"
    inactive = "inactive"


class Room(Base):
    __tablename__ = "rooms"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    room_number: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    room_type_id: Mapped[int] = mapped_column(ForeignKey("room_types.id"))
    floor: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[RoomStatus] = mapped_column(SAEnum(RoomStatus), default=RoomStatus.available)
    price_per_night: Mapped[float] = mapped_column(Numeric(10, 2))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    images: Mapped[list | None] = mapped_column(JSON, nullable=True, default=list)
    size_sqft: Mapped[int | None] = mapped_column(Integer, nullable=True)
    bed_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    max_capacity: Mapped[int | None] = mapped_column(Integer, nullable=True)

    room_type: Mapped["RoomType"] = relationship(back_populates="rooms", lazy="selectin")  # type: ignore
    room_amenities: Mapped[list["RoomAmenity"]] = relationship(back_populates="room", lazy="selectin", cascade="all, delete-orphan")
    reservations: Mapped[list["Reservation"]] = relationship(back_populates="room", lazy="selectin")  # type: ignore


class RoomAmenity(Base):
    __tablename__ = "room_amenities"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    room_id: Mapped[int] = mapped_column(ForeignKey("rooms.id", ondelete="CASCADE"))
    amenity_id: Mapped[int] = mapped_column(ForeignKey("amenities.id"))

    room: Mapped["Room"] = relationship(back_populates="room_amenities", lazy="selectin")
    amenity: Mapped["Amenity"] = relationship(back_populates="room_amenities", lazy="selectin")  # type: ignore

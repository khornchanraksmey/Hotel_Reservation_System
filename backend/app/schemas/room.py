from pydantic import BaseModel
from typing import Optional, List
from app.models.room import RoomStatus
from app.schemas.room_type import RoomTypeResponse
from app.schemas.amenity import AmenityResponse


class RoomCreate(BaseModel):
    room_number: str
    room_type_id: int
    floor: int = 1
    status: Optional[RoomStatus] = None
    price_per_night: float
    description: Optional[str] = None
    images: Optional[List[str]] = None
    size_sqm: Optional[int] = None
    bed_type: Optional[str] = None
    max_capacity: Optional[int] = None
    amenity_ids: Optional[List[int]] = None


class RoomUpdate(BaseModel):
    room_number: Optional[str] = None
    room_type_id: Optional[int] = None
    floor: Optional[int] = None
    status: Optional[RoomStatus] = None
    price_per_night: Optional[float] = None
    description: Optional[str] = None
    images: Optional[List[str]] = None
    size_sqm: Optional[int] = None
    bed_type: Optional[str] = None
    max_capacity: Optional[int] = None
    amenity_ids: Optional[List[int]] = None


class RoomResponse(BaseModel):
    id: int
    room_number: str
    room_type_id: int
    floor: int
    status: RoomStatus
    price_per_night: float
    description: Optional[str] = None
    images: Optional[List[str]] = None
    size_sqm: Optional[int] = None
    bed_type: Optional[str] = None
    max_capacity: Optional[int] = None
    room_type: RoomTypeResponse
    amenities: List[AmenityResponse] = []

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_room(cls, room: object) -> "RoomResponse":
        amenities = [ra.amenity for ra in getattr(room, "room_amenities", [])]
        return cls(
            id=getattr(room, "id"),
            room_number=getattr(room, "room_number"),
            room_type_id=getattr(room, "room_type_id"),
            floor=getattr(room, "floor"),
            status=getattr(room, "status"),
            price_per_night=float(getattr(room, "price_per_night")),
            description=getattr(room, "description"),
            images=getattr(room, "images"),
            size_sqm=getattr(room, "size_sqft", None),
            bed_type=getattr(room, "bed_type", None),
            max_capacity=getattr(room, "max_capacity", None),
            room_type=getattr(room, "room_type"),
            amenities=amenities,
        )


class RoomListResponse(BaseModel):
    id: int
    room_number: str
    floor: int
    status: RoomStatus
    price_per_night: float
    room_type: RoomTypeResponse
    images: Optional[List[str]] = None

    model_config = {"from_attributes": True}

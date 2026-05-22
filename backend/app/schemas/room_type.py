from pydantic import BaseModel, Field
from typing import Optional


class RoomTypeCreate(BaseModel):
    name: str
    description: Optional[str] = None
    base_price: float
    max_capacity: int = 2   # frontend sends max_capacity
    image_url: Optional[str] = None


class RoomTypeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    base_price: Optional[float] = None
    max_capacity: Optional[int] = None  # frontend sends max_capacity
    image_url: Optional[str] = None


class RoomTypeResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    base_price: float
    max_capacity: int = Field(validation_alias="capacity")  # DB column is capacity
    image_url: Optional[str] = None

    model_config = {"from_attributes": True, "populate_by_name": True}

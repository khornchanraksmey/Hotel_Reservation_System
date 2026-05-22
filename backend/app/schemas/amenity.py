from pydantic import BaseModel
from typing import Optional


class AmenityCreate(BaseModel):
    name: str
    icon: Optional[str] = None


class AmenityUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None


class AmenityResponse(BaseModel):
    id: int
    name: str
    icon: Optional[str] = None

    model_config = {"from_attributes": True}

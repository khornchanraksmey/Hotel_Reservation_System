from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.user import UserResponse


class StaffCreate(BaseModel):
    user_id: int
    department: str
    position: str
    salary: Optional[float] = None
    hire_date: Optional[datetime] = None


class StaffUpdate(BaseModel):
    department: Optional[str] = None
    position: Optional[str] = None
    salary: Optional[float] = None
    hire_date: Optional[datetime] = None
    is_active: Optional[bool] = None


class StaffResponse(BaseModel):
    id: int
    user_id: int
    department: str
    position: str
    salary: Optional[float] = None
    hire_date: Optional[datetime] = None
    is_active: bool
    created_at: datetime
    user: Optional[UserResponse] = None

    model_config = {"from_attributes": True}

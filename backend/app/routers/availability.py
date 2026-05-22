from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from datetime import datetime
from app.database import get_db
from app.services.availability_service import get_available_rooms
from app.schemas.room import RoomResponse

router = APIRouter(prefix="/availability", tags=["Availability"])


@router.get("", response_model=list[RoomResponse])
async def check_availability(
    check_in: datetime = Query(...),
    check_out: datetime = Query(...),
    num_guests: int = Query(1, ge=1),
    room_type_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    if check_in >= check_out:
        raise HTTPException(status_code=400, detail="Check-out must be after check-in")
    rooms = await get_available_rooms(db, check_in, check_out, room_type_id, num_guests)
    return [RoomResponse.from_orm_room(r) for r in rooms]

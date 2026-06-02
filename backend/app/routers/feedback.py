from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.database import get_db
from app.models.feedback import Feedback
from app.models.reservation import Reservation, ReservationStatus
from app.models.user import User
from app.schemas.feedback import FeedbackCreate, FeedbackResponse
from app.schemas.common import PaginatedResponse
from app.dependencies import get_current_user
from app.utils.pagination import paginate, get_offset

router = APIRouter(prefix="/feedback", tags=["Feedback"])


@router.get("", response_model=PaginatedResponse)
async def list_public(page: int = Query(1, ge=1), page_size: int = Query(10, ge=1, le=50), db: AsyncSession = Depends(get_db)):
    total = (await db.execute(select(func.count(Feedback.id)).where(Feedback.is_public == True))).scalar() or 0
    rows = (await db.execute(select(Feedback).where(Feedback.is_public == True).order_by(Feedback.created_at.desc()).offset(get_offset(page, page_size)).limit(page_size))).scalars().all()
    return paginate([FeedbackResponse.model_validate(f).model_dump() for f in rows], total, page, page_size)


@router.post("", response_model=FeedbackResponse, status_code=201)
async def create_feedback(data: FeedbackCreate, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    r = (await db.execute(select(Reservation).where(and_(Reservation.id == data.reservation_id, Reservation.guest_id == current_user.id)))).scalar_one_or_none()
    if not r:
        raise HTTPException(status_code=404, detail="Reservation not found")
    if r.status != ReservationStatus.checked_out:
        raise HTTPException(status_code=400, detail="Can only leave feedback after check-out")
    if (await db.execute(select(Feedback).where(Feedback.reservation_id == data.reservation_id))).scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Feedback already submitted")
    fb = Feedback(user_id=current_user.id, reservation_id=data.reservation_id, rating=data.rating, comment=data.comment, is_public=data.is_public)
    db.add(fb)
    await db.flush()
    await db.refresh(fb)
    return fb


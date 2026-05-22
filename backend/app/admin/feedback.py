from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models.feedback import Feedback
from app.models.user import User
from app.schemas.feedback import FeedbackResponse, FeedbackUpdate
from app.schemas.common import PaginatedResponse
from app.dependencies import get_current_admin
from app.utils.pagination import paginate, get_offset

router = APIRouter(prefix="/admin/feedback", tags=["Admin - Feedback"])


@router.get("", response_model=PaginatedResponse)
async def list_feedback(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100), db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin)):
    total = (await db.execute(select(func.count(Feedback.id)))).scalar() or 0
    rows = (await db.execute(select(Feedback).order_by(Feedback.created_at.desc()).offset(get_offset(page, page_size)).limit(page_size))).scalars().all()
    return paginate([FeedbackResponse.model_validate(f).model_dump() for f in rows], total, page, page_size)


@router.put("/{feedback_id}", response_model=FeedbackResponse)
async def update_feedback(feedback_id: int, data: FeedbackUpdate, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin)):
    fb = (await db.execute(select(Feedback).where(Feedback.id == feedback_id))).scalar_one_or_none()
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")
    for f, v in data.model_dump(exclude_none=True).items():
        setattr(fb, f, v)
    await db.flush()
    await db.refresh(fb)
    return fb


@router.delete("/{feedback_id}")
async def delete_feedback(feedback_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin)):
    fb = (await db.execute(select(Feedback).where(Feedback.id == feedback_id))).scalar_one_or_none()
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")
    await db.delete(fb)
    return {"message": "Feedback deleted"}

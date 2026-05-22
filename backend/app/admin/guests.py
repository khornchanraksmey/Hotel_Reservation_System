from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from app.database import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserResponse
from app.schemas.common import PaginatedResponse
from app.dependencies import get_current_admin
from app.utils.pagination import paginate, get_offset

router = APIRouter(prefix="/admin/guests", tags=["Admin - Guests"])


@router.get("", response_model=PaginatedResponse)
async def list_guests(
    page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin),
):
    stmt = select(User).where(User.role == UserRole.guest)
    count_stmt = select(func.count(User.id)).where(User.role == UserRole.guest)
    if search:
        f = User.first_name.ilike(f"%{search}%") | User.last_name.ilike(f"%{search}%") | User.email.ilike(f"%{search}%")
        stmt = stmt.where(f)
        count_stmt = count_stmt.where(f)
    total = (await db.execute(count_stmt)).scalar() or 0
    rows = (await db.execute(stmt.order_by(User.created_at.desc()).offset(get_offset(page, page_size)).limit(page_size))).scalars().all()
    return paginate([UserResponse.model_validate(g).model_dump() for g in rows], total, page, page_size)


@router.get("/{guest_id}", response_model=UserResponse)
async def get_guest(guest_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin)):
    g = (await db.execute(select(User).where(User.id == guest_id, User.role == UserRole.guest))).scalar_one_or_none()
    if not g:
        raise HTTPException(status_code=404, detail="Guest not found")
    return g


@router.patch("/{guest_id}/toggle-active")
async def toggle_active(guest_id: int, db: AsyncSession = Depends(get_db), _: User = Depends(get_current_admin)):
    g = (await db.execute(select(User).where(User.id == guest_id))).scalar_one_or_none()
    if not g:
        raise HTTPException(status_code=404, detail="Guest not found")
    g.is_active = not g.is_active
    await db.flush()
    return {"id": g.id, "is_active": g.is_active}

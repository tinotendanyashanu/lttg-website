"""Manual Gmail sync."""

from typing import Annotated

from fastapi import APIRouter, Depends

from app.deps import get_current_user, get_db, get_gmail, get_r2
from app.models.user import UserDoc
from app.services.sync_service import sync_gmail_once

router = APIRouter(tags=["sync"])


@router.post("/emails/sync")
async def emails_sync(
    user: Annotated[UserDoc, Depends(get_current_user)],
    db: Annotated[object, Depends(get_db)],
    gmail: Annotated[object, Depends(get_gmail)],
    r2: Annotated[object, Depends(get_r2)],
):
    _ = user  # auth only
    return await sync_gmail_once(db, gmail, r2)

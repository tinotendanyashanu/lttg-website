"""Messages: list for case + send."""

from typing import Annotated
from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile

from app.deps import get_current_user, get_db, get_gmail, get_r2
from app.models.user import UserDoc
from app.services.message_service import send_employee_message, send_new_employee_email
from app.services.r2_service import StorageUploadError

router = APIRouter(tags=["messages"])


def utc_iso(dt: datetime | None) -> str:
    if not dt:
        return ""
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).isoformat()


@router.get("/cases/{case_id}/messages")
async def list_case_messages(
    case_id: str,
    user: Annotated[UserDoc, Depends(get_current_user)],
    db: Annotated[object, Depends(get_db)],
    skip: int = Query(0, ge=0, le=10_000),
    limit: int = Query(50, ge=1, le=200),
):
    from motor.motor_asyncio import AsyncIOMotorDatabase

    dba: AsyncIOMotorDatabase = db  # type: ignore[assignment]
    c = await dba.cases.find_one({"_id": case_id})
    if not c:
        raise HTTPException(status_code=404, detail="case_not_found")
    if user.role != "admin" and c["assigned_to"] != user.id:
        raise HTTPException(status_code=403, detail="forbidden")

    threads = await dba.threads.find({"case_id": case_id}).to_list(200)
    thread_ids = [str(t["_id"]) for t in threads]
    if not thread_ids:
        return {"items": [], "total": 0}

    filt = {"thread_id": {"$in": thread_ids}}
    total = await dba.messages.count_documents(filt)
    cur = (
        dba.messages.find(filt).sort("timestamp", 1).skip(skip).limit(limit)
    )
    items = await cur.to_list(limit)
    out = []
    for m in items:
        out.append(
            {
                "id": str(m["_id"]),
                "thread_id": m["thread_id"],
                "sender_type": m["sender_type"],
                "sender_id": m.get("sender_id"),
                "content": m.get("content", ""),
                "attachments": m.get("attachments", []),
                "timestamp": utc_iso(m.get("timestamp")),
                "gmail_message_id": m.get("gmail_message_id"),
            }
        )
    return {"items": out, "total": total}


@router.post("/messages/send")
async def send_message(
    user: Annotated[UserDoc, Depends(get_current_user)],
    db: Annotated[object, Depends(get_db)],
    gmail: Annotated[object, Depends(get_gmail)],
    r2: Annotated[object, Depends(get_r2)],
    case_id: str = Form(..., min_length=1),
    content: str = Form(..., min_length=1, max_length=100_000),
    files: list[UploadFile] | None = File(None),
):
    from motor.motor_asyncio import AsyncIOMotorDatabase

    dba: AsyncIOMotorDatabase = db  # type: ignore[assignment]
    c = await dba.cases.find_one({"_id": case_id})
    if not c:
        raise HTTPException(status_code=404, detail="case_not_found")
    if user.role != "admin" and c["assigned_to"] != user.id:
        raise HTTPException(status_code=403, detail="forbidden")

    cl = await dba.clients.find_one({"_id": ObjectId(c["client_id"])})
    if not cl:
        raise HTTPException(status_code=400, detail="client_not_found")

    file_payloads: list[tuple[str, bytes, str]] = []
    for uf in files or []:
        if not uf.filename:
            continue
        data = await uf.read()
        ct = uf.content_type or "application/octet-stream"
        file_payloads.append((uf.filename, data, ct))

    try:
        res = await send_employee_message(
            dba,
            r2,
            gmail,
            case_id=case_id,
            employee_user_id=user.id,
            content=content,
            files=file_payloads,
            client_email=cl["email"],
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except StorageUploadError as e:
        raise HTTPException(status_code=502, detail="storage_upload_failed") from e

    return res


@router.post("/messages/send-new")
async def send_new_message(
    user: Annotated[UserDoc, Depends(get_current_user)],
    db: Annotated[object, Depends(get_db)],
    gmail: Annotated[object, Depends(get_gmail)],
    r2: Annotated[object, Depends(get_r2)],
    recipient_email: str = Form(..., min_length=3, max_length=320),
    recipient_name: str = Form("", max_length=200),
    subject: str = Form(..., min_length=1, max_length=500),
    content: str = Form(..., min_length=1, max_length=100_000),
    files: list[UploadFile] | None = File(None),
):
    from motor.motor_asyncio import AsyncIOMotorDatabase

    dba: AsyncIOMotorDatabase = db  # type: ignore[assignment]
    file_payloads: list[tuple[str, bytes, str]] = []
    for uf in files or []:
        if not uf.filename:
            continue
        data = await uf.read()
        ct = uf.content_type or "application/octet-stream"
        file_payloads.append((uf.filename, data, ct))

    try:
        return await send_new_employee_email(
            dba,
            r2,
            gmail,
            employee_user_id=user.id,
            recipient_email=recipient_email,
            recipient_name=recipient_name,
            subject=subject,
            content=content,
            files=file_payloads,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except StorageUploadError as e:
        raise HTTPException(status_code=502, detail="storage_upload_failed") from e

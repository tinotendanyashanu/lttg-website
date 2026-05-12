"""Case listing and detail."""

from typing import Annotated, Literal

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, EmailStr, Field

from app.deps import case_access_filter, get_current_user, get_db, require_admin
from app.models.user import UserDoc

router = APIRouter(prefix="/cases", tags=["cases"])


class ThreadSummaryOut(BaseModel):
    id: str
    gmail_thread_id: str
    message_count: int


class CaseListItemOut(BaseModel):
    id: str
    client_id: str
    client_name: str
    client_email: str
    assigned_to: str
    status: Literal["open", "closed"]
    created_at: str
    last_message_at: str | None
    last_message_preview: str | None
    last_sender_type: Literal["employee", "client"] | None
    has_unread_client: bool


class CaseDetailOut(BaseModel):
    id: str
    client_id: str
    client_name: str
    client_email: str
    assigned_to: str
    status: Literal["open", "closed"]
    created_at: str
    last_message_at: str | None
    last_message_preview: str | None
    threads: list[ThreadSummaryOut]


class CreateCaseBody(BaseModel):
    client_email: EmailStr
    client_name: str = Field(min_length=1, max_length=200)
    assigned_to: str = Field(min_length=1, description="User id (Mongo ObjectId hex)")
    subject: str | None = Field(default=None, max_length=500)


@router.get("", response_model=list[CaseListItemOut])
async def list_cases(
    user: Annotated[UserDoc, Depends(get_current_user)],
    db: Annotated[object, Depends(get_db)],
    status: Literal["open", "closed"] | None = Query(None),
    q: str | None = Query(None, max_length=200),
):
    from motor.motor_asyncio import AsyncIOMotorDatabase

    dba: AsyncIOMotorDatabase = db  # type: ignore[assignment]
    filt: dict = {}
    extra = case_access_filter(user)
    if extra:
        filt.update(extra)
    if status:
        filt["status"] = status

    cursor = dba.cases.find(filt).sort([("last_message_at", -1), ("created_at", -1)])
    cases = await cursor.to_list(200)

    client_ids = {c["client_id"] for c in cases}
    clients = {}
    if client_ids:
        oids = []
        for cid in client_ids:
            try:
                oids.append(ObjectId(cid))
            except Exception:
                pass
        async for cl in dba.clients.find({"_id": {"$in": oids}}):
            clients[str(cl["_id"])] = cl

    out: list[CaseListItemOut] = []
    for c in cases:
        cl = clients.get(c["client_id"], {})
        name = cl.get("name", "")
        email = cl.get("email", "")
        if q:
            ql = q.lower()
            if ql not in name.lower() and ql not in email.lower() and ql not in c["_id"].lower():
                continue
        unread = c.get("last_sender_type") == "client"
        out.append(
            CaseListItemOut(
                id=c["_id"],
                client_id=c["client_id"],
                client_name=name,
                client_email=email,
                assigned_to=c["assigned_to"],
                status=c["status"],
                created_at=c["created_at"].isoformat() if c.get("created_at") else "",
                last_message_at=c["last_message_at"].isoformat() if c.get("last_message_at") else None,
                last_message_preview=c.get("last_message_preview"),
                last_sender_type=c.get("last_sender_type"),
                has_unread_client=bool(unread),
            )
        )
    return out


@router.get("/{case_id}", response_model=CaseDetailOut)
async def get_case(
    case_id: str,
    user: Annotated[UserDoc, Depends(get_current_user)],
    db: Annotated[object, Depends(get_db)],
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
        raise HTTPException(status_code=404, detail="client_not_found")

    threads_raw = await dba.threads.find({"case_id": case_id}).sort("_id", 1).to_list(100)
    summaries: list[ThreadSummaryOut] = []
    for t in threads_raw:
        cnt = await dba.messages.count_documents({"thread_id": str(t["_id"])})
        summaries.append(
            ThreadSummaryOut(
                id=str(t["_id"]),
                gmail_thread_id=t.get("gmail_thread_id", ""),
                message_count=cnt,
            )
        )

    return CaseDetailOut(
        id=c["_id"],
        client_id=c["client_id"],
        client_name=cl.get("name", ""),
        client_email=cl.get("email", ""),
        assigned_to=c["assigned_to"],
        status=c["status"],
        created_at=c["created_at"].isoformat() if c.get("created_at") else "",
        last_message_at=c["last_message_at"].isoformat() if c.get("last_message_at") else None,
        last_message_preview=c.get("last_message_preview"),
        threads=summaries,
    )


@router.post("", response_model=dict)
async def create_case(
    body: CreateCaseBody,
    _: Annotated[UserDoc, Depends(require_admin)],
    db: Annotated[object, Depends(get_db)],
):
    from datetime import datetime

    from app.services.case_service import find_or_create_client
    from app.utils.ids import next_case_id

    from motor.motor_asyncio import AsyncIOMotorDatabase

    dba: AsyncIOMotorDatabase = db  # type: ignore[assignment]

    try:
        assign_oid = ObjectId(body.assigned_to)
    except Exception as e:
        raise HTTPException(status_code=400, detail="invalid_assigned_to") from e

    assignee = await dba.users.find_one({"_id": assign_oid})
    if not assignee:
        raise HTTPException(status_code=400, detail="assignee_not_found")

    client = await find_or_create_client(dba, str(body.client_email), body.client_name)
    case_id = await next_case_id(dba)
    now = datetime.utcnow()
    await dba.cases.insert_one(
        {
            "_id": case_id,
            "client_id": str(client["_id"]),
            "assigned_to": str(assign_oid),
            "status": "open",
            "created_at": now,
            "last_message_at": None,
            "last_message_preview": body.subject,
            "last_sender_type": None,
        }
    )
    return {"id": case_id}

"""Meta social inbox, posting, webhook, and OAuth routes."""

from datetime import datetime, timezone
from typing import Annotated, Literal

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Request, UploadFile
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field

from app.deps import get_current_user, get_db, get_r2
from app.models.user import UserDoc
from app.services.meta_service import (
    MetaApiError,
    MetaService,
    ingest_social_event,
    normalize_webhook_events,
)
from app.services.r2_service import StorageUploadError

router = APIRouter(prefix="/social", tags=["social"])


def utc_iso(dt: datetime | None) -> str | None:
    if not dt:
        return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).isoformat()


def require_staff(user: UserDoc) -> None:
    if user.role not in ("admin", "employee"):
        raise HTTPException(status_code=403, detail="forbidden")


class SendSocialBody(BaseModel):
    conversation_id: str = Field(min_length=1)
    content: str = Field(min_length=1, max_length=10_000)


class SocialPostBody(BaseModel):
    platform: Literal["facebook", "instagram"]
    content: str = Field(min_length=1, max_length=63_000)
    media_urls: list[str] = Field(default_factory=list)
    status: Literal["draft", "scheduled", "published"] = "draft"
    scheduled_time: datetime | None = None


@router.get("/webhook")
async def verify_webhook(
    request: Request,
    mode: str | None = Query(default=None, alias="hub.mode"),
    token: str | None = Query(default=None, alias="hub.verify_token"),
    challenge: str | None = Query(default=None, alias="hub.challenge"),
):
    expected = request.app.state.settings.meta_webhook_verify_token
    if mode == "subscribe" and expected and token == expected:
        return int(challenge) if challenge and challenge.isdigit() else (challenge or "")
    raise HTTPException(status_code=403, detail="invalid_verify_token")


@router.post("/webhook")
async def social_webhook(request: Request, db: Annotated[object, Depends(get_db)]):
    from motor.motor_asyncio import AsyncIOMotorDatabase

    dba: AsyncIOMotorDatabase = db  # type: ignore[assignment]
    payload = await request.json()
    events = normalize_webhook_events(payload)
    results = [await ingest_social_event(dba, event) for event in events]
    return {"received": True, "ingested": len(results), "results": results}


@router.get("/connect")
async def connect_social(
    request: Request,
    user: Annotated[UserDoc, Depends(get_current_user)],
    state: str | None = Query(default=None),
):
    require_staff(user)
    service = MetaService(request.app.state.settings)
    try:
        return RedirectResponse(service.connect_url(state=state or user.id))
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@router.get("/callback")
async def social_callback(
    request: Request,
    db: Annotated[object, Depends(get_db)],
    code: str = Query(...),
    state: str = Query(...),
):
    from motor.motor_asyncio import AsyncIOMotorDatabase

    dba: AsyncIOMotorDatabase = db  # type: ignore[assignment]
    try:
        state_oid = ObjectId(state)
    except InvalidId as e:
        raise HTTPException(status_code=400, detail="invalid_oauth_state") from e
    user_doc = await dba.users.find_one({"_id": state_oid, "role": {"$in": ["admin", "employee"]}})
    if not user_doc:
        raise HTTPException(status_code=403, detail="invalid_oauth_user")
    connected_by = str(user_doc["_id"])

    service = MetaService(request.app.state.settings)
    try:
        token = await service.exchange_code(code)
        pages = await service.fetch_pages(token["access_token"])
    except (ValueError, MetaApiError) as e:
        raise HTTPException(status_code=502, detail=str(e)) from e

    now = datetime.utcnow()
    saved = 0
    for page in pages:
        page_token = page.get("access_token") or token["access_token"]
        base_doc = {
            "page_id": str(page["id"]),
            "access_token": page_token,
            "connected_by": connected_by,
            "created_at": now,
        }
        await dba.social_accounts.update_one(
            {"platform": "facebook", "page_id": str(page["id"])},
            {"$set": {**base_doc, "platform": "facebook", "instagram_business_id": None}},
            upsert=True,
        )
        saved += 1
        ig = page.get("instagram_business_account") or {}
        if ig.get("id"):
            await dba.social_accounts.update_one(
                {"platform": "instagram", "instagram_business_id": str(ig["id"])},
                {"$set": {**base_doc, "platform": "instagram", "instagram_business_id": str(ig["id"])}},
                upsert=True,
            )
            saved += 1
    return {"connected": saved}


@router.get("/conversations")
async def list_conversations(
    user: Annotated[UserDoc, Depends(get_current_user)],
    db: Annotated[object, Depends(get_db)],
    platform: Literal["facebook", "instagram"] | None = Query(default=None),
):
    from motor.motor_asyncio import AsyncIOMotorDatabase

    require_staff(user)
    dba: AsyncIOMotorDatabase = db  # type: ignore[assignment]
    filt: dict = {}
    if user.role != "admin":
        filt["assigned_to"] = user.id
    if platform:
        filt["platform"] = platform
    convos = await dba.social_conversations.find(filt).sort("updated_at", -1).to_list(200)
    client_ids = []
    for c in convos:
        try:
            client_ids.append(ObjectId(c["client_id"]))
        except Exception:
            pass
    clients = {}
    async for cl in dba.clients.find({"_id": {"$in": client_ids}}):
        clients[str(cl["_id"])] = cl
    return [
        {
            "id": str(c["_id"]),
            "platform": c["platform"],
            "conversation_id": c["conversation_id"],
            "client_id": c["client_id"],
            "client_name": clients.get(c["client_id"], {}).get("name", "Social user"),
            "case_id": c["case_id"],
            "assigned_to": c["assigned_to"],
            "last_message": c.get("last_message"),
            "updated_at": utc_iso(c.get("updated_at")),
            "profile_image_url": c.get("profile_image_url"),
        }
        for c in convos
    ]


@router.get("/conversations/{conversation_id}/messages")
async def list_social_messages(
    conversation_id: str,
    user: Annotated[UserDoc, Depends(get_current_user)],
    db: Annotated[object, Depends(get_db)],
):
    from motor.motor_asyncio import AsyncIOMotorDatabase

    require_staff(user)
    dba: AsyncIOMotorDatabase = db  # type: ignore[assignment]
    try:
        convo_oid = ObjectId(conversation_id)
    except InvalidId as e:
        raise HTTPException(status_code=400, detail="invalid_conversation_id") from e
    convo = await dba.social_conversations.find_one({"_id": convo_oid})
    if not convo:
        raise HTTPException(status_code=404, detail="conversation_not_found")
    if user.role != "admin" and convo["assigned_to"] != user.id:
        raise HTTPException(status_code=403, detail="forbidden")
    items = await dba.messages.find({"type": "social", "conversation_id": convo["conversation_id"]}).sort("timestamp", 1).to_list(300)
    return {
        "items": [
            {
                "id": str(m["_id"]),
                "type": "social",
                "platform": m["platform"],
                "conversation_id": m["conversation_id"],
                "sender_type": m["sender_type"],
                "sender_id": m.get("sender_id"),
                "content": m.get("content", ""),
                "attachments": m.get("attachments", []),
                "timestamp": utc_iso(m.get("timestamp")),
            }
            for m in items
        ]
    }


@router.post("/send")
async def send_social_message(
    request: Request,
    body: SendSocialBody,
    user: Annotated[UserDoc, Depends(get_current_user)],
    db: Annotated[object, Depends(get_db)],
):
    from motor.motor_asyncio import AsyncIOMotorDatabase

    require_staff(user)
    dba: AsyncIOMotorDatabase = db  # type: ignore[assignment]
    try:
        convo_oid = ObjectId(body.conversation_id)
    except InvalidId as e:
        raise HTTPException(status_code=400, detail="invalid_conversation_id") from e
    convo = await dba.social_conversations.find_one({"_id": convo_oid})
    if not convo:
        raise HTTPException(status_code=404, detail="conversation_not_found")
    if user.role != "admin" and convo["assigned_to"] != user.id:
        raise HTTPException(status_code=403, detail="forbidden")
    account = await dba.social_accounts.find_one({"platform": convo["platform"], "page_id": convo.get("page_id")})
    if not account:
        raise HTTPException(status_code=400, detail="social_account_not_connected")

    try:
        client_oid = ObjectId(convo["client_id"])
    except InvalidId as e:
        raise HTTPException(status_code=400, detail="invalid_client_id") from e
    client = await dba.clients.find_one({"_id": client_oid})
    if not client:
        raise HTTPException(status_code=400, detail="client_not_found")
    recipient_id = client.get("instagram_id") if convo["platform"] == "instagram" else client.get("facebook_id")
    if not recipient_id:
        raise HTTPException(status_code=400, detail="recipient_social_id_missing")

    service = MetaService(request.app.state.settings)
    try:
        sent = await service.send_message(
            platform=convo["platform"],
            page_id=account["page_id"],
            recipient_id=recipient_id,
            access_token=account["access_token"],
            content=body.content,
        )
    except MetaApiError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e

    now = datetime.utcnow()
    msg = {
        "_id": ObjectId(),
        "type": "social",
        "platform": convo["platform"],
        "conversation_id": convo["conversation_id"],
        "thread_id": str(convo["_id"]),
        "sender_type": "employee",
        "sender_id": user.id,
        "content": body.content,
        "attachments": [],
        "timestamp": now,
        "meta_message_id": sent.get("message_id"),
    }
    await dba.messages.insert_one(msg)
    await dba.social_conversations.update_one({"_id": convo["_id"]}, {"$set": {"last_message": body.content[:280], "updated_at": now}})
    await dba.cases.update_one(
        {"_id": convo["case_id"]},
        {"$set": {"last_message_at": now, "last_message_preview": body.content[:280], "last_sender_type": "employee"}},
    )
    return {"message_id": str(msg["_id"]), "meta_message_id": sent.get("message_id")}


@router.post("/post")
async def create_social_post(
    request: Request,
    user: Annotated[UserDoc, Depends(get_current_user)],
    db: Annotated[object, Depends(get_db)],
    r2: Annotated[object, Depends(get_r2)],
    platform: Annotated[Literal["facebook", "instagram"], Form()],
    content: Annotated[str, Form(min_length=1, max_length=63_000)],
    status: Annotated[Literal["draft", "scheduled", "published"], Form()] = "draft",
    scheduled_time: Annotated[str | None, Form()] = None,
    media_urls: Annotated[list[str] | None, Form()] = None,
    files: Annotated[list[UploadFile] | None, File()] = None,
):
    from motor.motor_asyncio import AsyncIOMotorDatabase

    require_staff(user)
    dba: AsyncIOMotorDatabase = db  # type: ignore[assignment]
    urls = list(media_urls or [])
    for uf in files or []:
        if not uf.filename:
            continue
        data = await uf.read()
        try:
            up = await r2.upload_attachment("social-posts", uf.filename, data, uf.content_type or "application/octet-stream")
        except StorageUploadError as e:
            raise HTTPException(status_code=502, detail="storage_upload_failed") from e
        urls.append(up["url"])

    parsed_schedule = None
    if scheduled_time:
        try:
            parsed_schedule = datetime.fromisoformat(scheduled_time)
        except ValueError:
             # Try common datetime-local format if fromisoformat fails
             try:
                 parsed_schedule = datetime.strptime(scheduled_time, "%Y-%m-%dT%H:%M")
             except ValueError:
                 raise HTTPException(status_code=400, detail="invalid_scheduled_time_format")

    now = datetime.utcnow()
    doc = {
        "_id": ObjectId(),
        "platform": platform,
        "content": content,
        "media_urls": urls,
        "status": status,
        "scheduled_time": parsed_schedule,
        "created_by": user.id,
        "created_at": now,
        "published_at": None,
    }

    if status == "published":
        account = await dba.social_accounts.find_one({"platform": platform})
        if not account:
            raise HTTPException(status_code=400, detail="social_account_not_connected")
        if platform == "instagram" and not urls:
            raise HTTPException(status_code=400, detail="instagram_media_required")
        service = MetaService(request.app.state.settings)
        try:
            published = await service.publish_post(platform=platform, account=account, content=content, media_urls=urls)
        except (ValueError, MetaApiError) as e:
            raise HTTPException(status_code=502, detail=str(e)) from e
        doc["published_at"] = now
        doc["meta_post_id"] = published.get("id")

    await dba.posts.insert_one(doc)
    return {"id": str(doc["_id"]), "status": doc["status"], "media_urls": urls}


@router.get("/posts")
async def list_social_posts(
    user: Annotated[UserDoc, Depends(get_current_user)],
    db: Annotated[object, Depends(get_db)],
):
    from motor.motor_asyncio import AsyncIOMotorDatabase

    require_staff(user)
    dba: AsyncIOMotorDatabase = db  # type: ignore[assignment]
    filt = {} if user.role == "admin" else {"created_by": user.id}
    items = await dba.posts.find(filt).sort("created_at", -1).to_list(100)
    return [
        {
            "id": str(p["_id"]),
            "platform": p["platform"],
            "content": p["content"],
            "media_urls": p.get("media_urls", []),
            "status": p["status"],
            "scheduled_time": utc_iso(p.get("scheduled_time")),
            "created_by": p["created_by"],
            "created_at": utc_iso(p.get("created_at")),
            "published_at": utc_iso(p.get("published_at")),
        }
        for p in items
    ]

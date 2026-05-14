"""Meta Graph API integration and social message persistence."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Any, Literal
from urllib.parse import urlencode

import httpx
from bson import ObjectId

from app.config import Settings
from app.models.social import SocialPlatform
from app.services.case_service import pick_assignee
from app.utils.ids import next_case_id

if TYPE_CHECKING:
    from motor.motor_asyncio import AsyncIOMotorDatabase


class MetaApiError(RuntimeError):
    """Raised when Meta Graph API rejects a request."""


META_SCOPES = [
    "pages_manage_metadata",
    "pages_messaging",
    "instagram_manage_messages",
    "instagram_basic",
    "pages_show_list",
    "pages_read_engagement",
    "pages_manage_posts",
    "instagram_content_publish",
]


class MetaService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.graph_base = f"https://graph.facebook.com/{settings.meta_graph_version.strip('/')}"

    def connect_url(self, *, state: str | None = None) -> str:
        if not self.settings.meta_app_id or not self.settings.meta_redirect_uri:
            raise ValueError("meta_oauth_not_configured")
        params = {
            "client_id": self.settings.meta_app_id,
            "redirect_uri": self.settings.meta_redirect_uri,
            "scope": ",".join(META_SCOPES),
            "response_type": "code",
        }
        if state:
            params["state"] = state
        return f"https://www.facebook.com/{self.settings.meta_graph_version}/dialog/oauth?{urlencode(params)}"

    async def exchange_code(self, code: str) -> dict[str, Any]:
        if not self.settings.meta_app_id or not self.settings.meta_app_secret or not self.settings.meta_redirect_uri:
            raise ValueError("meta_oauth_not_configured")
        async with httpx.AsyncClient(timeout=30) as client:
            token_res = await client.get(
                f"{self.graph_base}/oauth/access_token",
                params={
                    "client_id": self.settings.meta_app_id,
                    "client_secret": self.settings.meta_app_secret,
                    "redirect_uri": self.settings.meta_redirect_uri,
                    "code": code,
                },
            )
            token = self._json_or_raise(token_res)
            long_res = await client.get(
                f"{self.graph_base}/oauth/access_token",
                params={
                    "grant_type": "fb_exchange_token",
                    "client_id": self.settings.meta_app_id,
                    "client_secret": self.settings.meta_app_secret,
                    "fb_exchange_token": token["access_token"],
                },
            )
            return self._json_or_raise(long_res)

    async def fetch_pages(self, access_token: str) -> list[dict[str, Any]]:
        async with httpx.AsyncClient(timeout=30) as client:
            res = await client.get(
                f"{self.graph_base}/me/accounts",
                params={
                    "fields": "id,name,access_token,instagram_business_account{id,username}",
                    "access_token": access_token,
                },
            )
        data = self._json_or_raise(res)
        return list(data.get("data", []))

    async def send_message(
        self,
        *,
        platform: SocialPlatform,
        page_id: str,
        recipient_id: str,
        access_token: str,
        content: str,
    ) -> dict[str, Any]:
        path = f"{page_id}/messages"
        payload: dict[str, Any] = {
            "recipient": {"id": recipient_id},
            "message": {"text": content},
            "access_token": access_token,
        }
        if platform == "instagram":
            payload["messaging_type"] = "RESPONSE"
        async with httpx.AsyncClient(timeout=30) as client:
            res = await client.post(f"{self.graph_base}/{path}", json=payload)
        return self._json_or_raise(res)

    async def publish_post(
        self,
        *,
        platform: SocialPlatform,
        account: dict[str, Any],
        content: str,
        media_urls: list[str],
    ) -> dict[str, Any]:
        if platform == "facebook":
            endpoint = f"{account['page_id']}/photos" if media_urls else f"{account['page_id']}/feed"
            payload: dict[str, Any] = {"message": content, "access_token": account["access_token"]}
            if media_urls:
                payload["url"] = media_urls[0]
                payload["caption"] = content
        else:
            ig_id = account.get("instagram_business_id")
            if not ig_id:
                raise ValueError("instagram_business_account_required")
            async with httpx.AsyncClient(timeout=60) as client:
                container_res = await client.post(
                    f"{self.graph_base}/{ig_id}/media",
                    data={
                        "image_url": media_urls[0] if media_urls else "",
                        "caption": content,
                        "access_token": account["access_token"],
                    },
                )
                container = self._json_or_raise(container_res)
                publish_res = await client.post(
                    f"{self.graph_base}/{ig_id}/media_publish",
                    data={
                        "creation_id": container["id"],
                        "access_token": account["access_token"],
                    },
                )
            return self._json_or_raise(publish_res)

        async with httpx.AsyncClient(timeout=60) as client:
            res = await client.post(f"{self.graph_base}/{endpoint}", data=payload)
        return self._json_or_raise(res)

    def _json_or_raise(self, res: httpx.Response) -> dict[str, Any]:
        try:
            data = res.json()
        except ValueError as exc:
            raise MetaApiError(f"meta_invalid_json:{res.status_code}") from exc
        if res.status_code >= 400 or "error" in data:
            detail = data.get("error", {}).get("message") or res.text
            raise MetaApiError(f"meta_api_error:{detail}")
        return data


def normalize_webhook_events(payload: dict[str, Any]) -> list[dict[str, Any]]:
    events: list[dict[str, Any]] = []
    obj = payload.get("object")
    platform: SocialPlatform = "instagram" if obj == "instagram" else "facebook"
    for entry in payload.get("entry", []):
        for messaging in entry.get("messaging", []):
            message = messaging.get("message") or {}
            sender_id = str((messaging.get("sender") or {}).get("id") or "")
            recipient_id = str((messaging.get("recipient") or {}).get("id") or entry.get("id") or "")
            text = message.get("text") or ""
            attachments = message.get("attachments") or []
            meta_message_id = message.get("mid")
            if not sender_id or (not text and not attachments):
                continue
            events.append(
                {
                    "platform": platform,
                    "page_id": recipient_id,
                    "sender_id": sender_id,
                    "conversation_id": messaging.get("thread_id") or f"{platform}:{recipient_id}:{sender_id}",
                    "content": text,
                    "attachments": attachments,
                    "meta_message_id": meta_message_id,
                    "timestamp": datetime.utcfromtimestamp((messaging.get("timestamp") or 0) / 1000)
                    if messaging.get("timestamp")
                    else datetime.utcnow(),
                }
            )
    return events


async def find_or_create_social_client(
    db: AsyncIOMotorDatabase,
    *,
    platform: SocialPlatform,
    sender_id: str,
    profile_name: str | None = None,
) -> dict[str, Any]:
    field = "instagram_id" if platform == "instagram" else "facebook_id"
    existing = await db.clients.find_one({field: sender_id})
    if existing:
        return existing
    doc = {
        "_id": ObjectId(),
        "email": f"{platform}-{sender_id}@social.local",
        "name": profile_name or f"{platform.title()} User {sender_id[-6:]}",
        "default_owner_id": None,
        field: sender_id,
    }
    await db.clients.insert_one(doc)
    return doc


async def get_or_create_social_conversation(
    db: AsyncIOMotorDatabase,
    *,
    platform: SocialPlatform,
    conversation_id: str,
    page_id: str,
    client: dict[str, Any],
) -> dict[str, Any]:
    convo = await db.social_conversations.find_one({"platform": platform, "conversation_id": conversation_id})
    if convo:
        return convo

    open_case = await db.cases.find_one(
        {"client_id": str(client["_id"]), "status": "open"},
        sort=[("created_at", -1)],
    )
    if open_case:
        case_id = open_case["_id"]
        assigned_to = open_case["assigned_to"]
    else:
        assigned_to = await pick_assignee(db, client)
        case_id = await next_case_id(db)
        now = datetime.utcnow()
        await db.cases.insert_one(
            {
                "_id": case_id,
                "client_id": str(client["_id"]),
                "assigned_to": assigned_to,
                "status": "open",
                "created_at": now,
                "last_message_at": None,
                "last_message_preview": None,
                "last_sender_type": None,
            }
        )

    now = datetime.utcnow()
    doc = {
        "_id": ObjectId(),
        "platform": platform,
        "conversation_id": conversation_id,
        "page_id": page_id,
        "client_id": str(client["_id"]),
        "case_id": case_id,
        "assigned_to": assigned_to,
        "last_message": None,
        "updated_at": now,
    }
    await db.social_conversations.insert_one(doc)
    return doc


async def ingest_social_event(db: AsyncIOMotorDatabase, event: dict[str, Any]) -> dict[str, str]:
    platform: SocialPlatform = event["platform"]
    dup = None
    if event.get("meta_message_id"):
        dup = await db.messages.find_one({"meta_message_id": event["meta_message_id"]})
    if dup:
        return {"message_id": str(dup["_id"]), "duplicate": "true"}

    client = await find_or_create_social_client(db, platform=platform, sender_id=event["sender_id"])
    convo = await get_or_create_social_conversation(
        db,
        platform=platform,
        conversation_id=event["conversation_id"],
        page_id=event.get("page_id", ""),
        client=client,
    )

    attachments = [
        {
            "filename": att.get("type", "attachment"),
            "url": (att.get("payload") or {}).get("url", ""),
            "size": 0,
            "content_type": att.get("type", "application/octet-stream"),
        }
        for att in event.get("attachments", [])
    ]
    now = event.get("timestamp") or datetime.utcnow()
    content = event.get("content") or ""
    msg = {
        "_id": ObjectId(),
        "type": "social",
        "platform": platform,
        "conversation_id": event["conversation_id"],
        "thread_id": str(convo["_id"]),
        "sender_type": "client",
        "sender_id": str(client["_id"]),
        "content": content,
        "attachments": attachments,
        "timestamp": now,
        "meta_message_id": event.get("meta_message_id"),
    }
    await db.messages.insert_one(msg)
    await db.social_conversations.update_one(
        {"_id": convo["_id"]},
        {"$set": {"last_message": content[:280], "updated_at": now}},
    )
    await db.cases.update_one(
        {"_id": convo["case_id"]},
        {
            "$set": {
                "last_message_at": now,
                "last_message_preview": content[:280],
                "last_sender_type": "client",
            }
        },
    )
    return {"case_id": convo["case_id"], "conversation_id": str(convo["_id"]), "message_id": str(msg["_id"])}


async def social_access_filter(user_role: Literal["admin", "employee"], user_id: str) -> dict[str, Any]:
    if user_role == "admin":
        return {}
    return {"assigned_to": user_id}

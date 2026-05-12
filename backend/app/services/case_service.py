"""Case / client ingestion and assignment."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Any

from bson import ObjectId
from bson.errors import InvalidId
from pymongo import ReturnDocument

from app.services.gmail_service import GmailService, ParsedGmailMessage
from app.services.r2_service import R2Service
from app.utils.email_parse import extract_case_id_from_subject, normalize_email
from app.utils.ids import next_case_id

if TYPE_CHECKING:
    from motor.motor_asyncio import AsyncIOMotorDatabase


async def find_or_create_client(db: AsyncIOMotorDatabase, email: str, name: str) -> dict[str, Any]:
    norm = normalize_email(email)
    existing = await db.clients.find_one({"email": norm})
    if existing:
        return existing
    doc = {
        "_id": ObjectId(),
        "email": norm,
        "name": name or norm.split("@")[0],
        "default_owner_id": None,
    }
    await db.clients.insert_one(doc)
    return doc


async def pick_assignee(db: AsyncIOMotorDatabase, client: dict[str, Any]) -> str:
    """Prefer client.default_owner_id; else round-robin among employees (sorted by _id)."""
    if client.get("default_owner_id"):
        owner = client["default_owner_id"]
        return str(owner) if not isinstance(owner, str) else owner

    state = await db.sync_state.find_one_and_update(
        {"_id": "assign"},
        {"$inc": {"rr": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    rr = int(state.get("rr", 0)) if state else 0

    employees = await db.users.find({"role": "employee"}).sort("_id", 1).to_list(500)
    if employees:
        pick = employees[rr % len(employees)]
        return str(pick["_id"])

    admins = await db.users.find({"role": "admin"}).sort("_id", 1).to_list(50)
    if admins:
        return str(admins[0]["_id"])

    raise RuntimeError("no_users_for_assignment")


def _thread_oid_from_message_ref(thread_id_val: str) -> ObjectId | None:
    try:
        return ObjectId(thread_id_val)
    except InvalidId:
        return None


async def ingest_inbound_message(
    db: AsyncIOMotorDatabase,
    r2: R2Service,
    gmail: GmailService,
    parsed: ParsedGmailMessage,
) -> dict[str, str]:
    if not parsed.gmail_message_id:
        raise ValueError("missing_gmail_message_id")

    dup = await db.messages.find_one({"gmail_message_id": parsed.gmail_message_id})
    if dup:
        oid = _thread_oid_from_message_ref(dup["thread_id"])
        th = await db.threads.find_one({"_id": oid}) if oid else None
        cid = th["case_id"] if th else ""
        return {
            "case_id": cid,
            "thread_id": dup["thread_id"],
            "message_id": str(dup["_id"]),
            "duplicate": True,
        }

    sender_email = normalize_email(parsed.from_email)
    client = await find_or_create_client(db, sender_email, parsed.from_name or "")

    thread = await db.threads.find_one({"gmail_thread_id": parsed.gmail_thread_id})
    case_id: str
    thread_id_str: str

    if thread:
        case_id = thread["case_id"]
        thread_id_str = str(thread["_id"])
    else:
        case_id_resolved: str | None = None
        subj_case = extract_case_id_from_subject(parsed.subject)
        if subj_case:
            cd = await db.cases.find_one({"_id": subj_case})
            if cd and cd.get("client_id") == str(client["_id"]):
                case_id_resolved = cd["_id"]

        if case_id_resolved is None:
            open_case = await db.cases.find_one(
                {"client_id": str(client["_id"]), "status": "open"},
                sort=[("created_at", -1)],
            )
            if open_case:
                case_id_resolved = open_case["_id"]
            else:
                assignee = await pick_assignee(db, client)
                case_id_resolved = await next_case_id(db)
                now = datetime.utcnow()
                await db.cases.insert_one(
                    {
                        "_id": case_id_resolved,
                        "client_id": str(client["_id"]),
                        "assigned_to": assignee,
                        "status": "open",
                        "created_at": now,
                        "last_message_at": None,
                        "last_message_preview": None,
                        "last_sender_type": None,
                    }
                )

        case_id = case_id_resolved
        new_thread = {
            "_id": ObjectId(),
            "gmail_thread_id": parsed.gmail_thread_id,
            "case_id": case_id,
        }
        await db.threads.insert_one(new_thread)
        thread_id_str = str(new_thread["_id"])

    att_meta: list[dict[str, Any]] = []
    for att in parsed.attachments:
        if "data_bytes" in att:
            data = att["data_bytes"]
            mime = att.get("mime_type", "application/octet-stream")
            fn = att.get("filename", "attachment")
        else:
            data, mime = gmail.download_attachment(att["message_id"], att["attachment_id"])
            fn = att.get("filename", "attachment")
        up = await r2.upload_attachment(case_id, fn, data, mime)
        att_meta.append(
            {
                "filename": fn,
                "url": up["url"],
                "size": up["size"],
                "content_type": mime,
            }
        )

    preview = (parsed.body_text or "")[:280]
    now = parsed.timestamp or datetime.utcnow()
    msg_doc = {
        "_id": ObjectId(),
        "thread_id": thread_id_str,
        "sender_type": "client",
        "sender_id": str(client["_id"]),
        "content": parsed.body_text or "",
        "attachments": att_meta,
        "timestamp": now,
        "gmail_message_id": parsed.gmail_message_id,
        "internet_message_id": parsed.internet_message_id,
    }
    await db.messages.insert_one(msg_doc)

    await db.cases.update_one(
        {"_id": case_id},
        {
            "$set": {
                "last_message_at": now,
                "last_message_preview": preview,
                "last_sender_type": "client",
            }
        },
    )

    return {
        "case_id": case_id,
        "thread_id": thread_id_str,
        "message_id": str(msg_doc["_id"]),
        "duplicate": False,
    }

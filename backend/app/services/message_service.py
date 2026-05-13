"""Outbound employee messages via Gmail + R2."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Any

from bson import ObjectId

from app.services.gmail_service import GmailService
from app.services.r2_service import R2Service
from app.services.case_service import find_or_create_client
from app.utils.ids import next_case_id

if TYPE_CHECKING:
    from motor.motor_asyncio import AsyncIOMotorDatabase


async def send_employee_message(
    db: AsyncIOMotorDatabase,
    r2: R2Service,
    gmail: GmailService,
    *,
    case_id: str,
    employee_user_id: str,
    content: str,
    files: list[tuple[str, bytes, str]],
    client_email: str,
) -> dict[str, str]:
    case = await db.cases.find_one({"_id": case_id})
    if not case:
        raise ValueError("case_not_found")

    threads = await db.threads.find({"case_id": case_id}).sort("_id", 1).to_list(100)
    thread_ids = [str(t["_id"]) for t in threads]

    last_inbound = None
    if thread_ids:
        last_inbound = await db.messages.find_one(
            {"thread_id": {"$in": thread_ids}, "sender_type": "client"},
            sort=[("timestamp", -1)],
        )

    in_reply_to = None
    references = None
    if last_inbound and last_inbound.get("internet_message_id"):
        mid = last_inbound["internet_message_id"].strip()
        in_reply_to = mid
        references = mid

    thread = threads[0] if threads else None
    if not thread:
        tid = ObjectId()
        await db.threads.insert_one(
            {
                "_id": tid,
                "gmail_thread_id": f"local-{case_id}",
                "case_id": case_id,
            }
        )
        thread = await db.threads.find_one({"_id": tid})
        thread_ids = [str(thread["_id"])]
    thread_id_str = str(thread["_id"])

    att_meta: list[dict[str, Any]] = []
    att_for_gmail: list[tuple[str, bytes, str]] = []
    for fn, data, ctype in files:
        up = await r2.upload_attachment(case_id, fn, data, ctype or "application/octet-stream")
        att_meta.append(
            {
                "filename": fn,
                "url": up["url"],
                "size": up["size"],
                "content_type": ctype or "application/octet-stream",
            }
        )
        att_for_gmail.append((fn, data, ctype or "application/octet-stream"))

    subj = f"[{case_id}] Reply"
    body_html = f"<div style='font-family:sans-serif'>{content.replace(chr(10), '<br/>')}</div>"
    gthread, gmsg = gmail.send_email(
        to=client_email,
        subject=subj,
        body_html=body_html,
        body_text=content,
        in_reply_to=in_reply_to,
        references=references,
        attachments=att_for_gmail if att_for_gmail else None,
    )

    await db.threads.update_one(
        {"_id": thread["_id"]},
        {"$set": {"gmail_thread_id": gthread}},
    )

    preview = content[:280]
    now = datetime.utcnow()
    msg_doc = {
        "_id": ObjectId(),
        "thread_id": thread_id_str,
        "sender_type": "employee",
        "sender_id": employee_user_id,
        "content": content,
        "attachments": att_meta,
        "timestamp": now,
        "gmail_message_id": gmsg,
        "internet_message_id": None,
    }
    await db.messages.insert_one(msg_doc)

    await db.cases.update_one(
        {"_id": case_id},
        {
            "$set": {
                "last_message_at": now,
                "last_message_preview": preview,
                "last_sender_type": "employee",
            }
        },
    )

    return {"message_id": str(msg_doc["_id"]), "gmail_message_id": gmsg}


async def send_new_employee_email(
    db: AsyncIOMotorDatabase,
    r2: R2Service,
    gmail: GmailService,
    *,
    employee_user_id: str,
    recipient_email: str,
    recipient_name: str,
    subject: str,
    content: str,
    files: list[tuple[str, bytes, str]],
) -> dict[str, str]:
    client = await find_or_create_client(db, recipient_email, recipient_name)
    case_id = await next_case_id(db)
    now = datetime.utcnow()

    att_meta: list[dict[str, Any]] = []
    att_for_gmail: list[tuple[str, bytes, str]] = []
    for fn, data, ctype in files:
        safe_ctype = ctype or "application/octet-stream"
        up = await r2.upload_attachment(case_id, fn, data, safe_ctype)
        att_meta.append(
            {
                "filename": fn,
                "url": up["url"],
                "size": up["size"],
                "content_type": safe_ctype,
            }
        )
        att_for_gmail.append((fn, data, safe_ctype))

    await db.cases.insert_one(
        {
            "_id": case_id,
            "client_id": str(client["_id"]),
            "assigned_to": employee_user_id,
            "status": "open",
            "created_at": now,
            "last_message_at": None,
            "last_message_preview": None,
            "last_sender_type": None,
        }
    )

    clean_subject = subject.strip() or "Message from LeoTheTechGuy"
    tagged_subject = f"[{case_id}] {clean_subject}"
    body_html = f"<div style='font-family:sans-serif'>{content.replace(chr(10), '<br/>')}</div>"
    gthread, gmsg = gmail.send_email(
        to=client["email"],
        subject=tagged_subject,
        body_html=body_html,
        body_text=content,
        attachments=att_for_gmail if att_for_gmail else None,
    )

    thread_oid = ObjectId()
    await db.threads.insert_one(
        {
            "_id": thread_oid,
            "gmail_thread_id": gthread or f"local-{case_id}",
            "case_id": case_id,
        }
    )

    preview = content[:280]
    msg_doc = {
        "_id": ObjectId(),
        "thread_id": str(thread_oid),
        "sender_type": "employee",
        "sender_id": employee_user_id,
        "content": content,
        "attachments": att_meta,
        "timestamp": now,
        "gmail_message_id": gmsg,
        "internet_message_id": None,
    }
    await db.messages.insert_one(msg_doc)

    await db.cases.update_one(
        {"_id": case_id},
        {
            "$set": {
                "last_message_at": now,
                "last_message_preview": preview,
                "last_sender_type": "employee",
            }
        },
    )

    return {"case_id": case_id, "message_id": str(msg_doc["_id"]), "gmail_message_id": gmsg}

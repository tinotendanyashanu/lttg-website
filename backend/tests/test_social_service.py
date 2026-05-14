from datetime import datetime

import pytest
from bson import ObjectId
from mongomock_motor import AsyncMongoMockClient

from app.services.meta_service import ingest_social_event


@pytest.mark.asyncio
async def test_social_webhook_ingest_creates_client_case_conversation_and_message():
    db = AsyncMongoMockClient()["t"]
    employee_id = ObjectId()
    await db.users.insert_one(
        {"_id": employee_id, "name": "Emp", "role": "employee", "email": "emp@example.com"}
    )

    result = await ingest_social_event(
        db,
        {
            "platform": "instagram",
            "page_id": "page-1",
            "sender_id": "ig-user-1",
            "conversation_id": "ig-thread-1",
            "content": "Hello from Instagram",
            "attachments": [],
            "meta_message_id": "mid-1",
            "timestamp": datetime.utcnow(),
        },
    )

    assert result["case_id"].startswith("CASE-")
    client = await db.clients.find_one({"instagram_id": "ig-user-1"})
    assert client is not None
    case = await db.cases.find_one({"_id": result["case_id"]})
    assert case["assigned_to"] == str(employee_id)
    convo = await db.social_conversations.find_one({"conversation_id": "ig-thread-1"})
    assert convo["case_id"] == result["case_id"]
    message = await db.messages.find_one({"meta_message_id": "mid-1"})
    assert message["type"] == "social"
    assert message["platform"] == "instagram"


@pytest.mark.asyncio
async def test_social_webhook_ingest_is_idempotent_by_meta_message_id():
    db = AsyncMongoMockClient()["t"]
    employee_id = ObjectId()
    await db.users.insert_one(
        {"_id": employee_id, "name": "Emp", "role": "employee", "email": "emp@example.com"}
    )

    event = {
        "platform": "facebook",
        "page_id": "page-1",
        "sender_id": "fb-user-1",
        "conversation_id": "fb-thread-1",
        "content": "Hello from Facebook",
        "attachments": [],
        "meta_message_id": "mid-2",
        "timestamp": datetime.utcnow(),
    }

    await ingest_social_event(db, event)
    second = await ingest_social_event(db, event)

    assert second["duplicate"] == "true"
    assert await db.messages.count_documents({"meta_message_id": "mid-2"}) == 1
    assert await db.cases.count_documents({}) == 1

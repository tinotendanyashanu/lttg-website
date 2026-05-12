from datetime import datetime

import pytest
from bson import ObjectId
from mongomock_motor import AsyncMongoMockClient

from app.services.case_service import ingest_inbound_message
from app.services.gmail_service import ParsedGmailMessage


@pytest.mark.asyncio
async def test_ingest_inbound_idempotent():
    db = AsyncMongoMockClient()["t"]
    eid = ObjectId()
    await db.users.insert_one(
        {"_id": eid, "name": "Emp", "role": "employee", "email": "emp@example.com"}
    )

    class FakeGmail:
        def download_attachment(self, _mid: str, _aid: str):
            return b"data", "application/octet-stream"

    class FakeR2:
        async def upload_attachment(self, *_a, **_kw):
            return {"url": "https://example.com/f", "key": "k", "size": 4}

    parsed = ParsedGmailMessage(
        gmail_thread_id="thr1",
        gmail_message_id="gm1",
        from_email="client@example.com",
        from_name="Client",
        to=["inbox@example.com"],
        subject="Hello",
        body_text="Body",
        body_html=None,
        attachments=[],
        timestamp=datetime.utcnow(),
        internet_message_id="<abc@mail>",
    )

    r1 = await ingest_inbound_message(db, FakeR2(), FakeGmail(), parsed)
    assert r1.get("duplicate") is False
    r2 = await ingest_inbound_message(db, FakeR2(), FakeGmail(), parsed)
    assert r2.get("duplicate") is True

    assert await db.messages.count_documents({}) == 1
    assert await db.cases.count_documents({}) == 1

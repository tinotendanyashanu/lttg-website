from mongomock_motor import AsyncMongoMockClient

from app.services.sync_service import sync_gmail_once


class FailingGmail:
    def list_recent_message_ids(self, *_args, **_kwargs):
        raise AssertionError("Gmail should not be polled without assignable users")


class FakeR2:
    pass


async def test_sync_defers_when_no_assignable_users():
    db = AsyncMongoMockClient()["t"]

    result = await sync_gmail_once(db, FailingGmail(), FakeR2())

    state = await db.sync_state.find_one({"_id": "gmail"})
    assert result == {"fetched": 0, "ingested": 0, "skipped": 0}
    assert state["lock_until"] is None
    assert "last_history_id" not in state or state["last_history_id"] is None

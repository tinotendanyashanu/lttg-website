import pytest
from mongomock_motor import AsyncMongoMockClient

from app.services.message_service import send_new_employee_email
from app.services.r2_service import StorageUploadError


@pytest.mark.asyncio
async def test_send_new_email_does_not_create_case_when_upload_fails():
    db = AsyncMongoMockClient()["t"]

    class FailingR2:
        async def upload_attachment(self, *_args, **_kwargs):
            raise StorageUploadError("r2_put_object_failed:Unauthorized")

    class FakeGmail:
        def send_email(self, **_kwargs):
            raise AssertionError("gmail should not send when attachment upload fails")

    with pytest.raises(StorageUploadError):
        await send_new_employee_email(
            db,
            FailingR2(),
            FakeGmail(),
            employee_user_id="employee-1",
            recipient_email="client@example.com",
            recipient_name="Client",
            subject="Hello",
            content="Body",
            files=[("file.txt", b"data", "text/plain")],
        )

    assert await db.cases.count_documents({}) == 0
    assert await db.threads.count_documents({}) == 0
    assert await db.messages.count_documents({}) == 0

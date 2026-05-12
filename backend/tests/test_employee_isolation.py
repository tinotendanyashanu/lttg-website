import pytest
from bson import ObjectId
from mongomock_motor import AsyncMongoMockClient
from fastapi import HTTPException

from app.models.user import UserDoc
from app.routers.cases import get_case


@pytest.mark.asyncio
async def test_employee_cannot_fetch_peer_case():
    db = AsyncMongoMockClient()["t"]
    a = ObjectId()
    b = ObjectId()
    await db.users.insert_many(
        [
            {"_id": a, "name": "A", "role": "employee", "email": "a@x.com"},
            {"_id": b, "name": "B", "role": "employee", "email": "b@x.com"},
        ]
    )
    cid = ObjectId()
    await db.clients.insert_one(
        {"_id": cid, "email": "c@client.com", "name": "C", "default_owner_id": None}
    )
    await db.cases.insert_one(
        {
            "_id": "CASE-0001",
            "client_id": str(cid),
            "assigned_to": str(b),
            "status": "open",
            "created_at": __import__("datetime").datetime.utcnow(),
        }
    )

    user_a = UserDoc.model_validate(
        {"_id": str(a), "name": "A", "role": "employee", "email": "a@x.com"}
    )

    with pytest.raises(HTTPException) as exc:
        await get_case("CASE-0001", user_a, db)
    assert exc.value.status_code == 403

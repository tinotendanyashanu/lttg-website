"""CASE-XXXX id generation (atomic counter)."""

from typing import TYPE_CHECKING

from pymongo import ReturnDocument

if TYPE_CHECKING:
    from motor.motor_asyncio import AsyncIOMotorDatabase


async def next_case_id(db: "AsyncIOMotorDatabase") -> str:
    doc = await db.counters.find_one_and_update(
        {"_id": "case"},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    seq = int(doc["seq"]) if doc else 1
    return f"CASE-{seq:04d}"

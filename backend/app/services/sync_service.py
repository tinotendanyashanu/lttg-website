"""Gmail polling + manual sync with distributed lock."""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timedelta
from typing import TYPE_CHECKING, Any

from app.services.case_service import ingest_inbound_message
from app.services.gmail_service import GmailAuthError, GmailService
from app.services.r2_service import R2Service

if TYPE_CHECKING:
    from motor.motor_asyncio import AsyncIOMotorDatabase

    from app.config import Settings

logger = logging.getLogger(__name__)


async def sync_gmail_once(
    db: AsyncIOMotorDatabase,
    gmail: GmailService,
    r2: R2Service,
    *,
    max_results: int = 50,
) -> dict[str, int]:
    """Single sync pass; respects lock in sync_state."""
    now = datetime.utcnow()
    lock_ttl = timedelta(seconds=120)
    st = await db.sync_state.find_one({"_id": "gmail"})
    if st and st.get("lock_until") and st["lock_until"] > now:
        logger.info("sync skipped: lock held")
        return {"fetched": 0, "ingested": 0, "skipped": 0}

    await db.sync_state.update_one(
        {"_id": "gmail"},
        {
            "$set": {"lock_until": now + lock_ttl},
            "$setOnInsert": {"last_history_id": None},
        },
        upsert=True,
    )

    fetched = ingested = skipped = 0
    try:
        hid = None
        if st:
            hid = st.get("last_history_id")

        ids, new_hid, _used_hist = gmail.list_recent_message_ids(hid, max_results=max_results)
        fetched = len(ids)

        for mid in ids:
            try:
                raw = gmail.fetch_message(mid)
                parsed = gmail.parse_message(raw)
                res = await ingest_inbound_message(db, r2, gmail, parsed)
                if res.get("duplicate"):
                    skipped += 1
                else:
                    ingested += 1
            except Exception as e:
                logger.warning("ingest skip for %s: %s", mid, e)
                skipped += 1

        update: dict[str, Any] = {"lock_until": None, "updated_at": datetime.utcnow()}
        if new_hid:
            update["last_history_id"] = new_hid
        await db.sync_state.update_one({"_id": "gmail"}, {"$set": update})
    except Exception:
        await db.sync_state.update_one({"_id": "gmail"}, {"$set": {"lock_until": None}})
        raise

    return {"fetched": fetched, "ingested": ingested, "skipped": skipped}


def start_background_sync(
    db: AsyncIOMotorDatabase,
    gmail: GmailService,
    r2: R2Service,
    settings: Settings,
) -> asyncio.Task:
    interval = max(15, settings.sync_interval_seconds)

    async def _loop() -> None:
        while True:
            try:
                res = await sync_gmail_once(db, gmail, r2)
                logger.info("background sync: %s", res)
            except GmailAuthError as e:
                logger.error("background sync stopped: %s", e)
                return
            except Exception as e:
                logger.exception("background sync failed: %s", e)
            await asyncio.sleep(interval)

    return asyncio.create_task(_loop())

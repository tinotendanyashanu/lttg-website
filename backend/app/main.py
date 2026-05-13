"""FastAPI application entry."""

from contextlib import asynccontextmanager
import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

from app.config import get_settings
from app.routers import cases, health, messages, sync
from app.services.gmail_service import GmailService
from app.services.r2_service import R2Service
from app.services.sync_service import start_background_sync

logger = logging.getLogger(__name__)


async def ensure_indexes(db) -> None:
    await db.clients.create_index("email", unique=True)
    await db.threads.create_index("gmail_thread_id", unique=True)
    await db.messages.create_index([("thread_id", 1), ("timestamp", 1)])
    await db.cases.create_index([("assigned_to", 1), ("status", 1)])
    await db.messages.create_index(
        "gmail_message_id",
        unique=True,
        partialFilterExpression={
            "gmail_message_id": {"$type": "string", "$gt": ""},
        },
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.basicConfig(level=logging.INFO)
    settings = get_settings()
    mongo = AsyncIOMotorClient(settings.mongodb_uri)
    db = mongo[settings.mongodb_db_name]
    await ensure_indexes(db)

    app.state.mongo_client = mongo
    app.state.db = db
    app.state.settings = settings
    app.state.gmail = GmailService(settings)
    app.state.r2 = R2Service(settings)

    disable_sync = os.getenv("DISABLE_BACKGROUND_SYNC", "").lower() in ("1", "true", "yes")
    if disable_sync:
        app.state.sync_task = None
    else:
        app.state.sync_task = start_background_sync(db, app.state.gmail, app.state.r2, settings)

    yield

    st = getattr(app.state, "sync_task", None)
    if st is not None:
        st.cancel()
        try:
            await st
        except Exception:
            pass
    mongo.close()


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="Mail Cases API", lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(cases.router)
    app.include_router(cases.clients_router)
    app.include_router(messages.router)
    app.include_router(sync.router)
    return app


app = create_app()

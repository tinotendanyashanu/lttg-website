"""Message in a thread."""

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


class AttachmentMeta(BaseModel):
    filename: str
    url: str
    size: int
    content_type: str


class MessageDoc(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    thread_id: str
    sender_type: Literal["employee", "client"]
    sender_id: str | None = None
    content: str
    attachments: list[dict[str, Any]] = Field(default_factory=list)
    timestamp: datetime
    gmail_message_id: str | None = None
    internet_message_id: str | None = None

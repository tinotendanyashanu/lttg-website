"""Mail case (string id CASE-XXXX)."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class CaseDoc(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    client_id: str
    assigned_to: str
    status: Literal["open", "closed"]
    created_at: datetime
    last_message_at: datetime | None = None
    last_message_preview: str | None = None
    last_sender_type: Literal["employee", "client"] | None = None

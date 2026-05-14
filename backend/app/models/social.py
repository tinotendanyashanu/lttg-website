"""Social media integration models."""

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

SocialPlatform = Literal["facebook", "instagram"]
PostStatus = Literal["draft", "scheduled", "published"]


class SocialAccountDoc(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    platform: SocialPlatform
    page_id: str
    instagram_business_id: str | None = None
    access_token: str
    connected_by: str
    created_at: datetime


class SocialConversationDoc(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    platform: SocialPlatform
    conversation_id: str
    client_id: str
    case_id: str
    assigned_to: str
    last_message: str | None = None
    updated_at: datetime
    profile_name: str | None = None
    profile_image_url: str | None = None


class SocialMessageDoc(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    type: Literal["social"] = "social"
    platform: SocialPlatform
    conversation_id: str
    sender_type: Literal["client", "employee"]
    sender_id: str | None = None
    content: str
    attachments: list[dict[str, Any]] = Field(default_factory=list)
    timestamp: datetime
    meta_message_id: str | None = None


class PostDoc(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    platform: SocialPlatform
    content: str
    media_urls: list[str] = Field(default_factory=list)
    status: PostStatus
    scheduled_time: datetime | None = None
    created_by: str
    created_at: datetime
    published_at: datetime | None = None

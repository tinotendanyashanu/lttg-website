"""User document (mirrors portal Account id in _id)."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class UserDoc(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: str = Field(alias="_id")
    name: str
    role: Literal["admin", "employee"]
    email: str

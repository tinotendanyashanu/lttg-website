"""External email client record."""

from pydantic import BaseModel, ConfigDict, Field


class ClientDoc(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    email: str
    name: str
    default_owner_id: str | None = None

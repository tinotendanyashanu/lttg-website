"""Gmail thread linked to a case."""

from pydantic import BaseModel, ConfigDict, Field


class ThreadDoc(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    gmail_thread_id: str
    case_id: str

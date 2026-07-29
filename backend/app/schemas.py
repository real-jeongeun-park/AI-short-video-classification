from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ItemBase(BaseModel):
    name: str
    description: Optional[str] = None


class ItemCreate(ItemBase):
    pass


class ItemOut(ItemBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

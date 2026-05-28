from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, field_validator


class InventoryAdjustment(BaseModel):
    quantity_change: int
    reason: str

    @field_validator("reason")
    @classmethod
    def reason_must_not_be_empty(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("reason cannot be empty")
        return stripped


class InventoryLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity_change: int
    reason: str
    created_at: datetime


class InventoryProductResponse(BaseModel):
    id: int
    name: str
    sku: str
    quantity_in_stock: int
    price: Decimal
    recent_logs: list[InventoryLogResponse] = []

from decimal import Decimal
from typing import Any

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)


# ============================================================
# INVENTORY
# ============================================================

class InventoryCreateRequest(BaseModel):
    quantity: int = Field(
        ge=0
    )


class InventoryUpdateRequest(BaseModel):
    quantity: int = Field(
        ge=0
    )


class InventoryStockResponse(BaseModel):
    id: int
    product_variant_id: int
    quantity: int

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# INVENTORY PRODUCT
# ============================================================

class InventoryProductResponse(BaseModel):
    id: int
    name: str
    category_id: int | None = None
    brand_id: int | None = None
    average_rating: float | None = None
    is_active: bool

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# INVENTORY VARIANT
# ============================================================

class InventoryVariantResponse(BaseModel):
    id: int
    sku: str
    product_id: int
    price: Decimal
    discount_percentage: Decimal | None = None
    attributes: dict[str, Any] | None = None
    is_active: bool

    product: InventoryProductResponse
    inventory: InventoryStockResponse | None = None

    model_config = ConfigDict(
        from_attributes=True
    )
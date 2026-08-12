from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel

from schemas.product import ProductResponse, ProductVariantResponse




class ItemAddRequest (BaseModel):
    variant_id: int
    quantity: int


class CartResponse (BaseModel):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    items: list[CartItemResponse]


class CartItemResponse (BaseModel):
    product_variant: ProductVariantResponse
    quantity: int
    price: Decimal


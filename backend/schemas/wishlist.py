from datetime import datetime

from pydantic import BaseModel

from schemas.product import ProductResponse


class WishlistResponse (BaseModel):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    items: list[WishlistProductResponse]


class WishlistProductResponse (BaseModel):
    product: ProductResponse

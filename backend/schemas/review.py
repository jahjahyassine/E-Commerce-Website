from datetime import datetime

from pydantic import BaseModel

from schemas.product import ProductResponse
from schemas.user import UserResponse



class ReviewCreate (BaseModel):
    review: str
    rating: int
    product_id: int


class ReviewUpdate (BaseModel):
    review: str | None = None
    rating: int | None = None
    product_id: int


class ReviewResponse (ReviewCreate):
    pass
    id: int
    user: UserResponse
    product: ProductResponse
    created_at: datetime
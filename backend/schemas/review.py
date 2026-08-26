from datetime import datetime

from pydantic import BaseModel

from schemas.product import ProductResponse
from schemas.user import UserResponse



class ReviewCreate (BaseModel):
    review: str
    rating: int
    product_id: int


class ReviewResponse (ReviewCreate):
    pass
    user: UserResponse
    product: ProductResponse
    created_at: datetime
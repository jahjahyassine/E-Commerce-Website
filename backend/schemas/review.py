from pydantic import BaseModel



class ReviewCreate (BaseModel):
    review: str
    rating: int
    product_id: int


class ReviewResponse (ReviewCreate):
    pass
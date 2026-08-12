from decimal import Decimal

from pydantic import BaseModel

from schemas.cart import CartResponse
from schemas.product import ProductVariantResponse


class OrderResponse (BaseModel):
    id: int
    user_id: int
    shipping_address: str
    order_status: str
    shipping_status: str
    payment_status: str
    total_amount: Decimal

    items: list[ProductVariantResponse]

    model_config = {
        'from_attributes': True
    }



class OrderCreate (BaseModel):
    id: int
    user_id: int
    shipping_address: str

    cart: CartResponse
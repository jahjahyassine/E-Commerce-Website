from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel

from schemas.cart import CartResponse
from schemas.product import ProductVariantResponse


class OrderResponse (BaseModel):
    id: int
    user_id: int
    shipping_address: str
    shipping_city: str
    shipping_region: str
    shipping_postal_code: str | None = None
    order_status: str
    shipping_status: str
    payment_status: str
    total_amount: Decimal

    created_at: datetime

    items: list[OrderItemResponse]

    model_config = {
        'from_attributes': True
    }


class OrderItemResponse (BaseModel):
    product_variant_id: int
    product_name: str
    variant_attributes_snapshot: dict
    quantity: int
    price: Decimal
    product_variant: ProductVariantResponse

class OrderCreate (BaseModel):
    full_name: str
    phone: str

    address: str
    city: str
    region: str
    postal_code: str | None = None
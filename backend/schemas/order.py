from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel

from models.order import OrderStatus, PaymentStatus, ShippingStatus
from schemas.user import UserOrderResponse, UserResponse
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

    user: UserOrderResponse

    model_config = {
        'from_attributes': True
    }


from pydantic import BaseModel


class StatusUpdate(BaseModel):
    order_status: OrderStatus | None = None
    shipping_status: ShippingStatus | None = None
    payment_status: PaymentStatus | None = None




    
class AdminOrderResponse (BaseModel):
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

    user: UserResponse

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


class StatusUpdate (BaseModel):
    shipping_status: str | None = None
    order_status: str | None = None
    payment_status: str | None = None
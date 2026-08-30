from pydantic import BaseModel, EmailStr
from typing import Optional


class UserRegister(BaseModel):
    username: str
    full_name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    identifier: str
    rememberOption: bool
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    full_name: str | None
    email: EmailStr
    role: str
    phone: str | None = None
    address: str | None = None
    city: str | None = None
    region: str | None = None
    postal_code: str | None = None
    is_active: bool
    profile_pic_path: str

    model_config = {
        "from_attributes": True
    }


class UserPatch(BaseModel):
    username: str | None = None
    full_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    address: str | None = None
    city: str | None = None
    region: str | None = None
    postal_code: str | None = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class DeleteAccountRequest(BaseModel):
    password: str


class CustomerOrderItemResponse(BaseModel):
    id: int
    product_variant_id: int
    product_name: str
    variant_attributes_snapshot: dict | None = None
    quantity: int
    price: float

    model_config = {
        "from_attributes": True
    }


class CustomerOrderResponse(BaseModel):
    id: int
    total_amount: float
    order_status: str
    shipping_status: str
    payment_status: str
    customer_name: str
    customer_phone: str
    shipping_address: str
    shipping_city: str
    shipping_region: str
    shipping_postal_code: str
    created_at: object
    items: list[CustomerOrderItemResponse] = []

    model_config = {
        "from_attributes": True
    }


class CustomerCartItemResponse(BaseModel):
    id: int
    product_variant_id: int
    quantity: int

    model_config = {
        "from_attributes": True
    }


class CustomerCartResponse(BaseModel):
    id: int
    items: list[CustomerCartItemResponse] = []

    model_config = {
        "from_attributes": True
    }


class CustomerReviewResponse(BaseModel):
    id: int
    product_id: int
    rating: int
    comment: str | None = None

    model_config = {
        "from_attributes": True
    }


class CustomerResponse(UserResponse):
    orders: list[CustomerOrderResponse] = []
    cart: CustomerCartResponse | None = None
    reviews: list[CustomerReviewResponse] = []

from pydantic import BaseModel


class StatusUpdate(BaseModel):
    order_status: str | None = None
    shipping_status: str | None = None
    payment_status: str | None = None


class OrderItemResponse(BaseModel):
    id: int
    product_variant_id: int
    product_name: str
    variant_attributes_snapshot: dict | None = None
    quantity: int
    price: float

    model_config = {
        "from_attributes": True
    }


class OrderResponse(BaseModel):
    id: int
    user_id: int
    customer_name: str
    customer_phone: str
    shipping_address: str
    shipping_city: str
    shipping_region: str
    shipping_postal_code: str
    total_amount: float
    order_status: str
    shipping_status: str
    payment_status: str
    created_at: object
    items: list[OrderItemResponse] = []

    model_config = {
        "from_attributes": True
    }

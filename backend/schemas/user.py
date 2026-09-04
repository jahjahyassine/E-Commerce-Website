from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from schemas.product import ProductVariantResponse



class UserRegister(BaseModel):
    username: str
    full_name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    identifier: str
    password: str
    rememberOption: bool




class UserResponse(BaseModel):
    id: int
    username: str
    full_name: str | None = None
    email: EmailStr
    role: str
    phone: str | None = None
    address: str | None = None
    city: str | None = None
    region: str | None = None
    postal_code: str | None = None
    is_active: bool
    profile_pic_path: str

    model_config = {"from_attributes": True}


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




class OrderItemResponse(BaseModel):
    order_id: int
    product_variant_id: int
    product_name: str
    variant_attributes_snapshot: dict | None = None
    quantity: int
    price: float

    model_config = {"from_attributes": True}




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
    created_at: datetime
    items: list[OrderItemResponse] = Field(default_factory=list)

    model_config = {"from_attributes": True}




class CustomerCartItemResponse(BaseModel):
    cart_id: int
    product_variant_id: int
    quantity: int
    product_variant: ProductVariantResponse

    model_config = {"from_attributes": True}


class CustomerCartResponse(BaseModel):
    id: int
    items: list[CustomerCartItemResponse] = Field(default_factory=list)

    model_config = {"from_attributes": True}




class CustomerReviewResponse(BaseModel):
    id: int
    product_id: int
    rating: int
    review: str | None = None

    model_config = {"from_attributes": True}




class CustomerResponse(UserResponse):
    orders: list[OrderResponse] = Field(default_factory=list)
    reviews: list[CustomerReviewResponse] = Field(default_factory=list)
    cart: CustomerCartResponse | None = None




class StatusUpdate(BaseModel):
    order_status: str | None = None
    shipping_status: str | None = None
    payment_status: str | None = None






class UserDeactivateRequest (BaseModel):
    user_id: int
    is_active: bool
from decimal import Decimal
from typing import Any

from fastapi import File, UploadFile
from pydantic import BaseModel, ConfigDict, Field



class BrandCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)

class BrandResponse(BaseModel):
    id: int
    name: str
    is_active: bool
    model_config = ConfigDict(from_attributes=True)


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)

class CategoryResponse(BaseModel):
    id: int
    name: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)

class TagCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)

class MediaResponse(BaseModel):
    id: int
    media_url: str

    model_config = ConfigDict(from_attributes=True)



class InventoryCreateRequest(BaseModel):
    quantity: int = Field(ge=0)

class InventoryResponse(BaseModel):
    quantity: int

    model_config = ConfigDict(from_attributes=True)




class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    specifications: dict[str, Any] | None = None
    brand_id: int
    category_id: int
    tags: list[str | None] = None


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    specifications: dict[str, Any] | None = None
    brand_id: int | None = None
    category_id: int | None = None
    is_active: bool | None = None

class ProductCreateRequest(BaseModel):
    product: ProductCreate
    media: list[UploadFile] = File(default_factory=list)

class ProductUpdateRequest(BaseModel):
    product: ProductUpdate
    media: list[str] | None = None

class ProductResponse(BaseModel):
    id: int
    name: str
    description: str | None

    min_price: Decimal
    average_rating: Decimal
    count_reviews: int

    specifications: dict[str, Any] | None

    brand_id: int
    category_id: int

    brand: BrandResponse
    category: CategoryResponse

    media: list[MediaResponse] = Field(default_factory=list)

    product_variants: list[ProductVariantResponse] = Field(
        default_factory=list
    )

    model_config = ConfigDict(from_attributes=True)


class ProductResponseBrief (BaseModel):
    id: int
    name: str
    description: str | None




class ProductVariantCreate(BaseModel):
    sku: str = Field(min_length=1, max_length=64)
    price: Decimal = Field(ge=0)

    discount_percentage: Decimal | None = Field(
        default=Decimal("0"),
        ge=0,
        le=100,
    )

    attributes: dict[str, Any] | None = None

class ProductVariantPatch(BaseModel):
    price: Decimal | None = Field(
        default=None,
        ge=0,
    )

    discount_percentage: Decimal | None = Field(
        default=None,
        ge=0,
        le=100,
    )

    attributes: dict[str, Any] | None = None


class ProductVariantCreateRequest(BaseModel):
    sku: str
    price: Decimal = Field(ge=0)
    discount_percentage: Decimal = Field(
        default=0,
        ge=0,
        le=100,
    )
    attributes: dict[str, Any] = Field(default_factory=dict)
    is_active: bool = True


class ProductVariantPatchRequest(BaseModel):
    product: ProductVariantPatch
    media: list[str] | None = None



class OrderItemResponse (BaseModel):
    order_id: int
    product_variant_id: int
    quantity: int
    price: Decimal


class ProductVariantResponse(BaseModel):
    id: int
    sku: str
    price: Decimal
    discount_percentage: Decimal | None = None
    attributes: dict[str, Any] | None = None
    is_active: bool
    product: ProductResponseBrief

    inventory: InventoryResponse | None = None

    order_items: list[OrderItemResponse | None] = None

    media: list[MediaResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)



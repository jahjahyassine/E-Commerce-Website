from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict, Field



class BrandCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)

class BrandResponse(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)

class CategoryResponse(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)



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

class ProductPatch(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    specifications: dict[str, Any] | None = None

class ProductCreateRequest(BaseModel):
    product: ProductCreate
    media: list[str] = Field(default_factory=list)

class ProductPatchRequest(BaseModel):
    product: ProductPatch
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
    product: ProductVariantCreate
    media: list[str] = Field(default_factory=list)

class ProductVariantPatchRequest(BaseModel):
    product: ProductVariantPatch
    media: list[str] | None = None

class ProductVariantResponse(BaseModel):
    id: int
    sku: str
    price: Decimal
    discount_percentage: Decimal | None = None
    attributes: dict[str, Any] | None = None
    is_active: bool
    product: ProductResponseBrief

    inventory: InventoryResponse | None = None

    media: list[MediaResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
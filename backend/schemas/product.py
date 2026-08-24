from decimal import Decimal
from typing import Any

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)

from schemas.inventory import InventoryStockResponse


# ============================================================
# BRAND
# ============================================================

class BrandCreate(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=100
    )


class BrandResponse(BaseModel):
    id: int
    name: str
    is_active: bool

    model_config = ConfigDict(
        from_attributes=True
    )


class BrandPatchRequest(BaseModel):
    name: str | None = None
    is_active: bool | None = None


# ============================================================
# CATEGORY
# ============================================================

class CategoryCreate(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=100
    )


class CategoryResponse(BaseModel):
    id: int
    name: str
    is_active: bool

    model_config = ConfigDict(
        from_attributes=True
    )


class CategoryPatchRequest(BaseModel):
    name: str | None = None
    is_active: bool | None = None


# ============================================================
# TAG
# ============================================================

class TagCreate(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=100
    )


# ============================================================
# MEDIA
# ============================================================

class MediaResponse(BaseModel):
    id: int
    media_url: str

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# PRODUCT
# ============================================================

class ProductCreate(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=255
    )

    description: str | None = None

    specifications: dict[str, Any] | None = None

    brand_id: int
    category_id: int

    tags: list[str] | None = None


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    specifications: dict[str, Any] | None = None
    brand_id: int | None = None
    category_id: int | None = None
    is_active: bool | None = None


class ProductCreateRequest(BaseModel):
    product: ProductCreate


class ProductUpdateRequest(BaseModel):
    product: ProductUpdate
    media: list[str] | None = None


class ProductResponseBrief(BaseModel):
    id: int
    name: str
    description: str | None

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# PRODUCT VARIANT
# ============================================================

class ProductVariantCreateRequest(BaseModel):
    sku: str = Field(
        min_length=1,
        max_length=64,
    )

    price: Decimal = Field(
        ge=0,
    )

    discount_percentage: Decimal = Field(
        default=Decimal("0"),
        ge=0,
        le=100,
    )

    attributes: dict[str, Any] = Field(
        default_factory=dict,
    )

    is_active: bool = True


class ProductVariantUpdate(BaseModel):
    sku: str | None = None

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

    is_active: bool | None = None

    quantity: int | None = Field(
        default=None,
        ge=0,
    )


class ProductVariantResponse(BaseModel):
    id: int
    sku: str
    price: Decimal
    discount_percentage: Decimal | None = None
    attributes: dict[str, Any] | None = None
    is_active: bool

    product: ProductResponseBrief | None = None

    inventory: InventoryStockResponse | None = None

    media: list[MediaResponse] = Field(
        default_factory=list
    )

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# PRODUCT RESPONSE
# ============================================================

class ProductResponse(BaseModel):
    id: int
    name: str
    description: str | None

    # IMPORTANT:
    # min_price belongs to Product.
    # It is calculated from the product's active variants.

    min_price: Decimal

    average_rating: Decimal
    count_reviews: int

    specifications: dict[str, Any] | None

    brand_id: int
    category_id: int

    brand: BrandResponse
    category: CategoryResponse

    media: list[MediaResponse] = Field(
        default_factory=list
    )

    product_variants: list[ProductVariantResponse] = Field(
        default_factory=list
    )

    model_config = ConfigDict(
        from_attributes=True
    )
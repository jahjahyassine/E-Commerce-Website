import json

from enum import Enum
from typing import Annotated, List

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy import exists, or_
from sqlalchemy.orm import Session

from models.review import Review
from schemas.review import ReviewResponse
from core.database import get_db

from models.product import (
    Brand,
    Category,
    Product,
    ProductVariant,
    Tag,
)

from schemas.product import (
    ProductRagResponse,
    ProductResponse,
    ProductVariantResponse,
)


router = APIRouter()


# ============================================================
# SORTING
# ============================================================

class SortBy(str, Enum):
    brand = "brand"
    price = "price"
    rating = "rating"


# ============================================================
# PRODUCTS
# ============================================================

@router.get(
    "/products",
    response_model=List[ProductResponse],
)
def get_products(
    db: Annotated[
        Session,
        Depends(get_db),
    ],
    category_id: int | None = None,
    brand_id: int | None = None,
    min_rating: float | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    search: str | None = None,
    is_active: bool | None = True,
    on_promotion: bool | None = None,
):
    query = db.query(Product)

    # --------------------------------------------------------
    # SEARCH
    # --------------------------------------------------------

    if search and search.strip():
        search_pattern = f"%{search.strip()}%"

        query = query.filter(
            or_(
                Product.name.ilike(search_pattern),
                Product.description.ilike(search_pattern),
            )
        )

    # --------------------------------------------------------
    # CATEGORY
    # --------------------------------------------------------

    if category_id is not None:
        query = query.filter(
            Product.category_id == category_id
        )

    # --------------------------------------------------------
    # BRAND
    # --------------------------------------------------------

    if brand_id is not None:
        query = query.filter(
            Product.brand_id == brand_id
        )

    # --------------------------------------------------------
    # MIN PRICE
    #
    # Product price is stored on ProductVariant.
    #
    # A product matches if at least one active variant
    # has a price >= min_price.
    # --------------------------------------------------------

    if min_price is not None:
        query = query.filter(
            exists().where(
                ProductVariant.product_id == Product.id,
                ProductVariant.price >= min_price,
                ProductVariant.is_active.is_(True),
            )
        )

    # --------------------------------------------------------
    # MAX PRICE
    #
    # A product matches if at least one active variant
    # has a price <= max_price.
    # --------------------------------------------------------

    if max_price is not None:
        query = query.filter(
            exists().where(
                ProductVariant.product_id == Product.id,
                ProductVariant.price <= max_price,
                ProductVariant.is_active.is_(True),
            )
        )

    # --------------------------------------------------------
    # RATING
    # --------------------------------------------------------

    if min_rating is not None:
        query = query.filter(
            Product.average_rating >= min_rating
        )

    # --------------------------------------------------------
    # STATUS
    # --------------------------------------------------------

    if is_active is not None:
        query = query.filter(
            Product.is_active == is_active
        )

    if on_promotion is True:
        query = query.filter(
            exists().where(
                ProductVariant.product_id == Product.id,
                ProductVariant.discount_percentage > 0,
                ProductVariant.is_active.is_(True),
            )
        )

    return query.all()



@router.get(
    "/test_rag",
    response_model=list[ProductRagResponse],
)
def get_products(
    db: Annotated[Session, Depends(get_db)],
):
    query = db.query(Product)


    return query.all()

# ============================================================
# SINGLE PRODUCT
# ============================================================

@router.get(
    "/products/{product_id}",
    response_model=ProductResponse,
)
def get_product_details(
    db: Annotated[
        Session,
        Depends(get_db),
    ],
    product_id: int,
):
    product = (
        db.query(Product)
        .filter(
            Product.id == product_id
        )
        .first()
    )

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    return product


# ============================================================
# PRODUCT VARIANTS
# ============================================================

@router.get(
    "/products/{product_id}/variants",
    response_model=list[ProductVariantResponse],
)
def get_product_variants(
    db: Annotated[
        Session,
        Depends(get_db),
    ],
    product_id: int,
    attributes: str | None = None,
):
    # --------------------------------------------------------
    # CHECK PRODUCT
    # --------------------------------------------------------

    product = (
        db.query(Product)
        .filter(
            Product.id == product_id
        )
        .first()
    )

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    # --------------------------------------------------------
    # QUERY VARIANTS
    # --------------------------------------------------------

    query = (
        db.query(ProductVariant)
        .filter(
            ProductVariant.product_id == product_id,
            ProductVariant.is_active.is_(True),
        )
    )

    # --------------------------------------------------------
    # FILTER BY ATTRIBUTES
    #
    # Example:
    #
    # ?attributes={"ram":"24GB","color":"Space Black"}
    # --------------------------------------------------------

    if attributes:
        try:
            selected_attributes = json.loads(
                attributes
            )
        except json.JSONDecodeError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid attributes JSON",
            )

        if not isinstance(
            selected_attributes,
            dict,
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Attributes must be a JSON object",
            )

        for key, value in selected_attributes.items():
            query = query.filter(
                ProductVariant.attributes[key].astext
                == str(value)
            )

    return query.all()


# ============================================================
# SINGLE VARIANT
# ============================================================

@router.get(
    "/products/{product_id}/variants/{variant_id}",
    response_model=ProductVariantResponse,
)
def get_product_variant(
    db: Annotated[
        Session,
        Depends(get_db),
    ],
    product_id: int,
    variant_id: int,
):
    variant = (
        db.query(ProductVariant)
        .filter(
            ProductVariant.id == variant_id,
            ProductVariant.product_id == product_id,
            ProductVariant.is_active.is_(True),
        )
        .first()
    )

    if variant is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Variant not found",
        )

    return variant


# ============================================================
# PRODUCT REVIEWS
# ============================================================

@router.get(
    "/products/{product_id}/reviews",
    response_model=list[ReviewResponse]
)
def get_reviews(
    db: Annotated[
        Session,
        Depends(get_db),
    ],
    product_id: int,
):
    product = (
        db.query(Product)
        .filter(
            Product.id == product_id
        )
        .first()
    )

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    reviews = db.query(Review).filter(
        Review.product_id == product.id
    ).all()

    return reviews


# ============================================================
# TAGS
# ============================================================

@router.get("/tags")
def get_tags(
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    return db.query(Tag).all()




@router.get("/categories")
def get_categories(
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    return db.query(Category).all()




@router.get("/brands")
def get_brands(
    db: Annotated[
        Session,
        Depends(get_db),
    ],
):
    return db.query(Brand).all()
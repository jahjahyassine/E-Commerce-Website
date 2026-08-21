from enum import Enum
import json
from typing import Annotated, List

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.params import Depends
from sqlalchemy.orm import Session
from core.cloudinary import cloudinary
from models.product import Media, Product, Brand, Category, ProductVariant, Tag
from models.review import Review
from schemas.product import ProductCreateRequest, CategoryCreate, BrandCreate, ProductResponse, ProductVariantCreate, ProductVariantCreateRequest, ProductVariantResponse, TagCreate
from core.database import get_db
from sqlalchemy import exists, func, or_


router = APIRouter()




class SortBy(str, Enum):
    brand = "brand"
    price = "price"
    rating = "rating"
    





@router.delete("/admin/products/{product_id}")
def delete_product(
    db: Annotated[Session, Depends(get_db)],
    product_id: int
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    db.delete(product)
    db.commit()

    return {
        "message": "Product deleted successfully"
    }






@router.get("/products", response_model=List[ProductResponse])
def get_products(
    db: Annotated[Session, Depends(get_db)],
    category_id: int | None = None,
    brand_id: int | None = None,
    min_rating: int | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    search: str | None = None,
    is_active: bool | None = None,
):
    query = db.query(Product)

    # SEARCH
    if search and search.strip():
        search = search.strip()
        search_pattern = f"%{search}%"

        query = query.filter(
            or_(
                Product.name.ilike(search_pattern),
                Product.description.ilike(search_pattern),
            )
        )

    # CATEGORY
    if category_id is not None:
        query = query.filter(
            Product.category_id == category_id
        )

    # BRAND
    if brand_id is not None:
        query = query.filter(
            Product.brand_id == brand_id
        )

    # MIN PRICE
    if min_price is not None:
        query = query.filter(
            exists().where(
                ProductVariant.product_id == Product.id,
                ProductVariant.price >= min_price,
            )
        )

    # MAX PRICE
    if max_price is not None:
        query = query.filter(
            exists().where(
                ProductVariant.product_id == Product.id,
                ProductVariant.price <= max_price,
            )
        )

    # RATING
    if min_rating is not None:
        query = query.filter(
            Product.average_rating >= min_rating
        )

    # STATUS
    if is_active is not None:
        query = query.filter(
            Product.is_active == is_active
        )

    return query.all()


@router.get("/products/{product_id}", response_model=ProductResponse)
def get_product_details(db: Annotated[Session, Depends(get_db)], product_id: int):
    product = db.query(Product).filter(Product.id == product_id).first()

    return product



@router.get("/products/{product_id}/variants", response_model=list[ProductVariantResponse])
def get_product_variant_details(db: Annotated[Session, Depends(get_db)], product_id: int, attributes: str | None = None):
    query = db.query(ProductVariant).filter(ProductVariant.product_id == product_id)

    if attributes:
            selected_attributes = json.loads(attributes)
    
            for key, value in selected_attributes.items():
                query = query.filter(
                    ProductVariant.attributes[key].astext == value
                )
    product_variants = query.all()
    
    return product_variants



@router.get("/products/{product_id}/reviews")
def get_reviews(db: Annotated[Session, Depends(get_db)], product_id: int):
    product = db.query(Product).filter(Product.id == product_id).first()

    return product.reviews













@router.get("/tags")
def get_tags(db: Annotated[Session, Depends(get_db)]):
    tags = db.query(Tag).all()

    return tags




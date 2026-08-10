from enum import Enum
import json
from typing import Annotated, List

from fastapi import APIRouter
from fastapi.params import Depends
from sqlalchemy.orm import Session
from models.product import Media, Product, Brand, Category, ProductVariant
from models.review import Review
from schemas.product import ProductCreateRequest, CategoryCreate, BrandCreate, ProductResponse, ProductVariantCreate, ProductVariantCreateRequest, ProductVariantResponse
from core.database import get_db



router = APIRouter()




class SortBy(str, Enum):
    brand = "brand"
    price = "price"
    rating = "rating"
    

@router.post("/admin/products")
def add_product(data: ProductCreateRequest, db: Annotated[Session, Depends(get_db)]):
    new_product = Product (
        name=data.product.name,
        description=data.product.description,
        specifications=data.product.specifications,
        brand_id=data.product.brand_id,
        category_id=data.product.category_id
    )

    db.add(new_product)
    db.flush()

    product_id = new_product.id

    for image in data.media:
        new_image = Media (
            media_url=image,
            product_id=product_id
        )
        db.add(new_image)

    db.commit()
    db.refresh(new_product)

    return new_product



from sqlalchemy import exists, func


@router.get("/products", response_model=List[ProductResponse])
def get_products(
    db: Annotated[Session, Depends(get_db)],
    category_id: int | None = None,
    brand_id: int | None = None,
    min_rating: int | None = None,
    min_price: float | None = None,
    max_price: float | None = None
):

    query = db.query(Product)

    if category_id is not None:
        query = query.filter(Product.category_id == category_id)

    if brand_id is not None:
        query = query.filter(Product.brand_id == brand_id)

    if min_price is not None:
        query = query.filter(
            exists().where(
                ProductVariant.product_id == Product.id,
                ProductVariant.price >= min_price
            )
        )

    if max_price is not None:
        query = query.filter(
            exists().where(
                ProductVariant.product_id == Product.id,
                ProductVariant.price <= max_price
            )
        )

    if min_rating is not None:
        query = query.filter(
            Product.average_rating >= min_rating
        )

    products = query.all()

    return products



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




@router.post("/admin/products/{product_id}/variants")
def add_product_variant(db: Annotated[Session, Depends(get_db)], product_id: int, data: ProductVariantCreateRequest):
    new_variant = ProductVariant(
        product_id=product_id,
        sku=data.product.sku,
        price=data.product.price,
        discount_percentage=data.product.discount_percentage,
        attributes=data.product.attributes,
    )
    db.add(new_variant)
    db.flush()

    min_price = db.query(func.min(ProductVariant.price)).filter(ProductVariant.product_id == product_id, ProductVariant.is_active == True).scalar()

    product = db.query(Product).filter(Product.id == product_id).first()
    product.min_price = min_price


    variant_id = new_variant.id

    for image in data.media:
        new_image = Media (
            media_url=image,
            variant_id=variant_id,
        )
        db.add(new_image)

    db.commit()






@router.post("/admin/categories")
def add_brand(category: CategoryCreate, db: Annotated[Session, Depends(get_db)]):
    new_category = Category (
        name=category.name
    )

    db.add(new_category)
    db.commit()

    db.refresh(new_category)


@router.post("/admin/brands")
def add_brand(brand: BrandCreate, db: Annotated[Session, Depends(get_db)]):
    new_brand = Brand (
        name=brand.name
    )

    db.add(new_brand)
    db.commit()

    db.refresh(new_brand)




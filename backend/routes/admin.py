import json
from typing import Annotated, List

from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile, status, File
from sqlalchemy import exists, func, or_
from sqlalchemy.orm import Session

from models.inventory import Inventory
from schemas.user import UserResponse
from models.product import Brand, Category, Media, Product, ProductVariant, Tag
from models.user import User
from schemas.product import BrandCreate, BrandResponse, CategoryCreate, CategoryResponse, ProductCreateRequest, ProductResponse, ProductUpdate, ProductVariantCreateRequest, TagCreate
from core.database import get_db
from core.security import decode_access_token

from core.cloudinary import cloudinary


router = APIRouter()




@router.get("/admin", response_model=UserResponse)
def get_current_admin(
    db: Annotated[Session, Depends(get_db)],
    user_infos: Annotated[dict, Depends(decode_access_token)],
):
    role = user_infos.get("role").upper()

    if role != "ADMIN":
        raise HTTPException (
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized action"
        )

    admin_id = user_infos.get("id")
    
    admin = db.query(User).filter(User.id == admin_id).first()

    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not Found"
        )
    
    return {
        "id": admin.id,
        "username": admin.username,
        "full_name": admin.full_name,
        "email": admin.email,
        "role": admin.role,
        "phone": admin.phone,
        "address": admin.address,
        "is_active": admin.is_active,
        "profile_pic_path": admin.profile_pic_path
    }


@router.patch("/admin/products/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Annotated[Session, Depends(get_db)],
    user_infos: Annotated[dict, Depends(decode_access_token)] 
):
    user_id = user_infos.get("id")
    
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if user.role != "CUSTOMER":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized Action"
        )
    
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if product is None:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    update_data = product_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)

    return product


@router.get("/admin/products/{product_id}", response_model=ProductResponse)
def get_products(
    db: Annotated[Session, Depends(get_db)],
    product_id: int,
    user_infos: Annotated[dict, Depends(decode_access_token)]
):
    user_id = user_infos.get("id")

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if user.role != "CUSTOMER":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized Action"
        )
    
    product = db.query(Product).filter(Product.id == product_id).first()


    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    return product
    


@router.post("/admin/products")
async def add_product(
    product: str = Form(...),
    media: list[UploadFile] = File(...),
    db: Annotated[Session, Depends(get_db)] = None,
):
    product_data = ProductCreateRequest.model_validate(
        json.loads(product)
    )

    new_product = Product(
        name=product_data.product.name,
        description=product_data.product.description,
        specifications=product_data.product.specifications,
        brand_id=product_data.product.brand_id,
        category_id=product_data.product.category_id,
    )

    db.add(new_product)
    db.flush()

    if product_data.product.tags:
        for tag_name in product_data.product.tags:

            tag = (
                db.query(Tag)
                .filter(Tag.name == tag_name)
                .first()
            )

            if tag:
                new_product.tags.append(tag)
            else:
                new_tag = Tag(name=tag_name)
                new_product.tags.append(new_tag)

    for image in media:
        image_upload = cloudinary.uploader.upload(
            await image.read()
        )

        image_url = image_upload["secure_url"]

        new_image = Media(
            media_url=image_url,
            product_id=new_product.id
        )

        db.add(new_image)

    db.commit()
    db.refresh(new_product)

    return new_product



@router.get("/admin/products", response_model=List[ProductResponse])
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
            Product.name.ilike(search_pattern),
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
        if is_active:
            query = query.filter(
                Product.is_active == True,
                exists().where(
                    ProductVariant.product_id == Product.id,
                    Inventory.product_variant_id == ProductVariant.id,
                    Inventory.quantity > 0,
                )
            )
        else:
            query = query.filter(
                or_(
                    Product.is_active == False,
                    ~exists().where(
                        ProductVariant.product_id == Product.id,
                        Inventory.product_variant_id == ProductVariant.id,
                        Inventory.quantity > 0,
                    )
                )
            )

    return query.all()





@router.delete("/admin/products/{product_id}")
def delete_products(
    db: Annotated[Session, Depends(get_db)],
    product_id: int,
    user_infos: Annotated[dict, Depends(decode_access_token)]
):
    user_id = user_infos.get("id")

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if user.role != "CUSTOMER":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized Action"
        )
    
    product = db.query(Product).filter(Product.id == product_id).first()


    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )


    db.delete(product)

    return {
        "message": "Product deleted successfully"
    }



@router.post("/admin/products/{product_id}/variants")
async def add_product_variant(
    product_id: int,
    variant: str = Form(...),
    media: list[UploadFile] = File(default=[]),
    db: Annotated[Session, Depends(get_db)] = None,
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    variant_data = ProductVariantCreateRequest.model_validate(
        json.loads(variant)
    )

    new_variant = ProductVariant(
        product_id=product_id,
        sku=variant_data.sku,
        price=variant_data.price,
        discount_percentage=variant_data.discount_percentage,
        attributes=variant_data.attributes,
        is_active=variant_data.is_active,
    )

    db.add(new_variant)
    db.flush()

    # Upload variant images to Cloudinary
    for image in media:
        if not image.filename:
            continue

        image_upload = cloudinary.uploader.upload(
            await image.read()
        )

        image_url = image_upload["secure_url"]

        new_image = Media(
            media_url=image_url,
            variant_id=new_variant.id,
        )

        db.add(new_image)

    # Recalculate product minimum price
    min_price = (
        db.query(func.min(ProductVariant.price))
        .filter(
            ProductVariant.product_id == product_id,
            ProductVariant.is_active == True,
        )
        .scalar()
    )

    product.min_price = min_price or 0

    db.commit()
    db.refresh(new_variant)

    return new_variant






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


@router.post("/admin/tags")
def add_tag(tag: TagCreate, db: Annotated[Session, Depends(get_db)]):
    new_tag = Tag (
        name=tag.name
    )

    db.add(new_tag)
    db.commit()

    db.refresh(new_tag)



@router.get("/admin/categories", response_model=list[CategoryResponse])
def get_categories(db: Annotated[Session, Depends(get_db)]):
    categories = db.query(Category).all()

    return categories


@router.get("/admin/categories/{category_id}", response_model=CategoryResponse)
def get_category(
    db: Annotated[Session, Depends(get_db)],
    category_id: int
):
    category = db.query(Category).filter(Category.id == category_id).first()

    return category


@router.get("/admin/brands", response_model=list[BrandResponse])
def get_brands(db: Annotated[Session, Depends(get_db)]):
    brands = db.query(Brand).all()

    return brands

@router.get("/admin/tags")
def get_tags(db: Annotated[Session, Depends(get_db)]):
    tags = db.query(Tag).all()

    return tags
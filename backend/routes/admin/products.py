import json
from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy import exists, func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from core.cloudinary import cloudinary
from core.database import get_db
from core.security import decode_access_token
from models.inventory import Inventory, StockChange, StockChangeType, Supplier
from models.product import (
    Brand,
    Category,
    Media,
    Product,
    ProductVariant,
    Tag,
)
from rag.cache.brand_cache import invalidate_brands
from rag.cache.category_cache import invalidate_categories
from rag.embedding import indexing_product
from schemas.product import (
    BrandCreate,
    BrandPatchRequest,
    BrandResponse,
    CategoryCreate,
    CategoryPatchRequest,
    CategoryResponse,
    ProductCreateRequest,
    ProductResponse,
    ProductUpdate,
    ProductVariantCreateRequest,
    ProductVariantResponse,
    ProductVariantUpdate,
    TagCreate,
)
from services.auth import require_admin

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


@router.post("/products")
async def add_product(
    product: str = Form(...),
    media: list[UploadFile] = File(default=[]),
    db: Annotated[Session, Depends(get_db)] = None,
    user_infos: Annotated[dict, Depends(decode_access_token)] = None,
):
    require_admin(db, user_infos)

    try:
        product_data = ProductCreateRequest.model_validate(
            {"product": json.loads(product)}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid product data: {e}",
        )

    data = product_data.product

    new_product = Product(
        name=data.name,
        description=data.description,
        specifications=data.specifications,
        brand_id=data.brand_id,
        category_id=data.category_id,
    )

    db.add(new_product)
    db.flush()

    if data.tags:
        for tag_name in data.tags:
            if not tag_name:
                continue

            tag = db.query(Tag).filter(Tag.name == tag_name).first()

            if not tag:
                tag = Tag(name=tag_name)
                db.add(tag)
                db.flush()

            new_product.tags.append(tag)

    for image in media:
        if not image.filename:
            continue

        upload = cloudinary.uploader.upload(await image.read())

        db.add(
            Media(
                media_url=upload["secure_url"],
                public_id=upload["public_id"],
                product_id=new_product.id,
            )
        )

    new_product = db.query(Product).filter(Product.id == new_product.id).first()
    new_product.embedding = indexing_product(new_product)

    db.commit()
    db.refresh(new_product)

    return new_product


@router.get("/products", response_model=list[ProductResponse])
def get_products(
    db: Annotated[Session, Depends(get_db)],
    category_id: int | None = None,
    brand_id: int | None = None,
    min_rating: float | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    search: str | None = None,
    is_active: bool | None = None,
):
    query = db.query(Product)

    if search and search.strip():
        query = query.filter(Product.name.ilike(f"%{search.strip()}%"))

    if category_id is not None:
        query = query.filter(Product.category_id == category_id)

    if brand_id is not None:
        query = query.filter(Product.brand_id == brand_id)

    if min_price is not None:
        query = query.filter(
            exists().where(
                (ProductVariant.product_id == Product.id)
                & (ProductVariant.price >= min_price)
            )
        )

    if max_price is not None:
        query = query.filter(
            exists().where(
                (ProductVariant.product_id == Product.id)
                & (ProductVariant.price <= max_price)
            )
        )

    if min_rating is not None:
        query = query.filter(Product.average_rating >= min_rating)

    if is_active is not None:
        query = query.filter(Product.is_active == is_active)

    return query.all()


@router.get("/products/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    db: Annotated[Session, Depends(get_db)],
    user_infos: Annotated[dict, Depends(decode_access_token)],
):
    require_admin(db, user_infos)

    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    return product


@router.patch("/products/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Annotated[Session, Depends(get_db)],
    user_infos: Annotated[dict, Depends(decode_access_token)],
):
    require_admin(db, user_infos)

    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    for field, value in product_data.model_dump(exclude_unset=True).items():
        setattr(product, field, value)

    product.embedding = indexing_product(product)

    db.commit()
    db.refresh(product)

    return product


@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Annotated[Session, Depends(get_db)],
    user_infos: Annotated[dict, Depends(decode_access_token)],
):
    require_admin(db, user_infos)

    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    db.delete(product)
    db.commit()

    return {"message": "Product deleted successfully"}


@router.post(
    "/products/{product_id}/variants",
    response_model=ProductVariantResponse,
)
async def add_product_variant(
    product_id: int,
    variant: str = Form(...),
    media: list[UploadFile] = File(default=[]),
    db: Annotated[Session, Depends(get_db)] = None,
    user_infos: Annotated[dict, Depends(decode_access_token)] = None,
):
    require_admin(db, user_infos)

    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    try:
        variant_data = ProductVariantCreateRequest.model_validate(
            json.loads(variant)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid variant data: {e}",
        )

    existing_variant = (
        db.query(ProductVariant)
        .filter(ProductVariant.sku == variant_data.sku)
        .first()
    )

    if existing_variant:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="SKU already exists",
        )

    supplier = (
        db.query(Supplier)
        .filter(
            Supplier.id == int(variant_data.supplier_id),
            Supplier.is_active == True,
        )
        .first()
    )

    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found or inactive",
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

    db.add(
        Inventory(
            product_variant_id=new_variant.id,
            quantity=variant_data.quantity,
        )
    )

    db.add(
        StockChange(
            product_variant_id=new_variant.id,
            change_type=StockChangeType.IN,
            quantity=variant_data.quantity,
            supplier_id=supplier.id,
        )
    )

    for image in media:
        if not image.filename:
            continue

        upload = cloudinary.uploader.upload(await image.read())

        db.add(
            Media(
                media_url=upload["secure_url"],
                public_id=upload["public_id"],
                variant_id=new_variant.id,
            )
        )

    min_price = (
        db.query(func.min(ProductVariant.price))
        .filter(
            ProductVariant.product_id == product_id,
            ProductVariant.is_active == True,
        )
        .scalar()
    )

    product.min_price = min_price or 0
    product.embedding = indexing_product(product)

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    return (
        db.query(ProductVariant)
        .options(
            joinedload(ProductVariant.product),
            joinedload(ProductVariant.inventory),
            joinedload(ProductVariant.media),
        )
        .filter(ProductVariant.id == new_variant.id)
        .first()
    )


@router.patch(
    "/products/{product_id}/variants/{variant_id}",
    response_model=ProductVariantResponse,
)
def update_variant(
    product_id: int,
    variant_id: int,
    variant_data: ProductVariantUpdate,
    db: Annotated[Session, Depends(get_db)],
    user_infos: Annotated[dict, Depends(decode_access_token)],
):
    require_admin(db, user_infos)

    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    product_variant = (
        db.query(ProductVariant)
        .filter(
            ProductVariant.id == variant_id,
            ProductVariant.product_id == product_id,
        )
        .first()
    )

    if not product_variant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Variant not found for this product",
        )

    update_data = variant_data.model_dump(exclude_unset=True)
    quantity = update_data.pop("quantity", None)

    for field, value in update_data.items():
        setattr(product_variant, field, value)

    if quantity is not None:
        inventory = (
            db.query(Inventory)
            .filter(Inventory.product_variant_id == variant_id)
            .first()
        )

        if inventory:
            inventory.quantity = quantity
        else:
            db.add(
                Inventory(
                    product_variant_id=variant_id,
                    quantity=quantity,
                )
            )

    min_price = (
        db.query(func.min(ProductVariant.price))
        .filter(
            ProductVariant.product_id == product_id,
            ProductVariant.is_active == True,
        )
        .scalar()
    )

    product.min_price = min_price or 0
    product.embedding = indexing_product(product)

    db.commit()
    db.refresh(product_variant)

    return product_variant


@router.delete("/products/{product_id}/variants/{variant_id}")
def delete_variant(
    product_id: int,
    variant_id: int,
    db: Annotated[Session, Depends(get_db)],
    user_infos: Annotated[dict, Depends(decode_access_token)],
):
    require_admin(db, user_infos)

    variant = (
        db.query(ProductVariant)
        .filter(
            ProductVariant.id == variant_id,
            ProductVariant.product_id == product_id,
        )
        .first()
    )

    if not variant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Variant not found for this product",
        )

    db.delete(variant)

    product = db.query(Product).filter(Product.id == product_id).first()

    if product:
        db.flush()

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

    return {"message": "Variant deleted successfully"}


@router.post("/products/{product_id}/media")
async def add_product_media(
    product_id: int,
    media: list[UploadFile] = File(default=[]),
    db: Annotated[Session, Depends(get_db)] = None,
    user_infos: Annotated[dict, Depends(decode_access_token)] = None,
):
    require_admin(db, user_infos)

    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    uploaded_media = []

    try:
        for image in media:
            if not image.filename:
                continue

            upload = cloudinary.uploader.upload(await image.read())

            new_image = Media(
                media_url=upload["secure_url"],
                public_id=upload["public_id"],
                product_id=product_id,
            )

            db.add(new_image)
            uploaded_media.append(new_image)

        db.commit()

        for image in uploaded_media:
            db.refresh(image)

        return uploaded_media

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload product images",
        )


@router.delete("/products/{product_id}/media/{media_id}")
def delete_product_media(
    product_id: int,
    media_id: int,
    db: Annotated[Session, Depends(get_db)],
    user_infos: Annotated[dict, Depends(decode_access_token)],
):
    require_admin(db, user_infos)

    media = (
        db.query(Media)
        .filter(
            Media.id == media_id,
            Media.product_id == product_id,
        )
        .first()
    )

    if not media:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product image not found",
        )

    try:
        cloudinary.uploader.destroy(media.public_id)
        db.delete(media)
        db.commit()

        return {"message": "Product image deleted successfully"}

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete product image",
        )


@router.post("/products/{product_id}/variants/{variant_id}/media")
async def add_variant_media(
    product_id: int,
    variant_id: int,
    media: list[UploadFile] = File(default=[]),
    db: Annotated[Session, Depends(get_db)] = None,
    user_infos: Annotated[dict, Depends(decode_access_token)] = None,
):
    require_admin(db, user_infos)

    variant = (
        db.query(ProductVariant)
        .filter(
            ProductVariant.id == variant_id,
            ProductVariant.product_id == product_id,
        )
        .first()
    )

    if not variant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Variant not found for this product",
        )

    uploaded_media = []

    try:
        for image in media:
            if not image.filename:
                continue

            upload = cloudinary.uploader.upload(await image.read())

            new_image = Media(
                media_url=upload["secure_url"],
                public_id=upload["public_id"],
                variant_id=variant_id,
            )

            db.add(new_image)
            uploaded_media.append(new_image)

        db.commit()

        for image in uploaded_media:
            db.refresh(image)

        return uploaded_media

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload variant images",
        )


@router.delete("/products/{product_id}/variants/{variant_id}/media/{media_id}")
def delete_variant_media(
    product_id: int,
    variant_id: int,
    media_id: int,
    db: Annotated[Session, Depends(get_db)],
    user_infos: Annotated[dict, Depends(decode_access_token)],
):
    require_admin(db, user_infos)

    media = (
        db.query(Media)
        .filter(
            Media.id == media_id,
            Media.variant_id == variant_id,
        )
        .first()
    )

    if not media:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Variant image not found",
        )

    variant = (
        db.query(ProductVariant)
        .filter(
            ProductVariant.id == variant_id,
            ProductVariant.product_id == product_id,
        )
        .first()
    )

    if not variant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Variant not found for this product",
        )

    try:
        cloudinary.uploader.destroy(media.public_id)
        db.delete(media)
        db.commit()

        return {"message": "Variant image deleted successfully"}

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete variant image",
        )


@router.post("/categories", response_model=CategoryResponse)
def add_category(
    category: CategoryCreate,
    db: Annotated[Session, Depends(get_db)],
    user_infos: Annotated[dict, Depends(decode_access_token)],
):
    require_admin(db, user_infos)

    existing = (
        db.query(Category)
        .filter(func.lower(Category.name) == category.name.strip().lower())
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Category already exists",
        )

    new_category = Category(name=category.name.strip())
    db.add(new_category)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Category already exists",
        )
    except Exception:
        db.rollback()
        raise

    invalidate_categories()
    db.refresh(new_category)

    return new_category


@router.get("/categories", response_model=list[CategoryResponse])
def get_categories(
    db: Annotated[Session, Depends(get_db)],
    name: str | None = None,
    is_active: bool | None = None,
):
    query = db.query(Category)

    if name is not None:
        query = query.filter(Category.name.ilike(f"%{name}%"))

    if is_active is not None:
        query = query.filter(Category.is_active == is_active)

    return query.all()


@router.get("/categories/{category_id}", response_model=CategoryResponse)
def get_category(
    category_id: int,
    db: Annotated[Session, Depends(get_db)],
):
    category = db.query(Category).filter(Category.id == category_id).first()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    return category


@router.patch("/categories/{category_id}", response_model=CategoryResponse)
def patch_category(
    category_id: int,
    category_data: CategoryPatchRequest,
    db: Annotated[Session, Depends(get_db)],
    user_infos: Annotated[dict, Depends(decode_access_token)],
):
    require_admin(db, user_infos)

    category = db.query(Category).filter(Category.id == category_id).first()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    update_data = category_data.model_dump(exclude_unset=True)

    if update_data.get("name") is not None:
        update_data["name"] = update_data["name"].strip()

        duplicate = (
            db.query(Category)
            .filter(
                func.lower(Category.name) == update_data["name"].lower(),
                Category.id != category_id,
            )
            .first()
        )

        if duplicate:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Category already exists",
            )

    for field, value in update_data.items():
        setattr(category, field, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Category already exists",
        )
    except Exception:
        db.rollback()
        raise

    invalidate_categories()
    db.refresh(category)

    return category


@router.delete("/categories/{category_id}")
def delete_category(
    category_id: int,
    db: Annotated[Session, Depends(get_db)],
    user_infos: Annotated[dict, Depends(decode_access_token)],
):
    require_admin(db, user_infos)

    category = db.query(Category).filter(Category.id == category_id).first()

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    db.delete(category)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Category is used by products; deactivate it instead",
        )
    except Exception:
        db.rollback()
        raise

    invalidate_categories()

    return {"message": "Category deleted successfully"}


@router.post("/brands", response_model=BrandResponse)
def add_brand(
    brand: BrandCreate,
    db: Annotated[Session, Depends(get_db)],
    user_infos: Annotated[dict, Depends(decode_access_token)],
):
    require_admin(db, user_infos)

    existing = (
        db.query(Brand)
        .filter(func.lower(Brand.name) == brand.name.strip().lower())
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Brand already exists",
        )

    new_brand = Brand(name=brand.name.strip())
    db.add(new_brand)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Brand already exists",
        )
    except Exception:
        db.rollback()
        raise

    invalidate_brands()
    db.refresh(new_brand)

    return new_brand


@router.get("/brands", response_model=list[BrandResponse])
def get_brands(
    db: Annotated[Session, Depends(get_db)],
    name: str | None = None,
    is_active: bool | None = None,
):
    query = db.query(Brand)

    if name is not None:
        query = query.filter(Brand.name.ilike(f"%{name}%"))

    if is_active is not None:
        query = query.filter(Brand.is_active == is_active)

    return query.all()


@router.get("/brands/{brand_id}", response_model=BrandResponse)
def get_brand(
    brand_id: int,
    db: Annotated[Session, Depends(get_db)],
):
    brand = db.query(Brand).filter(Brand.id == brand_id).first()

    if not brand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Brand not found",
        )

    return brand


@router.patch("/brands/{brand_id}", response_model=BrandResponse)
def patch_brand(
    brand_id: int,
    brand_data: BrandPatchRequest,
    db: Annotated[Session, Depends(get_db)],
    user_infos: Annotated[dict, Depends(decode_access_token)],
):
    require_admin(db, user_infos)

    brand = db.query(Brand).filter(Brand.id == brand_id).first()

    if not brand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Brand not found",
        )

    update_data = brand_data.model_dump(exclude_unset=True)

    if update_data.get("name") is not None:
        update_data["name"] = update_data["name"].strip()

        duplicate = (
            db.query(Brand)
            .filter(
                func.lower(Brand.name) == update_data["name"].lower(),
                Brand.id != brand_id,
            )
            .first()
        )

        if duplicate:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Brand already exists",
            )

    for field, value in update_data.items():
        setattr(brand, field, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Brand already exists",
        )
    except Exception:
        db.rollback()
        raise

    invalidate_brands()
    db.refresh(brand)

    return brand


@router.delete("/brands/{brand_id}")
def delete_brand(
    brand_id: int,
    db: Annotated[Session, Depends(get_db)],
    user_infos: Annotated[dict, Depends(decode_access_token)],
):
    require_admin(db, user_infos)

    brand = db.query(Brand).filter(Brand.id == brand_id).first()

    if not brand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Brand not found",
        )

    db.delete(brand)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Brand is used by products; deactivate it instead",
        )
    except Exception:
        db.rollback()
        raise

    invalidate_brands()

    return {"message": "Brand deleted successfully"}


@router.post("/tags")
def add_tag(
    tag: TagCreate,
    db: Annotated[Session, Depends(get_db)],
    user_infos: Annotated[dict, Depends(decode_access_token)],
):
    require_admin(db, user_infos)

    existing = (
        db.query(Tag)
        .filter(func.lower(Tag.name) == tag.name.strip().lower())
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Tag already exists",
        )

    new_tag = Tag(name=tag.name.strip())

    db.add(new_tag)
    db.commit()
    db.refresh(new_tag)

    return new_tag


@router.get("/tags")
def get_tags(
    db: Annotated[Session, Depends(get_db)],
):
    return db.query(Tag).all()
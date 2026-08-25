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

from sqlalchemy import exists, func, or_
from sqlalchemy.orm import Session

from models.order import Order
from schemas.order import OrderResponse
from core.cloudinary import cloudinary
from core.database import get_db
from core.security import decode_access_token

from models.product import (
    Brand,
    Category,
    Media,
    Product,
    ProductVariant,
    Tag,
)

from models.user import User, UserRole

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

from models.inventory import Inventory


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)






# @router.post("/products")
# async def add_product(
#     product: str = Form(...),
#     media: list[UploadFile] = File(default=[]),
#     db: Annotated[Session, Depends(get_db)] = None,
#     user_infos: Annotated[
#         dict,
#         Depends(decode_access_token),
#     ] = None,
# ):
#     require_admin(db, user_infos)

#     try:
#         product_data = ProductCreateRequest.model_validate(
#             {
#                 "product": json.loads(product)
#             }
#         )
#     except Exception as e:
#         raise HTTPException(
#             status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
#             detail=f"Invalid product data: {e}",
#         )

#     data = product_data.product

#     new_product = Product(
#         name=data.name,
#         description=data.description,
#         specifications=data.specifications,
#         brand_id=data.brand_id,
#         category_id=data.category_id,
#     )

#     db.add(new_product)
#     db.flush()

#     if data.tags:
#         for tag_name in data.tags:
#             if not tag_name:
#                 continue

#             tag = (
#                 db.query(Tag)
#                 .filter(Tag.name == tag_name)
#                 .first()
#             )

#             if not tag:
#                 tag = Tag(name=tag_name)
#                 db.add(tag)
#                 db.flush()

#             new_product.tags.append(tag)

#     for image in media:
#         if not image.filename:
#             continue

#         upload = cloudinary.uploader.upload(
#             await image.read()
#         )

#         new_image = Media(
#             media_url=upload["secure_url"],
#             product_id=new_product.id,
#         )

#         db.add(new_image)

#     db.commit()
#     db.refresh(new_product)

#     return new_product





@router.get(
    "/orders",
    response_model=list[OrderResponse],
)
def get_orders (
    db: Annotated[Session, Depends(get_db)],
    search: str | None = None,
    order_status: str | None = None,
    shipping_status: str | None = None,
    payment_status: str | None = None
):
    query = db.query(Order)

    if search is not None:
        search_pattern = search.trim()
        query = query.filter(
            Order.items.product_name.ilike(f"%{search_pattern}%")
        )

    if order_status is not None:
        query = query.filter(
            Order.order_status == order_status
        )

    if shipping_status is not None:
        query = query.filter(
            Order.shipping_status == shipping_status
        )

    if payment_status is not None:
        query = query.filter(
            Order.payment_status == payment_status
        )

    return query.all()
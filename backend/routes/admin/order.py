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

from routes.admin.inventory import require_admin
from models.order import Order, OrderStatus, PaymentStatus, ShippingStatus
from schemas.order import AdminOrderResponse, OrderResponse, StatusUpdate
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

from models.inventory import Inventory, StockChange, StockChangeType


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

    return query.order_by(Order.created_at.desc()).all()





@router.patch(
    "/orders/{order_id}",
    response_model=OrderResponse,
)
def update_order(
    order_id: int,
    order_data: StatusUpdate,
    db: Annotated[
        Session,
        Depends(get_db),
    ],
    user_infos: Annotated[
        dict,
        Depends(decode_access_token),
    ],
):
    require_admin(db, user_infos)

    try:
        order = (
            db.query(Order)
            .filter(Order.id == order_id)
            .first()
        )

        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found",
            )

        update_data = order_data.model_dump(
            exclude_unset=True
        )

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No changes provided",
            )

        old_order_status = order.order_status
        old_shipping_status = order.shipping_status
        old_payment_status = order.payment_status

        new_order_status = update_data.get(
            "order_status",
            old_order_status,
        )

        new_shipping_status = update_data.get(
            "shipping_status",
            old_shipping_status,
        )

        new_payment_status = update_data.get(
            "payment_status",
            old_payment_status,
        )

        if (
            old_order_status == OrderStatus.CANCELLED
        ):
            if (
                new_order_status
                != OrderStatus.CANCELLED
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "A cancelled order cannot "
                        "be reopened"
                    ),
                )

            if (
                new_shipping_status
                != ShippingStatus.NOT_SHIPPED
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "A cancelled order cannot "
                        "be shipped or delivered"
                    ),
                )

            if (
                new_payment_status
                != old_payment_status
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "A cancelled order cannot "
                        "change its payment status"
                    ),
                )

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cancelled order cannot be modified",
            )

        if (
            old_order_status
            == OrderStatus.COMPLETED
        ):
            if (
                new_order_status
                != OrderStatus.COMPLETED
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "A completed order cannot "
                        "change its order status"
                    ),
                )

            if (
                new_shipping_status
                != ShippingStatus.DELIVERED
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "A completed order must "
                        "remain delivered"
                    ),
                )

        if (
            old_shipping_status
            == ShippingStatus.DELIVERED
            and new_shipping_status
            != ShippingStatus.DELIVERED
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "A delivered order cannot "
                    "be moved back to shipping"
                ),
            )

        if (
            old_shipping_status
            == ShippingStatus.SHIPPED
            and new_shipping_status
            == ShippingStatus.NOT_SHIPPED
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "A shipped order cannot be "
                    "moved back to not shipped"
                ),
            )

        if (
            old_order_status == OrderStatus.PENDING
            and new_order_status
            not in (
                OrderStatus.PENDING,
                OrderStatus.CONFIRMED,
                OrderStatus.CANCELLED,
            )
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "A pending order can only be "
                    "confirmed or cancelled"
                ),
            )

        if (
            old_order_status == OrderStatus.CONFIRMED
            and new_order_status
            not in (
                OrderStatus.CONFIRMED,
                OrderStatus.COMPLETED,
                OrderStatus.CANCELLED,
            )
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "A confirmed order can only "
                    "remain confirmed, be completed, "
                    "or be cancelled"
                ),
            )

        if (
            old_order_status == OrderStatus.PENDING
            and new_shipping_status
            != ShippingStatus.NOT_SHIPPED
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "A pending order cannot be shipped"
                ),
            )

        if (
            new_shipping_status
            == ShippingStatus.SHIPPED
            and new_order_status
            not in (
                OrderStatus.CONFIRMED,
            )
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Only confirmed orders can "
                    "be shipped"
                ),
            )

        if (
            new_shipping_status
            == ShippingStatus.DELIVERED
            and new_order_status
            != OrderStatus.COMPLETED
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "An order must be completed "
                    "when it is delivered"
                ),
            )

        if (
            new_order_status
            == OrderStatus.COMPLETED
            and new_shipping_status
            != ShippingStatus.DELIVERED
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "An order must be delivered "
                    "before it can be completed"
                ),
            )

        if (
            new_order_status
            == OrderStatus.CANCELLED
        ):
            if (
                old_shipping_status
                != ShippingStatus.NOT_SHIPPED
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "A shipped or delivered order "
                        "cannot be cancelled"
                    ),
                )

            if (
                old_order_status
                == OrderStatus.CANCELLED
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Order is already cancelled",
                )

            for order_item in order.items:
                product_variant = (
                    db.query(ProductVariant)
                    .filter(
                        ProductVariant.id
                        == order_item.product_variant_id
                    )
                    .with_for_update()
                    .first()
                )

                if not product_variant:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=(
                            "Product variant "
                            f"{order_item.product_variant_id} "
                            "not found"
                        ),
                    )

                if not product_variant.inventory:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=(
                            "Inventory not found for "
                            f"product variant "
                            f"{product_variant.id}"
                        ),
                    )

                product_variant.inventory.quantity += (
                    order_item.quantity
                )

                stock_change = StockChange(
                    product_variant_id=(
                        product_variant.id
                    ),
                    change_type=StockChangeType.IN,
                    quantity=order_item.quantity,
                    order_id=order.id,
                )

                db.add(stock_change)

            update_data["order_status"] = (
                OrderStatus.CANCELLED
            )

            update_data["shipping_status"] = (
                ShippingStatus.NOT_SHIPPED
            )

            if (
                old_payment_status
                == PaymentStatus.PAID
            ):
                update_data["payment_status"] = (
                    PaymentStatus.REFUNDED
                )
            else:
                update_data["payment_status"] = (
                    PaymentStatus.PENDING
                )

        if (
            new_payment_status
            == PaymentStatus.REFUNDED
        ):
            if (
                old_payment_status
                != PaymentStatus.PAID
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "Only a paid order can "
                        "be refunded"
                    ),
                )

            if (
                new_order_status
                != OrderStatus.CANCELLED
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "An order must be cancelled "
                        "before it can be refunded"
                    ),
                )

        if (
            new_payment_status
            == PaymentStatus.PAID
        ):
            if (
                old_payment_status
                == PaymentStatus.REFUNDED
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "A refunded order cannot "
                        "be marked as paid again"
                    ),
                )

            if (
                new_order_status
                == OrderStatus.CANCELLED
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "A cancelled order cannot "
                        "be marked as paid"
                    ),
                )

        if (
            new_order_status
            == OrderStatus.COMPLETED
            and new_payment_status
            != PaymentStatus.PAID
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "An order must be paid "
                    "before it can be completed"
                ),
            )

        for field, value in update_data.items():
            setattr(
                order,
                field,
                value,
            )

        db.commit()
        db.refresh(order)

        return order

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()

        print(
            f"Error updating order {order_id}: {e}"
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Couldn't update order",
        )



@router.get("/orders/{order_id}", response_model=AdminOrderResponse)
def get_order(
    db: Annotated[Session, Depends(get_db)],
    order_id: int,
    user_infos: Annotated[dict, Depends(decode_access_token)],
):
    require_admin(db, user_infos)

    order = db.query(Order).filter(
        Order.id == order_id
    ).first()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not Found!"
        )
    return order
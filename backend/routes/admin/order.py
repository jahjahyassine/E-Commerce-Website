from enum import Enum
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

from pydantic import BaseModel
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



class OrderLifecycleStatus(str, Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    SHIPPED = "SHIPPED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class OrderStatusUpdate(BaseModel):
    status: OrderLifecycleStatus


# ============================================================
# SAFE ENUM/STRING NORMALIZATION
#
# Never assumes `.value` exists — this is what caused:
#   Error updating order 2: 'str' object has no attribute 'value'
# ============================================================

def _raw(value):
    """Return the plain string for `value`, whether it's an Enum
    member or already a plain string. Never blindly calls `.value`."""
    if isinstance(value, Enum):
        return value.value
    return value


# ============================================================
# THE SINGLE SOURCE OF TRUTH: lifecycle -> (order, shipping, payment)
#
# If your columns are plain String (not SQLAlchemy Enum) columns,
# replace e.g. `OrderStatus.PENDING` with `OrderStatus.PENDING.value`
# (or the plain string "PENDING") throughout this dict.
# ============================================================

LIFECYCLE_STATE_MAP: dict[OrderLifecycleStatus, tuple] = {
    OrderLifecycleStatus.PENDING: (
        OrderStatus.PENDING,
        ShippingStatus.NOT_SHIPPED,
        PaymentStatus.PENDING,
    ),
    OrderLifecycleStatus.CONFIRMED: (
        OrderStatus.CONFIRMED,
        ShippingStatus.NOT_SHIPPED,
        PaymentStatus.PENDING,
    ),
    OrderLifecycleStatus.SHIPPED: (
        OrderStatus.CONFIRMED,
        ShippingStatus.SHIPPED,
        PaymentStatus.PENDING,
    ),
    OrderLifecycleStatus.COMPLETED: (
        OrderStatus.COMPLETED,
        ShippingStatus.DELIVERED,
        PaymentStatus.PAID,
    ),
    OrderLifecycleStatus.CANCELLED: (
        OrderStatus.CANCELLED,
        ShippingStatus.NOT_SHIPPED,
        PaymentStatus.PENDING,
    ),
}


def _lifecycle_from_order(order: Order) -> OrderLifecycleStatus | None:
    """
    Derive the current lifecycle stage from the order's three raw
    columns. Returns None if the order is sitting in a combination
    that doesn't match any known lifecycle stage (e.g. legacy/bad
    data) — callers must treat that as "cannot safely transition".
    """
    raw_state = (
        _raw(order.order_status),
        _raw(order.shipping_status),
        _raw(order.payment_status),
    )
    for lifecycle, state in LIFECYCLE_STATE_MAP.items():
        if tuple(_raw(v) for v in state) == raw_state:
            return lifecycle
    return None


# ============================================================
# EXACT TRANSITION STATE MACHINE (no numeric ranks)
# ============================================================

ALLOWED_TRANSITIONS: dict[OrderLifecycleStatus, set] = {
    OrderLifecycleStatus.PENDING: {
        OrderLifecycleStatus.CONFIRMED,
        OrderLifecycleStatus.CANCELLED,
    },
    OrderLifecycleStatus.CONFIRMED: {
        OrderLifecycleStatus.SHIPPED,
        OrderLifecycleStatus.CANCELLED,
    },
    OrderLifecycleStatus.SHIPPED: {
        OrderLifecycleStatus.COMPLETED,
    },
    OrderLifecycleStatus.COMPLETED: set(),
    OrderLifecycleStatus.CANCELLED: set(),
}


def _invalid_transition_message(
    current: OrderLifecycleStatus,
    target: OrderLifecycleStatus,
) -> str:
    if current == OrderLifecycleStatus.COMPLETED:
        return "Completed orders cannot be modified."
    if current == OrderLifecycleStatus.CANCELLED:
        return "Cancelled orders cannot be modified."
    if target == OrderLifecycleStatus.COMPLETED:
        return "Cannot complete an order before it has been shipped."
    if (
        target == OrderLifecycleStatus.CANCELLED
        and current == OrderLifecycleStatus.SHIPPED
    ):
        return "Cannot cancel an order after it has been shipped."
    if (
        target == OrderLifecycleStatus.SHIPPED
        and current == OrderLifecycleStatus.PENDING
    ):
        return "Cannot ship an order that has not been confirmed."
    return f"Cannot transition order from {current.value} to {target.value}."


# ============================================================
# ROUTE
# ============================================================

@router.patch(
    "/orders/{order_id}",
    response_model=OrderResponse,
)
def update_order(
    order_id: int,
    order_data: OrderStatusUpdate,
    db: Annotated[Session, Depends(get_db)],
    user_infos: Annotated[dict, Depends(decode_access_token)],
):
    require_admin(db, user_infos)

    try:
        order = (
            db.query(Order)
            .filter(Order.id == order_id)
            .with_for_update()
            .first()
        )
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        current_lifecycle = _lifecycle_from_order(order)
        if current_lifecycle is None:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Order is in an inconsistent status combination and "
                    "cannot be transitioned automatically. Please correct "
                    "it manually before using lifecycle actions."
                ),
            )

        target_lifecycle = order_data.status

        if target_lifecycle == current_lifecycle:
            raise HTTPException(
                status_code=400,
                detail=f"Order is already {current_lifecycle.value}.",
            )

        allowed_next = ALLOWED_TRANSITIONS.get(current_lifecycle, set())
        if target_lifecycle not in allowed_next:
            raise HTTPException(
                status_code=400,
                detail=_invalid_transition_message(
                    current_lifecycle, target_lifecycle
                ),
            )

        # --------------------------------------------------
        # CANCELLATION: restore inventory + record StockChange
        #
        # See the INVENTORY TIMING note at the top of this file
        # before relying on this in production.
        # --------------------------------------------------
        if target_lifecycle == OrderLifecycleStatus.CANCELLED:
            # Belt-and-suspenders: the transition table already
            # guarantees only PENDING/CONFIRMED can reach here, but
            # this keeps the business rule explicit and self-evident.
            if current_lifecycle not in (
                OrderLifecycleStatus.PENDING,
                OrderLifecycleStatus.CONFIRMED,
            ):
                raise HTTPException(
                    status_code=400,
                    detail="Cannot cancel an order after it has been shipped.",
                )

            for order_item in order.items:
                product_variant = (
                    db.query(ProductVariant)
                    .filter(
                        ProductVariant.id == order_item.product_variant_id
                    )
                    .with_for_update()
                    .first()
                )
                if not product_variant:
                    raise HTTPException(
                        status_code=404,
                        detail=(
                            f"Product variant "
                            f"{order_item.product_variant_id} not found"
                        ),
                    )

                inventory = product_variant.inventory
                if not inventory:
                    raise HTTPException(
                        status_code=400,
                        detail=(
                            f"Inventory not found for product variant "
                            f"{product_variant.id}"
                        ),
                    )

                inventory.quantity += order_item.quantity

                db.add(
                    StockChange(
                        product_variant_id=product_variant.id,
                        change_type=StockChangeType.IN,
                        quantity=order_item.quantity,
                        order_id=order.id,
                    )
                )

        # --------------------------------------------------
        # APPLY THE NEW LIFECYCLE STATE — the backend derives
        # all three fields; the frontend never sends them.
        # --------------------------------------------------
        new_order_status, new_shipping_status, new_payment_status = (
            LIFECYCLE_STATE_MAP[target_lifecycle]
        )
        order.order_status = new_order_status
        order.shipping_status = new_shipping_status
        order.payment_status = new_payment_status

        db.commit()
        db.refresh(order)
        return order

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()
        print(f"Error updating order {order_id}: {e}")
        raise HTTPException(status_code=500, detail="Couldn't update order")
    

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
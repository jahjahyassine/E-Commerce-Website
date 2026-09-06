from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from sqlalchemy.orm import Session

from resend.exceptions import ResendError

from services.email import send_order_confirmation
from routes.cart import clear_cart
from models.inventory import StockChange, StockChangeType
from models.cart import Cart
from models.product import ProductVariant
from models.order import Order, OrderItem, OrderStatus
from models.user import User
from schemas.order import OrderCreate, OrderResponse
from core.database import get_db
from core.security import decode_access_token


router = APIRouter()





@router.get("/orders", response_model=list[OrderResponse])
def get_orders_history(
    db: Annotated[Session, Depends(get_db)],
    user_infos: Annotated[dict, Depends(decode_access_token)],
):
    user_id = user_infos.get("id")

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    orders = db.query(Order).filter(Order.user_id == user_id).all()

    return orders




@router.get("/orders/{order_id}", response_model=OrderResponse)
def get_orders_history(
    db: Annotated[Session, Depends(get_db)],
    order_id: int,
    user_infos: Annotated[dict, Depends(decode_access_token)],
):
    user_id = user_infos.get("id")

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    order = db.query(Order).filter(
        Order.user_id == user_id,
        Order.id == order_id
    ).first()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not Found!"
        )
    return order



@router.post("/orders", response_model=OrderResponse)
def create_order(
    db: Annotated[Session, Depends(get_db)],
    order: OrderCreate,
    user_infos: Annotated[dict, Depends(decode_access_token)],
):
    user_id = user_infos["id"]

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    cart = (
        db.query(Cart)
        .filter(
            Cart.id == user.cart.id,
            Cart.user_id == user_id,
        )
        .first()
    )

    if not cart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart not found",
        )

    if not cart.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty",
        )

    try:
        subtotal = 0

        for item in cart.items:
            product_variant = (
                db.query(ProductVariant)
                .filter(ProductVariant.id == item.product_variant_id)
                .first()
            )

            if not product_variant:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Product variant not found",
                )

            if not product_variant.is_active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Product variant is not available",
                )

            if not product_variant.inventory:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Product is out of stock",
                )

            if product_variant.inventory.quantity < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Insufficient stock",
                )

            price = float(product_variant.price or 0)
            discount = float(product_variant.discount_percentage or 0)

            discount = max(0, min(discount, 100))

            discounted_price = price * (1 - discount / 100)

            subtotal += discounted_price * item.quantity

        delivery_fee = 10 if subtotal > 0 else 0
        total_amount = subtotal + delivery_fee

        new_order = Order(
            user_id=user_id,
            customer_name=order.full_name,
            customer_phone=order.phone,
            shipping_address=order.address,
            shipping_city=order.city,
            shipping_region=order.region,
            shipping_postal_code=order.postal_code,
            total_amount=total_amount,
        )

        db.add(new_order)
        db.flush()

        for item in cart.items:
            product_variant = (
                db.query(ProductVariant)
                .filter(ProductVariant.id == item.product_variant_id)
                .first()
            )

            price = float(product_variant.price or 0)
            discount = float(product_variant.discount_percentage or 0)

            discount = max(0, min(discount, 100))

            discounted_price = price * (1 - discount / 100)

            product_variant.inventory.quantity -= item.quantity

            new_order_item = OrderItem(
                order_id=new_order.id,
                product_variant_id=product_variant.id,
                product_name=product_variant.product.name,
                variant_attributes_snapshot=product_variant.attributes,
                quantity=item.quantity,
                price=discounted_price,
            )

            new_stock_change = StockChange(
                product_variant_id=product_variant.id,
                change_type=StockChangeType.OUT,
                quantity=item.quantity,
                order_id=new_order.id,
            )

            db.add(new_order_item)
            db.add(new_stock_change)

        clear_cart(db, user_infos)

        db.commit()
        db.refresh(new_order)

        try:
            send_order_confirmation(
                order=new_order,
                customer_email=user.email,
            )
        except ResendError as error:
            print(error)

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to send confirmation email: {error}",
            )

        return new_order

    except HTTPException:
        db.rollback()
        raise

    except Exception as e:
        db.rollback()
        print(str(e))

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Couldn't place order",
        )




@router.patch(
    "/orders/{order_id}/cancel",
    response_model=OrderResponse,
)
def cancel_order(
    db: Annotated[
        Session,
        Depends(get_db),
    ],
    order_id: int,
    user_infos: Annotated[
        dict,
        Depends(decode_access_token),
    ],
):
    user_id = user_infos["id"]

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    order = (
        db.query(Order)
        .filter(
            Order.id == order_id,
            Order.user_id == user_id,
        )
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )

    if order.order_status == OrderStatus.CANCELLED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order is already cancelled",
        )

    for item in order.items:

        product_variant = (
            db.query(ProductVariant)
            .filter(
                ProductVariant.id == item.product_variant_id
            )
            .first()
        )

        if not product_variant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    f"Product variant {item.product_variant_id} "
                    "not found"
                ),
            )

        if not product_variant.inventory:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"No inventory found for product variant "
                    f"{product_variant.id}"
                ),
            )

        product_variant.inventory.quantity += item.quantity

        new_stock_change = StockChange(
            product_variant_id=product_variant.id,
            change_type=StockChangeType.IN,
            quantity=item.quantity,
            order_id=order.id,
        )

        db.add(new_stock_change)

    order.order_status = OrderStatus.CANCELLED

    db.commit()
    db.refresh(order)

    return order


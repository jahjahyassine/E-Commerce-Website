from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from sqlalchemy.orm import Session

from models.cart import Cart
from models.product import ProductVariant
from models.order import Order, OrderItem
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



@router.post("/orders", response_model=OrderResponse)
def add_to_cart(
    db: Annotated[Session, Depends(get_db)],
    order: OrderCreate,
    user_infos: Annotated[dict, Depends(decode_access_token)]
):
    user_id = user_infos["id"]

    cart = db.query(Cart).filter(
        Cart.id == order.cart.id,
        Cart.user_id == user_id
    ).first()

    if not cart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart not found"
        )

    new_order = Order (
        user_id=user_id,
        shipping_address=order.shipping_address,
    )
    db.add(new_order)
    db.flush()

    for item in order.cart.items:
        product_variant = (
            db.query(ProductVariant)
            .filter(ProductVariant.id == item.product_variant.id)
            .first()
        )

        if not product_variant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product variant not found"
            )

        if not product_variant.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product variant is not available"
            )

        if product_variant.inventory.quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient stock"
            )

        product_variant.inventory.quantity -= item.quantity

        new_order_item = OrderItem (
            order_id = new_order.id,
            product_variant_id = product_variant.id,
            product_name = product_variant.product.name,
            variant_attributes_snapshot = product_variant.attributes,
            quantity = item.quantity,
            price = product_variant.price
        )

        db.add(new_order_item)

    db.commit()
    db.refresh(new_order)

    return new_order
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from models.product import ProductVariant
from models.cart import Cart, CartItem
from core.security import decode_access_token
from schemas.cart import CartResponse, ItemAddRequest
from core.database import get_db

router = APIRouter()


@router.post("/cart")
def add_to_cart(
    db: Annotated[Session, Depends(get_db)],
    item: ItemAddRequest,
    user_infos: Annotated[dict, Depends(decode_access_token)]
):
    user_id = user_infos["id"]

    product_variant = (
        db.query(ProductVariant)
        .filter(ProductVariant.id == item.variant_id)
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

    cart = (
        db.query(Cart)
        .filter(Cart.user_id == user_id)
        .first()
    )

    if not cart:
        cart = Cart(
            user_id=user_id,
        )

        db.add(cart)
        db.flush()


    cart_item = (
        db.query(CartItem)
        .filter(
            CartItem.cart_id == cart.id,
            CartItem.product_variant_id == item.variant_id
        )
        .first()
    )

    if cart_item:
        new_quantity = cart_item.quantity + item.quantity

        if new_quantity > product_variant.inventory.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Requested quantity exceeds available stock"
            )

        cart_item.quantity = new_quantity

    else:
        cart_item = CartItem (
            cart_id=cart.id,
            product_variant_id=item.variant_id,
            quantity=item.quantity,
            price=product_variant.price
        )
        db.add(cart_item)

    db.commit()
    db.refresh(cart)

    return cart



@router.get("/cart", response_model=CartResponse)
def get_cart(
    db: Annotated[Session, Depends(get_db)],
    user_infos: Annotated[dict, Depends(decode_access_token)]
):
    user_id = user_infos.get("id")

    cart = db.query(Cart).filter(Cart.user_id == user_id).first()

    if not cart:
        cart = Cart(
            user_id=user_id,
        )
        db.add(cart)
        db.commit()

        db.refresh(cart)

    return cart


@router.delete("/cart")
def clear_cart(
    db: Annotated[Session, Depends(get_db)],
    user_infos: Annotated[dict, Depends(decode_access_token)],
):
    user_id = user_infos.get("id")

    cart = db.query(Cart).filter(
        Cart.user_id == user_id,
    ).first()

    if cart is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart not found"
        )

    db.query(CartItem).filter(
        CartItem.cart_id == cart.id
    ).delete()
    db.commit()

    return {"message": "Cart cleared successfully"}



@router.delete("/cart/items/{variant_id}")
def delete_item(
    db: Annotated[Session, Depends(get_db)],
    user_infos: Annotated[dict, Depends(decode_access_token)],
    variant_id: int
):
    user_id = user_infos.get("id")

    cart = db.query(Cart).filter(
        Cart.user_id == user_id
    ).first()

    if cart is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart not found"
        )

    cart_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_variant_id == variant_id
    ).first()

    if cart_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart Item not found"
        )

    db.delete(cart_item)
    db.commit()

    return {"message": "Cart cleared successfully"}
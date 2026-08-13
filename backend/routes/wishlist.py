from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from schemas.wishlist import WishlistResponse
from models.product import Product
from models.wishlist import Wishlist, WishlistProduct
from core.security import decode_access_token
from core.database import get_db

router = APIRouter()


@router.post("/wishlist", response_model=WishlistResponse)
def add_to_cart(
    db: Annotated[Session, Depends(get_db)],
    product_id: int,
    user_infos: Annotated[dict, Depends(decode_access_token)]
):
    user_id = user_infos["id"]

    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    if not product.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product is not available"
        )

    wishlist = (
        db.query(Wishlist)
        .filter(Wishlist.user_id == user_id)
        .first()
    )

    if not wishlist:
        wishlist = Wishlist (
            user_id=user_id,
        )

        db.add(wishlist)
        db.flush()


    wishlist_item = (
        db.query(WishlistProduct)
        .filter(
            WishlistProduct.wishlist_id == wishlist.id,
            WishlistProduct.product_id == product_id
        )
        .first()
    )

    db.add(wishlist_item)

    db.commit()
    db.refresh(wishlist)

    return wishlist


from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status, File
from sqlalchemy import or_
from sqlalchemy.orm import Session

from models.product import Product
from models.review import Review
from schemas.review import ReviewCreate, ReviewResponse
from models.user import User
from core.database import get_db
from core.security import decode_access_token



router = APIRouter()


@router.post("/reviews")
def create_review(
    db: Annotated[Session, Depends(get_db)],
    review: ReviewCreate,
    user_infos: Annotated[dict, Depends(decode_access_token)]
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
            detail="User not found"
        )
    
    product = (
        db.query(Product)
        .filter(
            Product.id == review.product_id
        )
        .first()
    )

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    existing_review = db.query(Review).filter(
        Review.user_id == user_id,
        Review.product_id == review.product_id
    ).first()

    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You Already gave your Opinion"
        )

    new_review = Review (
        review = review.review,
        rating = review.rating,
        user_id = user_id,
        product_id = review.product_id
    )

    product.count_reviews += 1
    average_rating = (product.average_rating + review.rating) / product.count_reviews

    product.average_rating = average_rating

    db.add(new_review)
    db.commit()


    return new_review






@router.get("/reviews/{product_id}/user/{user_id}", response_model=Optional[ReviewResponse])
def get_user_review(
    db: Annotated[Session, Depends(get_db)],
    product_id: int,
    user_id: int
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    product = (
        db.query(Product)
        .filter(
            Product.id == product_id
        )
        .first()
    )

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    review = db.query(Review).filter(
        Review.user_id == user_id,
        Review.product_id == product_id
    ).first()

    

    return review
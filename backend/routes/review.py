from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status, File
from sqlalchemy import or_
from sqlalchemy.orm import Session

from models.product import Product
from models.review import Review
from schemas.review import ReviewCreate, ReviewResponse, ReviewUpdate
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
            detail="You Already ave us Your Opinion"
        )

    new_review = Review (
        review=review.review,
        rating=review.rating,
        user_id=user_id,
        product_id=review.product_id
    )

    db.add(new_review)
    db.flush()

    reviews = db.query(Review).filter(
        Review.product_id == product.id
    ).all()

    product.count_reviews = len(reviews)

    if reviews:
        product.average_rating = sum(r.rating for r in reviews) / len(reviews)
    else:
        product.average_rating = 0


    db.commit()
    db.refresh(new_review)


    return new_review


@router.patch("/reviews/{review_id}")
def update_review(
    review_id: int,
    db: Annotated[Session, Depends(get_db)],
    review_data: ReviewUpdate,
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

    review = (
        db.query(Review)
        .filter(
            Review.id == review_id,
            Review.user_id == user_id
        )
        .first()
    )

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )

    if review_data.rating is not None:
        review.rating = review_data.rating

    if review_data.review is not None:
        review.review = review_data.review

    db.flush()

    reviews = (
        db.query(Review)
        .filter(Review.product_id == review.product_id)
        .all()
    )

    product = (
        db.query(Product)
        .filter(Product.id == review.product_id)
        .first()
    )

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    product.count_reviews = len(reviews)

    if reviews:
        product.average_rating = (
            sum(r.rating for r in reviews) / len(reviews)
        )
    else:
        product.average_rating = 0

    db.commit()
    db.refresh(review)

    return review



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








@router.delete("/reviews/{review_id}")
def delete_review(
    db: Annotated[Session, Depends(get_db)],
    review_id: int,
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
    
    review = db.query(Review).filter(
        Review.id == review_id,
        Review.user_id == user_id
    ).first()

    if not review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Coudn't Find Review"
        )

    product_id = review.product_id

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

    db.delete(review)
    db.flush()

    reviews = db.query(Review).filter(
        Review.product_id == product.id
    ).all()

    product.count_reviews = len(reviews)

    if reviews:
        product.average_rating = sum(r.rating for r in reviews) / len(reviews)
    else:
        product.average_rating = 0

    db.commit()


    return {
        "message": "Review Deleted Successfully"
    }
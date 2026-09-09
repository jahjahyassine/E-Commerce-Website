from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import false, or_
from sqlalchemy.orm import Session

from models.product import Product
from models.review import Review
from schemas.review import ReviewResponse
from models.user import User
from core.database import get_db
from core.security import decode_access_token

from routes.admin.inventory import require_admin


from schemas.user import (
    CustomerResponse,
    UserDeactivateRequest,
    UserPatch,
)


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)






@router.get(
    "/reviews",
    response_model=list[ReviewResponse],
)
def get_users(
    db: Annotated[
        Session,
        Depends(get_db),
    ],
    user_infos: Annotated[
        dict,
        Depends(decode_access_token),
    ],
    search: str | None = None,
    rating: int | None = None
):
    require_admin(db, user_infos)

    query = (
    db.query(Review)
        .join(Product, Review.product_id == Product.id)
        .join(User, Review.user_id == User.id)
    )

    if search and search.strip():
        search_pattern = f"%{search.strip()}%"

        query = query.filter(
            or_(
                Review.review.ilike(search_pattern),
                User.full_name.ilike(search_pattern),
                User.email.ilike(search_pattern),
                User.username.ilike(search_pattern),
                Product.name.ilike(search_pattern),
                Product.description.ilike(search_pattern),
            )
        )

    if rating is not None:
        query = query.filter(
            Review.rating >= rating
        )

    return (
        query
        .order_by(Review.created_at.desc())
        .all()
    )


@router.delete("/reviews/{review_id}")
def delete_review(
    review_id: int,
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

    review = (
        db.query(Review)
        .filter(Review.id == review_id)
        .first()
    )

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
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
        "message": "Review deleted successfully"
    }


@router.get(
    "/users/{user_id}",
    response_model=CustomerResponse,
)
def get_user(
    user_id: int,
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

    return user





@router.patch("/users/{user_id}")
def patch_user_infos(
    db: Annotated[Session, Depends(get_db)],
    user_id: int,
    data: UserDeactivateRequest,
    user_infos: Annotated[
        dict,
        Depends(decode_access_token),
    ],
):
    require_admin(db, user_infos)
    
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
    
    user.is_active = False

    db.commit()

    return {
        "message": "User deactivated successfully"
    }

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import false
from sqlalchemy.orm import Session

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
    "/users",
    response_model=list[CustomerResponse],
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
    role: str | None = None,
    is_active: bool | None = None,
):
    require_admin(db, user_infos)

    query = db.query(User)

    if search:
        search_pattern = search.strip()

        if search_pattern:
            query = query.filter(
                (
                    User.username.ilike(
                        f"%{search_pattern}%"
                    )
                    | User.full_name.ilike(
                        f"%{search_pattern}%"
                    )
                    | User.email.ilike(
                        f"%{search_pattern}%"
                    )
                    | User.phone.ilike(
                        f"%{search_pattern}%"
                    )
                )
            )

    if role:
        query = query.filter(
            User.role == role
        )

    if is_active is not None:
        query = query.filter(
            User.is_active == is_active
        )

    return query.order_by(
        User.created_at.desc()
    ).all()



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

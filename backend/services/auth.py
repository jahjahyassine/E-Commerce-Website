from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.user import User, UserRole



def require_admin(
    db: Session,
    user_infos: dict,
):
    user_id = user_infos.get("id")

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

    if user.role != UserRole.CUSTOMER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized action",
        )

    return user
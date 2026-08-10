from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from models.user import User
from schemas.user import UserRegister
from core.database import get_db


router = APIRouter()




@router.post("/auth/register")
def register_user(db: Annotated[Session, Depends(get_db)], credentials: UserRegister):
    existing_user = db.query(User).filter(
        (User.username == credentials.username) |
        (User.email == credentials.email)
    ).first()

    if (existing_user):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with these credentials already exists"
        )


    new_user = User(
        username=credentials.username,
        full_name=credentials.full_name,
        email=credentials.email
        password_hash
    )
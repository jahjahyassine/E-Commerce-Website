from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from models.user import User, UserRole
from schemas.user import UserLogin, UserRegister
from core.database import get_db
from core.security import get_password_hash, verify_password, create_access_token


router = APIRouter()




@router.post("/auth/register")
def register_user(db: Annotated[Session, Depends(get_db)], credentials: UserRegister):
    existing_user = db.query(User).filter(
        or_(User.username == credentials.username,
        User.email == credentials.email)
    ).first()

    if (existing_user):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with these credentials already exists"
        )


    new_user = User(
        username=credentials.username,
        full_name=credentials.full_name,
        email=credentials.email,
        password_hash=get_password_hash(credentials.password),
        role=UserRole.CUSTOMER
    )

    db.add(new_user)
    db.commit()

    db.refresh(new_user)

    return new_user






@router.post("/auth/login")
def login_user(db: Annotated[Session, Depends(get_db)], credentials: UserLogin):
    user = db.query(User).filter(
        or_(User.username == credentials.identifier, 
        User.email == credentials.identifier
        )).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid username or password"
        )

    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is Inactive"
        )

    if credentials.rememberOption:
        expires_delta = timedelta(days=30)
    else:
        expires_delta = timedelta(minutes=30)


    access_token = create_access_token(user.id, user.role, expires_delta)


    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
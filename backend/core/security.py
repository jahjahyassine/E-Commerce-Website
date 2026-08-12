from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import Depends, HTTPException, status
from pwdlib import PasswordHash
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from .config import settings


password_hash = PasswordHash.recommended()
oauth_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")



def get_password_hash(password) -> str:
    return password_hash.hash(password)


def verify_password(plain_password, hashed_password) -> bool:
    return password_hash.verify(plain_password, hashed_password)







def create_access_token(user_id: int, role: str, expires_delta: timedelta | None = None) -> str:

    expire = datetime.now(timezone.utc) + expires_delta

    payload = {
        "sub": str(user_id),
        "role": role,
        "exp": expire
    }

    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    return token



def decode_access_token(token: Annotated[str, Depends(oauth_scheme)]):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

        user_id = payload.get("sub")

        role = payload.get("role")

        return {
            "id": int(user_id),
            "role": role
        }
    except (JWTError, ValueError):  
        raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired token",
                    headers={"WWW-Authenticate": "Bearer"},
                )
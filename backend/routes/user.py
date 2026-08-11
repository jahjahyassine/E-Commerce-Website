from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from schemas.user import UserResponse
from models.user import User
from core.database import get_db
from core.security import decode_access_token



router = APIRouter()




@router.get("/me", response_model=UserResponse)
def get_current_user(
    db: Annotated[Session, Depends(get_db)],
    user_infos: Annotated[dict, Depends(decode_access_token)],
):
    user_id = user_infos.get("id")
    
    user = db.query(User).filter(User.id == user_id).first()

    return user
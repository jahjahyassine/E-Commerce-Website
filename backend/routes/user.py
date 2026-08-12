from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status, File
from sqlalchemy import or_
from sqlalchemy.orm import Session

from schemas.user import UserPatch, UserResponse
from models.user import User
from core.database import get_db
from core.security import decode_access_token

from core.cloudinary import cloudinary


router = APIRouter()




@router.get("/me", response_model=UserResponse)
def get_current_user(
    db: Annotated[Session, Depends(get_db)],
    user_infos: Annotated[dict, Depends(decode_access_token)],
):
    user_id = user_infos.get("id")
    
    user = db.query(User).filter(User.id == user_id).first()

    return {
        "id": user.id,
        "username": user.username,
        "full_name": user.full_name,
        "email": user.email,
        "role": user.role,
        "phone": user.phone,
        "address": user.address,
        "is_active": user.is_active,
        "profile_pic_path": user.profile_pic_path
    }




@router.patch("/profile")
def patch_user_infos(
    db: Annotated[Session, Depends(get_db)],
    user_infos: Annotated[dict, Depends(decode_access_token)],
    data: UserPatch
):
    user_id = user_infos.get("id")

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
    
    updates = data.model_dump(exclude_unset=True)

    for key, value in updates.items():
        if key in ("username", "email"):
            existing_identifier = db.query(User).filter(
                User.id != user_id,
                or_ (
                    User.username == value,
                    User.email == value
                )).first()

            if existing_identifier:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Identifier Already Exists!"
                )

        setattr(user, key, value)

    db.commit()






@router.patch("/profile/picture")
def change_profile_picture(
    db: Annotated[Session, Depends(get_db)],
    user_infos: Annotated[dict, Depends(decode_access_token)],
    file: UploadFile = File(...)
):
    user_id = user_infos.get("id")

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    image_upload = cloudinary.uploader.upload(file.file)

    image_url = image_upload["secure_url"]

    user.profile_pic = image_url

    db.commit()
    db.refresh(user)

    return {
        "message": "Profile picture updated successfully",
        "profile_pic_path": user.profile_pic_path
    }

        
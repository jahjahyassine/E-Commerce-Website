from __future__ import annotations
from typing import TYPE_CHECKING

from core.database import Base

if TYPE_CHECKING:
    from review import Review
    from order import Order

from sqlalchemy import Integer, String, Enum, Text, DateTime
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy.orm import func
from sqlalchemy.orm import Enum as SQLEnum
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    CUSTOMER = "CUSTOMER"
    ADMIN = "ADMIN"
    

class User (Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String, unique=True)
    full_name: Mapped[str | None] = mapped_column(String)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    phone: Mapped[str | None] = mapped_column(String)
    address: Mapped[str | None] = mapped_column(Text)

    role: Mapped[UserRole] = mapped_column(SQLEnum(UserRole), nullable=False)

    profile_pic: Mapped[str | None] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="user")

    orders: Mapped[list["Order"]] = relationship("Order", back_populates="user")

    @property
    def profile_pic_path(self):
        if (self.profile_pic):
            return self.profile_pic
        return "https://res.cloudinary.com/whjcsnpt/image/upload/v1785942298/swappy-20260805_160104_ihiqha.png"
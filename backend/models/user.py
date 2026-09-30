from __future__ import annotations
from typing import TYPE_CHECKING


from core.database import Base
from core.config import settings

if TYPE_CHECKING:
    from models.review import Review
    from models.order import Order
    from models.cart import Cart
    from models.chatbot import ChatMessage

from sqlalchemy import Boolean, Integer, String, Enum, Text, DateTime, text
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy import func
from sqlalchemy import Enum as SQLEnum
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    CUSTOMER = "CUSTOMER"
    ADMIN = "ADMIN"
    

class User (Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(100), unique=True)
    full_name: Mapped[str | None] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20))
    address: Mapped[str | None] = mapped_column(Text)
    city: Mapped[str | None] = mapped_column(String(100))
    region: Mapped[str | None] = mapped_column(String(100))
    postal_code: Mapped[str | None] = mapped_column(String(20))

    role: Mapped[UserRole] = mapped_column(SQLEnum(UserRole), nullable=False, server_default=UserRole.CUSTOMER.value)

    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))
    
    profile_pic: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="user")

    orders: Mapped[list["Order"]] = relationship("Order", back_populates="user")

    cart: Mapped["Cart"] = relationship("Cart", back_populates="user", uselist=False)

    chat_messages: Mapped[list["ChatMessage"]] = relationship(
        "ChatMessage",
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="ChatMessage.created_at"
    )

    @property
    def profile_pic_path(self) -> str:
        if (self.profile_pic):
            return self.profile_pic
        return settings.DEFAULT_AVATAR_URL
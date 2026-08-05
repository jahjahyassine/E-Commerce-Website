from __future__ import annotations
from typing import TYPE_CHECKING

from core.database import Base

if TYPE_CHECKING:
    from user import User
    from product import Product

from sqlalchemy import ForeignKey, Integer, String, DateTime
from sqlalchemy.orm import Mapped, relationship, mapped_column
from sqlalchemy.orm import func
from datetime import datetime


class Review (Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    review: Mapped[str] = mapped_column(String, nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())


    user: Mapped["User"] = relationship("User", back_populates="reviews")

    product: Mapped["Product"] = relationship("Product", back_populates="reviews")
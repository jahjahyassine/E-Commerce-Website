from __future__ import annotations
from typing import TYPE_CHECKING

from core.database import Base

if TYPE_CHECKING:
    from product import Product, ProductVariant
    from user import User
    from inventory import StockChange

from sqlalchemy import CheckConstraint, ForeignKey, Integer, DateTime, Numeric
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy import func
from sqlalchemy import Enum as SQLEnum
from datetime import datetime
from enum import Enum
from decimal import Decimal

    

class Cart (Base):
    __tablename__ = "carts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, unique=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user: Mapped[User] = relationship("User", back_populates="cart")

    items: Mapped[list["CartItem"]] = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")



class CartItem (Base):
    __tablename__ = "cart_items"

    cart_id: Mapped[int] = mapped_column(ForeignKey("carts.id", ondelete='CASCADE'), primary_key=True, index=True)
    product_variant_id: Mapped[int] = mapped_column(ForeignKey("product_variants.id", ondelete='RESTRICT'), primary_key=True, index=True)

    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    cart: Mapped["Cart"] = relationship("Cart", back_populates="items")

    product_variant: Mapped["ProductVariant"] = relationship("ProductVariant", back_populates="cart_items")

    __table_args__ = (
        CheckConstraint(
            "quantity > 0",
            name="ck_cart_item_quantity_positive"
        ),
        CheckConstraint(
            "price >= 0",
            name="ck_cart_item_price_non_negative"
        )
    )
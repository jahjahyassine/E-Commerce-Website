from __future__ import annotations
from typing import TYPE_CHECKING, Any

from core.database import Base

if TYPE_CHECKING:
    from product import Product, ProductVariant
    from user import User
    from inventory import StockChange

from sqlalchemy import CheckConstraint, ForeignKey, Integer, String, Text, DateTime, Numeric
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy import func
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from enum import Enum
from decimal import Decimal


class ShippingStatus(str, Enum):
    NOT_SHIPPED = "NOT_SHIPPED"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"

class OrderStatus(str, Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    REFUNDED = "REFUNDED"

    

class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        index=True
    )

    # Customer snapshot
    customer_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    customer_phone: Mapped[str] = mapped_column(
        String(30),
        nullable=False
    )

    shipping_address: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    shipping_city: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    shipping_region: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    shipping_postal_code: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True
    )

    order_status: Mapped[OrderStatus] = mapped_column(
        SQLEnum(OrderStatus),
        nullable=False,
        server_default="PENDING"
    )

    shipping_status: Mapped[ShippingStatus] = mapped_column(
        SQLEnum(ShippingStatus),
        nullable=False,
        server_default="NOT_SHIPPED"
    )

    payment_status: Mapped[PaymentStatus] = mapped_column(
        SQLEnum(PaymentStatus),
        nullable=False,
        server_default="PENDING"
    )

    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        index=True
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="orders"
    )

    items: Mapped[list["OrderItem"]] = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan"
    )

    stock_changes: Mapped[list["StockChange"]] = relationship(
        "StockChange",
        back_populates="order"
    )

    __table_args__ = (
        CheckConstraint(
            "total_amount >= 0",
            name="ck_order_price_non_negative"
        ),
    )


    

class OrderItem (Base):
    __tablename__ = "order_items"

    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete='CASCADE'), primary_key=True, index=True)
    product_variant_id: Mapped[int] = mapped_column(ForeignKey("product_variants.id", ondelete='RESTRICT'), primary_key=True, index=True)

    product_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    variant_attributes_snapshot: Mapped[dict[str, Any]] = mapped_column(
        JSONB,
        nullable=False,
    )

    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    order: Mapped["Order"] = relationship("Order", back_populates="items")

    product_variant: Mapped["ProductVariant"] = relationship("ProductVariant", back_populates="order_items")

    __table_args__ = (
        CheckConstraint(
            "quantity > 0",
            name="ck_order_item_quantity_positive"
        ),
        CheckConstraint(
            "price >= 0",
            name="ck_order_items_price_non_negative"
        )
    )

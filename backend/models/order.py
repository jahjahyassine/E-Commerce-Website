from __future__ import annotations
from typing import TYPE_CHECKING

from core.database import Base

if TYPE_CHECKING:
    from product import Product
    from user import User
    from inventory import StockChange

from sqlalchemy import ForeignKey, Integer, Enum, Text, DateTime, Numeric
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy.orm import func
from sqlalchemy.orm import Enum as SQLEnum
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

    

class Order (Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    shipping_address: Mapped[str] = mapped_column(Text, nullable=False)

    order_status: Mapped[OrderStatus] = mapped_column(SQLEnum(OrderStatus), nullable=False)
    shipping_status: Mapped[ShippingStatus] = mapped_column(SQLEnum(ShippingStatus), nullable=False)
    payment_status: Mapped[PaymentStatus] = mapped_column(SQLEnum(PaymentStatus), nullable=False)

    total_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    user: Mapped[User] = relationship("User", back_populates="orders")

    items: Mapped[list["OrderItem"]] = relationship("OrderItem", back_populates="order")

    stock_changes: Mapped[list["StockChange"]] = relationship("StockChange", back_populates="order")



class OrderItem (Base):
    __tablename__ = "order_items"

    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), primary_key=True)

    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    order: Mapped["Order"] = relationship("Order", back_populates="items")

    product: Mapped["Product"] = relationship("Product", back_populates="order_items")
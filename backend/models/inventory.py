from __future__ import annotations
from typing import TYPE_CHECKING, Optional

from core.database import Base

if TYPE_CHECKING:
    from product import Product, ProductVariant
    from order import Order

from sqlalchemy import Boolean, CheckConstraint, ForeignKey, Integer, String, Text, DateTime, text
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy import func
from sqlalchemy import Enum as SQLEnum
from datetime import datetime
from enum import Enum


class StockChangeType (str, Enum):
    IN = "IN"
    OUT = "OUT"



class Inventory (Base):
    __tablename__ = "inventories"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    product_variant_id: Mapped[int] = mapped_column(ForeignKey("product_variants.id", ondelete="CASCADE"), unique=True)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)

    product_variant: Mapped["ProductVariant"] = relationship("ProductVariant", back_populates="inventory")

    __table_args__ = (
        CheckConstraint("quantity >= 0", name="ck_inventories_quantity_non_negative"),
    )   


class Supplier (Base):
    __tablename__ = "suppliers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    email: Mapped[str | None] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(20))
    address: Mapped[str | None] = mapped_column(Text)

    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    stock_changes: Mapped[list["StockChange"]] = relationship("StockChange", back_populates="supplier", cascade="save-update, merge")



class StockChange (Base):
    __tablename__ = "stock_changes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    product_variant_id: Mapped[int] = mapped_column(ForeignKey("product_variants.id", ondelete="RESTRICT"), nullable=False, index=True)

    change_type: Mapped[StockChangeType] = mapped_column(SQLEnum(StockChangeType))

    quantity: Mapped[int] = mapped_column(Integer, nullable=False)

    supplier_id: Mapped[int | None] = mapped_column(ForeignKey("suppliers.id", ondelete="SET NULL"), nullable=True, index=True)
    order_id: Mapped[int | None] = mapped_column(ForeignKey("orders.id", ondelete="RESTRICT"), nullable=True, index=True)

    changed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    order: Mapped[Optional["Order"]] = relationship("Order", back_populates="stock_changes")

    supplier: Mapped[Optional["Supplier"]] = relationship("Supplier", back_populates="stock_changes")

    product_variant: Mapped["ProductVariant"] = relationship("ProductVariant", back_populates="stock_changes")

    __table_args__ = (
        CheckConstraint(
            "quantity > 0",
            name="ck_stock_change_quantity_positive"
        ),
    )
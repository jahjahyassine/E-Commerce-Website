from __future__ import annotations
from typing import TYPE_CHECKING

from core.database import Base

if TYPE_CHECKING:
    from product import Product
    from order import Order

from sqlalchemy import ForeignKey, Integer, String, Text, DateTime
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy.orm import func
from sqlalchemy.orm import Enum as SQLEnum
from datetime import datetime
from enum import Enum


class StockChangeType (str, Enum):
    IN = "IN"
    OUT = "OUT"



class Inventory (Base):
    __tablename__ = "inventories"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), unique=True)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)

    product: Mapped["Product"] = relationship("Product", back_populates="inventory")



class Supplier (Base):
    __tablename__ = "suppliers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, unique=True)
    email: Mapped[str | None] = mapped_column(String)
    phone: Mapped[str | None] = mapped_column(String)
    address: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    stock_changes: Mapped[list["StockChange"]] = relationship("StockChange", back_populates="supplier")



class StockChange (Base):
    __tablename__ = "stock_changes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))

    change_type: Mapped[StockChangeType] = mapped_column(SQLEnum(StockChangeType))

    quantity: Mapped[int] = mapped_column(Integer, nullable=False)

    supplier_id: Mapped[int | None] = mapped_column(ForeignKey("suppliers.id"), nullable=True)
    order_id: Mapped[int | None] = mapped_column(ForeignKey("orders.id"), nullable=True)

    changed_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    order: Mapped["Order" | None] = relationship("Order", back_populates="stock_changes")

    supplier: Mapped["Supplier" | None] = relationship("Supplier", back_populates="stock_changes")

    product: Mapped["Product"] = relationship("Product", back_populates="stock_changes")
from __future__ import annotations
from typing import TYPE_CHECKING
from typing import Any

from core.database import Base

if TYPE_CHECKING:
    from review import Review
    from order import OrderItem
    from inventory import Inventory, StockChange

from sqlalchemy import JSON, Boolean, Column, ForeignKey, Integer, Numeric, String, Table, Text, DateTime
from sqlalchemy.orm import Mapped, relationship, mapped_column
from sqlalchemy.orm import func
from datetime import datetime
from decimal import Decimal

    

class Product (Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    specifications: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    discount_percentage: Mapped[float | None] = mapped_column(Numeric(10, 2))
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False)

    brand_id: Mapped[int] = mapped_column(ForeignKey("brands.id"))
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"))

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    inventory: Mapped["Inventory"] = relationship("Inventory", back_populates="product", uselist=False)

    brand: Mapped["Brand"] = relationship("Brand", back_populates="products")

    category: Mapped["Category"] = relationship("Category", back_populates="products")

    media: Mapped[list["Media"]] = relationship("Media", back_populates="product")

    tags: Mapped[list["Tag"]] = relationship("Tag", secondary="product_tags",  back_populates="products")

    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="product")

    order_items: Mapped[list["OrderItem"]] = relationship("OrderItem", back_populates="product")

    stock_changes: Mapped[list["StockChange"]] = relationship("StockChange", back_populates="product")




class Brand (Base):
    __tablename__ = "brands"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, unique=True)

    products: Mapped[list["Product"]] = relationship("Product", back_populates="brand")




class Category (Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, unique=True)

    products: Mapped[list["Product"]] = relationship("Product", back_populates="category")



class Media (Base):
    __tablename__ = "medias"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    media_url: Mapped[str] = mapped_column(String, nullable=False)

    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))

    product: Mapped["Product"] = relationship("Product", back_populates="media")



class Tag (Base):
    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, unique=True)

    products: Mapped[list["Product"]] = relationship("Product", secondary="product_tags", back_populates="tags")



product_tags = Table(
    "product_tags",
    Base.metadata,
    Column(
        "product_id",
        ForeignKey("products.id"),
        primary_key=True
    ),
    Column(
        "tag_id",
        ForeignKey("tags.id"),
        primary_key=True
    )
)
from __future__ import annotations
from typing import TYPE_CHECKING
from typing import Any

from core.database import Base

if TYPE_CHECKING:
    from models.review import Review
    from models.order import OrderItem
    from models.inventory import Inventory, StockChange
    from models.cart import CartItem
    from models.wishlist import WishlistProduct

    
from sqlalchemy import Boolean, CheckConstraint, Column, ForeignKey, Integer, Numeric, String, Table, Text, DateTime, UniqueConstraint, text
from sqlalchemy.orm import Mapped, relationship, mapped_column
from sqlalchemy import func
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from decimal import Decimal

    

class Product (Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    specifications: Mapped[dict[str,Any] | None] = mapped_column(JSONB)

    min_price: Mapped[Decimal] = mapped_column(
        Numeric(10,2), nullable=False, server_default=text("0")
    )

    average_rating: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False, server_default=text("0"))
    count_reviews: Mapped[int] = mapped_column(Integer, nullable=False, server_default=text("0"))
    
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"), index=True)

    brand_id: Mapped[int] = mapped_column(ForeignKey("brands.id", ondelete='RESTRICT'), index=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id", ondelete='RESTRICT'), index=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    

    brand: Mapped["Brand"] = relationship("Brand", back_populates="products")

    category: Mapped["Category"] = relationship("Category", back_populates="products")

    media: Mapped[list["Media"]] = relationship("Media", back_populates="product", cascade="all, delete-orphan")

    tags: Mapped[list["Tag"]] = relationship("Tag", secondary="product_tags",  back_populates="products")

    reviews: Mapped[list["Review"]] = relationship("Review", back_populates="product", cascade="all, delete-orphan")

    product_variants: Mapped[list["ProductVariant"]] = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint(
            "min_price >= 0",
            name="ck_product_min_price_non_negative"
        ),
        CheckConstraint(
            "average_rating >= 0 AND average_rating <= 5",
            name="ck_product_average_rating_range"
        ),
        CheckConstraint(
            "count_reviews >= 0",
            name="ck_product_count_reviews_non_negative"
        )
    )
    

class ProductVariant (Base):
    __tablename__ = "product_variants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"),
        index=True
    )
    sku: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    discount_percentage: Mapped[Decimal] = mapped_column(Numeric(5, 2), server_default=text("0"), nullable=False)
    attributes: Mapped[dict[str, Any] | None] = mapped_column(JSONB, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))

    inventory: Mapped["Inventory | None"] = relationship("Inventory", back_populates="product_variant", uselist=False, cascade="all, delete-orphan")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    product: Mapped[Product] = relationship("Product", back_populates="product_variants")

    order_items: Mapped[list["OrderItem"]] = relationship("OrderItem", back_populates="product_variant")
    
    cart_items: Mapped[list["CartItem"]] = relationship("CartItem", back_populates="product_variant")

    stock_changes: Mapped[list["StockChange"]] = relationship("StockChange", back_populates="product_variant")

    media: Mapped[list["Media"]] = relationship("Media", back_populates="product_variant", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint(
            "price >= 0",
            name="ck_variant_price_non_negative"
        ),
        CheckConstraint(
            "discount_percentage >= 0 AND discount_percentage <= 100",
            name="ck_variant_discount_range"
        ),
        UniqueConstraint(
            "product_id", "attributes",
            name="uq_product_variant_product_attributes"
        )
    )


class Brand (Base):
    __tablename__ = "brands"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, unique=True)

    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))

    products: Mapped[list["Product"]] = relationship("Product", back_populates="brand")




class Category (Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, unique=True)

    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default=text("true"))

    products: Mapped[list["Product"]] = relationship("Product", back_populates="category")



class Media (Base):
    __tablename__ = "medias"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    media_url: Mapped[str] = mapped_column(String, nullable=False)

    product_id: Mapped[int | None] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"))
    variant_id: Mapped[int | None] = mapped_column(
        ForeignKey("product_variants.id", ondelete="CASCADE"),
        nullable=True
    )

    product: Mapped["Product | None"] = relationship("Product", back_populates="media")
    product_variant: Mapped["ProductVariant | None"] = relationship(
        "ProductVariant",
        back_populates="media"
    )

    __table_args__ = (
        CheckConstraint(
            "(product_id IS NOT NULL AND variant_id IS NULL) OR (product_id IS NULL AND variant_id IS NOT NULL)",
            name="media_exactly_one_owner",
        ),
    )


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
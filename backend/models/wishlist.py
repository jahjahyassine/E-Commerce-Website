from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, func

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from models.product import Product
    from models.user import User


from core.database import Base

from sqlalchemy.orm import mapped_column, Mapped, relationship


class Wishlist (Base):
    __tablename__ = "wishlists"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        unique=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="wishlist"
    )

    products: Mapped[list["WishlistProduct"]] = relationship(
        "WishlistProduct",
        back_populates="wishlist",
        cascade="all, delete-orphan"
    )


class WishlistProduct(Base):
    __tablename__ = "wishlist_products"

    wishlist_id: Mapped[int] = mapped_column(
        ForeignKey("wishlists.id", ondelete="CASCADE"),
        primary_key=True,
        index=True
    )

    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="RESTRICT"),
        primary_key=True,
        index=True
    )

    wishlist: Mapped["Wishlist"] = relationship(
        "Wishlist",
        back_populates="products"
    )

    product: Mapped["Product"] = relationship(
        "Product",
        back_populates="wishlist_items"
    )
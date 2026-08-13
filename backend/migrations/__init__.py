# models/__init__.py
from sqlalchemy.orm import configure_mappers

from models.user import User
from models.product import (
    Product,
    ProductVariant,
    Brand,
    Category,
    Media,
    Tag,
)
from models.review import Review
from models.order import Order, OrderItem
from models.cart import Cart, CartItem
from models.inventory import Inventory, Supplier, StockChange
from models.wishlist import Wishlist, WishlistProduct

# Force SQLAlchemy to configure all mappers immediately on startup
configure_mappers()
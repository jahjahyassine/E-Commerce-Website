from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, desc
from sqlalchemy.orm import Session, joinedload

from core.database import get_db
from models.user import User
from models.product import Product, ProductVariant
from models.order import Order, OrderItem, OrderStatus
from models.inventory import Inventory


router = APIRouter(
    prefix="/admin/dashboard",
    tags=["Dashboard"],
)


from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, desc
from sqlalchemy.orm import Session

from core.database import get_db

from models.user import User
from models.product import Product, ProductVariant, Category, Brand
from models.order import Order, OrderItem, OrderStatus


router = APIRouter(
    prefix="/admin/dashboard",
    tags=["Dashboard"],
)


@router.get("/")
def get_dashboard(
    db: Session = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    last_30_days = now - timedelta(days=30)

    # ============================================================
    # BASIC STATISTICS
    # ============================================================

    # Total customers - all time
    total_customers = (
        db.query(func.count(User.id))
        .filter(
            User.role == "CUSTOMER",
        )
        .scalar()
        or 0
    )

    # Total products - all time
    total_products = (
        db.query(func.count(Product.id))
        .scalar()
        or 0
    )

    # Total orders - all time
    # IMPORTANT:
    # Cancelled orders ARE included here.
    total_orders = (
        db.query(func.count(Order.id))
        .scalar()
        or 0
    )

    # Cancelled orders - all time
    cancelled_orders = (
        db.query(func.count(Order.id))
        .filter(
            Order.order_status == OrderStatus.CANCELLED,
        )
        .scalar()
        or 0
    )

    # ============================================================
    # REVENUE
    # ============================================================

    # Total revenue - all time
    # Cancelled orders excluded.
    total_revenue = (
        db.query(
            func.coalesce(
                func.sum(
                    OrderItem.quantity * OrderItem.price
                ),
                0,
            )
        )
        .join(
            Order,
            Order.id == OrderItem.order_id,
        )
        .filter(
            Order.order_status != OrderStatus.CANCELLED,
        )
        .scalar()
        or 0
    )

    # Last 30 days revenue
    # Cancelled orders excluded.
    last_30_days_revenue = (
        db.query(
            func.coalesce(
                func.sum(
                    OrderItem.quantity * OrderItem.price
                ),
                0,
            )
        )
        .join(
            Order,
            Order.id == OrderItem.order_id,
        )
        .filter(
            Order.created_at >= last_30_days,
            Order.order_status != OrderStatus.CANCELLED,
        )
        .scalar()
        or 0
    )

    # Last 30 days orders
    # Cancelled orders excluded.
    last_30_days_orders = (
        db.query(func.count(Order.id))
        .filter(
            Order.created_at >= last_30_days,
            Order.order_status != OrderStatus.CANCELLED,
        )
        .scalar()
        or 0
    )

    # ============================================================
    # CUSTOMER STATISTICS
    # ============================================================

    # New customers - last 30 days
    new_customers = (
        db.query(func.count(User.id))
        .filter(
            User.role == "CUSTOMER",
            User.created_at >= last_30_days,
        )
        .scalar()
        or 0
    )

    # Average order value - last 30 days
    average_order_value = (
        float(last_30_days_revenue) / last_30_days_orders
        if last_30_days_orders > 0
        else 0
    )

    # Cancellation rate - all time
    cancellation_rate = (
        (cancelled_orders / total_orders) * 100
        if total_orders > 0
        else 0
    )

    # ============================================================
    # TOP CATEGORIES - LAST 30 DAYS
    # ============================================================
    #
    # Returns the COMPLETE ranking.
    #
    # Frontend:
    #   dashboard -> top_categories.slice(0, 5)
    #   see more  -> entire top_categories array
    #
    # Ordered by units sold.
    #

    top_categories_query = (
        db.query(
            Category.id.label("category_id"),
            Category.name.label("category_name"),

            func.count(
                func.distinct(Order.id)
            ).label("orders"),

            func.coalesce(
                func.sum(OrderItem.quantity),
                0,
            ).label("sales"),

            func.coalesce(
                func.sum(
                    OrderItem.quantity * OrderItem.price
                ),
                0,
            ).label("revenue"),
        )
        .join(
            Product,
            Product.category_id == Category.id,
        )
        .join(
            ProductVariant,
            ProductVariant.product_id == Product.id,
        )
        .join(
            OrderItem,
            OrderItem.product_variant_id == ProductVariant.id,
        )
        .join(
            Order,
            Order.id == OrderItem.order_id,
        )
        .filter(
            Order.created_at >= last_30_days,
            Order.order_status != OrderStatus.CANCELLED,
        )
        .group_by(
            Category.id,
            Category.name,
        )
        .order_by(
            desc("sales"),
            desc("revenue"),
        )
        .all()
    )

    top_categories = [
        {
            "category_id": item.category_id,
            "category_name": item.category_name,
            "orders": int(item.orders or 0),
            "sales": int(item.sales or 0),
            "revenue": float(item.revenue or 0),
        }
        for item in top_categories_query
    ]

    # ============================================================
    # TOP BRANDS - LAST 30 DAYS
    # ============================================================
    #
    # Returns the COMPLETE ranking.
    #
    # Ordered by units sold.
    #

    top_brands_query = (
        db.query(
            Brand.id.label("brand_id"),
            Brand.name.label("brand_name"),

            func.count(
                func.distinct(Order.id)
            ).label("orders"),

            func.coalesce(
                func.sum(OrderItem.quantity),
                0,
            ).label("sales"),

            func.coalesce(
                func.sum(
                    OrderItem.quantity * OrderItem.price
                ),
                0,
            ).label("revenue"),
        )
        .join(
            Product,
            Product.brand_id == Brand.id,
        )
        .join(
            ProductVariant,
            ProductVariant.product_id == Product.id,
        )
        .join(
            OrderItem,
            OrderItem.product_variant_id == ProductVariant.id,
        )
        .join(
            Order,
            Order.id == OrderItem.order_id,
        )
        .filter(
            Order.created_at >= last_30_days,
            Order.order_status != OrderStatus.CANCELLED,
        )
        .group_by(
            Brand.id,
            Brand.name,
        )
        .order_by(
            desc("sales"),
            desc("revenue"),
        )
        .all()
    )

    top_brands = [
        {
            "brand_id": item.brand_id,
            "brand_name": item.brand_name,
            "orders": int(item.orders or 0),
            "sales": int(item.sales or 0),
            "revenue": float(item.revenue or 0),
        }
        for item in top_brands_query
    ]

    # ============================================================
    # TOP PRODUCTS - LAST 30 DAYS
    # ============================================================
    #
    # Returns the COMPLETE ranking.
    #
    # Ordered by units sold.
    #

    top_products_query = (
        db.query(
            Product.id.label("product_id"),
            Product.name.label("product_name"),

            func.count(
                func.distinct(Order.id)
            ).label("orders"),

            func.coalesce(
                func.sum(OrderItem.quantity),
                0,
            ).label("sales"),

            func.coalesce(
                func.sum(
                    OrderItem.quantity * OrderItem.price
                ),
                0,
            ).label("revenue"),
        )
        .join(
            ProductVariant,
            ProductVariant.product_id == Product.id,
        )
        .join(
            OrderItem,
            OrderItem.product_variant_id == ProductVariant.id,
        )
        .join(
            Order,
            Order.id == OrderItem.order_id,
        )
        .filter(
            Order.created_at >= last_30_days,
            Order.order_status != OrderStatus.CANCELLED,
        )
        .group_by(
            Product.id,
            Product.name,
        )
        .order_by(
            desc("sales"),
            desc("revenue"),
        )
        .all()
    )

    top_products = [
        {
            "product_id": item.product_id,
            "product_name": item.product_name,
            "orders": int(item.orders or 0),
            "sales": int(item.sales or 0),
            "revenue": float(item.revenue or 0),
        }
        for item in top_products_query
    ]

    # ============================================================
    # TOP CUSTOMERS - LAST 30 DAYS
    # ============================================================
    #
    # Returns the COMPLETE ranking.
    #
    # Primary ranking:
    #   1. Number of orders
    #   2. Total amount spent
    #
    # Cancelled orders excluded.
    #

    top_customers_query = (
        db.query(
            User.id.label("customer_id"),
            User.full_name.label("full_name"),
            User.username.label("username"),
            User.email.label("email"),

            func.count(
                Order.id
            ).label("orders"),

            func.coalesce(
                func.sum(Order.total_amount),
                0,
            ).label("spent"),
        )
        .join(
            Order,
            Order.user_id == User.id,
        )
        .filter(
            User.role == "CUSTOMER",
            Order.created_at >= last_30_days,
            Order.order_status != OrderStatus.CANCELLED,
        )
        .group_by(
            User.id,
            User.full_name,
            User.username,
            User.email,
        )
        .order_by(
            desc("orders"),
            desc("spent"),
        )
        .all()
    )

    top_customers = []

    for item in top_customers_query:
        customer_name = (
            item.full_name
            or item.username
            or item.email
            or "Unknown Customer"
        )

        top_customers.append(
            {
                "customer_id": item.customer_id,
                "customer_name": customer_name,
                "email": item.email,
                "orders": int(item.orders or 0),
                "spent": float(item.spent or 0),
            }
        )

    # ============================================================
    # REVENUE / ORDERS CHART - LAST 30 DAYS
    # ============================================================
    #
    # Cancelled orders excluded.
    #

    chart_start = last_30_days

    revenue_by_day_query = (
        db.query(
            func.date(
                Order.created_at
            ).label("date"),

            func.coalesce(
                func.sum(
                    OrderItem.quantity * OrderItem.price
                ),
                0,
            ).label("revenue"),

            func.count(
                func.distinct(Order.id)
            ).label("orders"),
        )
        .join(
            OrderItem,
            Order.id == OrderItem.order_id,
        )
        .filter(
            Order.created_at >= chart_start,
            Order.order_status != OrderStatus.CANCELLED,
        )
        .group_by(
            func.date(Order.created_at),
        )
        .order_by(
            func.date(Order.created_at),
        )
        .all()
    )

    # Convert query results into a dictionary
    # so missing days can be filled with zeros.

    revenue_by_date = {
        str(item.date): {
            "revenue": float(item.revenue or 0),
            "orders": int(item.orders or 0),
        }
        for item in revenue_by_day_query
    }

    revenue_chart = []

    for i in range(30):
        day = (
            chart_start
            + timedelta(days=i)
        ).date()

        date_key = str(day)

        day_data = revenue_by_date.get(
            date_key,
            {
                "revenue": 0,
                "orders": 0,
            },
        )

        revenue_chart.append(
            {
                "date": date_key,
                "revenue": day_data["revenue"],
                "orders": day_data["orders"],
            }
        )

    # ============================================================
    # RESPONSE
    # ============================================================

    return {
        "stats": {
            # All-time
            "total_revenue": float(total_revenue),
            "total_orders": int(total_orders),
            "cancelled_orders": int(cancelled_orders),
            "total_customers": int(total_customers),
            "total_products": int(total_products),

            # Last 30 days
            "last_30_days_revenue": float(
                last_30_days_revenue
            ),
            "last_30_days_orders": int(
                last_30_days_orders
            ),
            "new_customers": int(
                new_customers
            ),

            # Additional useful KPIs
            "average_order_value": round(
                float(average_order_value),
                2,
            ),
            "cancellation_rate": round(
                float(cancellation_rate),
                2,
            ),
        },

        # Complete rankings.
        # Frontend decides to display only the first 5.
        "top_categories": top_categories,
        "top_brands": top_brands,
        "top_products": top_products,
        "top_customers": top_customers,

        # 30-day chart
        "revenue_chart": revenue_chart,
    }
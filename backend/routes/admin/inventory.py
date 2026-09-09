from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from services.auth import require_admin
from core.database import get_db
from core.security import decode_access_token

from models.inventory import (
    Inventory,
    StockChange,
    StockChangeType,
    Supplier,
)

from models.product import (
    Product,
    ProductVariant,
)

from models.user import (
    User,
    UserRole,
)

from schemas.inventory import (
    InventoryCreateRequest,
    InventoryUpdateRequest,
    InventoryVariantResponse,
)


router = APIRouter(
    prefix="/admin/inventory",
    tags=["Admin Inventory"],
)




# ============================================================
# GET INVENTORY
# ============================================================

@router.get(
    "",
    response_model=list[InventoryVariantResponse],
)
def get_inventory(
    db: Annotated[
        Session,
        Depends(get_db),
    ],

    category_id: int | None = None,
    brand_id: int | None = None,
    min_rating: float | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    search: str | None = None,
    is_active: bool | None = None,

    user_infos: Annotated[
        dict,
        Depends(decode_access_token),
    ] = None,
):
    require_admin(
        db,
        user_infos,
    )

    query = (
        db.query(ProductVariant)
        .join(
            Product,
            ProductVariant.product_id == Product.id,
        )
        .options(
            joinedload(ProductVariant.product),
            joinedload(ProductVariant.inventory),
            joinedload(ProductVariant.media),
        )
    )

    # --------------------------------------------------------
    # SEARCH
    # --------------------------------------------------------

    if search and search.strip():
        search_pattern = f"%{search.strip()}%"

        query = query.filter(
            or_(
                ProductVariant.sku.ilike(
                    search_pattern
                ),
                Product.name.ilike(
                    search_pattern
                ),
            )
        )

    # --------------------------------------------------------
    # CATEGORY
    # --------------------------------------------------------

    if category_id is not None:
        query = query.filter(
            Product.category_id == category_id
        )

    # --------------------------------------------------------
    # BRAND
    # --------------------------------------------------------

    if brand_id is not None:
        query = query.filter(
            Product.brand_id == brand_id
        )

    # --------------------------------------------------------
    # PRICE
    # --------------------------------------------------------

    if min_price is not None:
        query = query.filter(
            ProductVariant.price >= min_price
        )

    if max_price is not None:
        query = query.filter(
            ProductVariant.price <= max_price
        )

    # --------------------------------------------------------
    # RATING
    # --------------------------------------------------------

    if min_rating is not None:
        query = query.filter(
            Product.average_rating >= min_rating
        )

    # --------------------------------------------------------
    # ACTIVE STATUS
    # --------------------------------------------------------

    if is_active is not None:
        query = query.filter(
            ProductVariant.is_active == is_active
        )

        query = query.filter(
            Product.is_active == is_active
        )

    return query.all()


# ============================================================
# GET SINGLE INVENTORY ITEM
# ============================================================

@router.get(
    "/{variant_id}",
    response_model=InventoryVariantResponse,
)
def get_inventory_item(
    variant_id: int,

    db: Annotated[
        Session,
        Depends(get_db),
    ],

    user_infos: Annotated[
        dict,
        Depends(decode_access_token),
    ],
):
    require_admin(
        db,
        user_infos,
    )

    variant = (
        db.query(ProductVariant)
        .options(
            joinedload(ProductVariant.product),
            joinedload(ProductVariant.inventory),
            joinedload(ProductVariant.media),
        )
        .filter(
            ProductVariant.id == variant_id
        )
        .first()
    )

    if not variant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory item not found",
        )

    return variant


# ============================================================
# CREATE / ADD STOCK
# ============================================================

@router.post(
    "/{variant_id}",
    response_model=InventoryVariantResponse,
)
def add_stock(
    variant_id: int,

    inventory_data: InventoryCreateRequest,

    db: Annotated[
        Session,
        Depends(get_db),
    ],

    user_infos: Annotated[
        dict,
        Depends(decode_access_token),
    ],
):
    require_admin(
        db,
        user_infos,
    )

    # --------------------------------------------------------
    # Find variant
    # --------------------------------------------------------

    variant = (
        db.query(ProductVariant)
        .filter(
            ProductVariant.id == variant_id
        )
        .first()
    )

    if not variant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Variant not found",
        )

    # --------------------------------------------------------
    # Find supplier
    # --------------------------------------------------------

    supplier = (
        db.query(Supplier)
        .filter(
            Supplier.id == inventory_data.supplier_id,
            Supplier.is_active == True,
        )
        .first()
    )

    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found or inactive",
        )

    # --------------------------------------------------------
    # Find inventory
    # --------------------------------------------------------

    inventory = (
        db.query(Inventory)
        .filter(
            Inventory.product_variant_id == variant_id
        )
        .first()
    )

    if inventory:
        # Add incoming quantity
        inventory.quantity += inventory_data.quantity

    else:
        # Create inventory record
        inventory = Inventory(
            product_variant_id=variant_id,
            quantity=inventory_data.quantity,
        )

        db.add(inventory)

    # --------------------------------------------------------
    # Create stock change history
    # --------------------------------------------------------

    stock_change = StockChange(
        product_variant_id=variant_id,
        change_type=StockChangeType.IN,
        quantity=inventory_data.quantity,
        supplier_id=supplier.id,
    )

    db.add(stock_change)

    # --------------------------------------------------------
    # Commit
    # --------------------------------------------------------

    db.commit()

    # --------------------------------------------------------
    # Reload variant
    # --------------------------------------------------------

    variant = (
        db.query(ProductVariant)
        .options(
            joinedload(ProductVariant.product),
            joinedload(ProductVariant.inventory),
            joinedload(ProductVariant.media),
        )
        .filter(
            ProductVariant.id == variant_id
        )
        .first()
    )

    return variant


# ============================================================
# UPDATE STOCK
# ============================================================

@router.patch(
    "/{variant_id}",
    response_model=InventoryVariantResponse,
)
def update_stock(
    variant_id: int,

    inventory_data: InventoryUpdateRequest,

    db: Annotated[
        Session,
        Depends(get_db),
    ],

    user_infos: Annotated[
        dict,
        Depends(decode_access_token),
    ],
):
    require_admin(
        db,
        user_infos,
    )

    # --------------------------------------------------------
    # Find variant
    # --------------------------------------------------------

    variant = (
        db.query(ProductVariant)
        .filter(
            ProductVariant.id == variant_id
        )
        .first()
    )

    if not variant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Variant not found",
        )

    # --------------------------------------------------------
    # Find inventory
    # --------------------------------------------------------

    inventory = (
        db.query(Inventory)
        .filter(
            Inventory.product_variant_id == variant_id
        )
        .first()
    )

    # --------------------------------------------------------
    # No existing inventory
    # --------------------------------------------------------

    if not inventory:

        if inventory_data.quantity == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot create inventory with zero quantity",
            )

        if inventory_data.supplier_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Supplier is required when adding stock",
            )

        supplier = (
            db.query(Supplier)
            .filter(
                Supplier.id == inventory_data.supplier_id,
                Supplier.is_active == True,
            )
            .first()
        )

        if not supplier:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Supplier not found or inactive",
            )

        # Create inventory
        inventory = Inventory(
            product_variant_id=variant_id,
            quantity=inventory_data.quantity,
        )

        db.add(inventory)

        # Record incoming stock
        stock_change = StockChange(
            product_variant_id=variant_id,
            change_type=StockChangeType.IN,
            quantity=inventory_data.quantity,
            supplier_id=supplier.id,
        )

        db.add(stock_change)

    # --------------------------------------------------------
    # Existing inventory
    # --------------------------------------------------------

    else:

        old_quantity = inventory.quantity
        new_quantity = inventory_data.quantity

        difference = new_quantity - old_quantity

        # ----------------------------------------------------
        # Quantity increased
        # ----------------------------------------------------

        if difference > 0:

            if inventory_data.supplier_id is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Supplier is required when increasing stock",
                )

            supplier = (
                db.query(Supplier)
                .filter(
                    Supplier.id == inventory_data.supplier_id,
                    Supplier.is_active == True,
                )
                .first()
            )

            if not supplier:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Supplier not found or inactive",
                )

            stock_change = StockChange(
                product_variant_id=variant_id,
                change_type=StockChangeType.IN,
                quantity=difference,
                supplier_id=supplier.id,
            )

            db.add(stock_change)

        # ----------------------------------------------------
        # Quantity decreased
        # ----------------------------------------------------

        elif difference < 0:

            stock_change = StockChange(
                product_variant_id=variant_id,
                change_type=StockChangeType.OUT,
                quantity=abs(difference),
                supplier_id=None,
            )

            db.add(stock_change)

        # ----------------------------------------------------
        # Update current quantity
        # ----------------------------------------------------

        inventory.quantity = new_quantity

    # --------------------------------------------------------
    # Commit
    # --------------------------------------------------------

    db.commit()

    # --------------------------------------------------------
    # Reload variant with relationships
    # --------------------------------------------------------

    variant = (
        db.query(ProductVariant)
        .options(
            joinedload(ProductVariant.product),
            joinedload(ProductVariant.inventory),
            joinedload(ProductVariant.media),
        )
        .filter(
            ProductVariant.id == variant_id
        )
        .first()
    )

    return variant
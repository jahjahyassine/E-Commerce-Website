from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from core.database import get_db
from core.security import decode_access_token

from models.inventory import Inventory
from models.product import Product, ProductVariant
from models.user import User, UserRole

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
# ADMIN CHECK
# ============================================================

def require_admin(
    db: Session,
    user_infos: dict,
):
    user_id = user_infos.get("id")

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.role != UserRole.CUSTOMER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Unauthorized action {user.role}",
        )

    return user




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
    require_admin(db, user_infos)

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


    if category_id is not None:
        query = query.filter(
            Product.category_id == category_id
        )


    if brand_id is not None:
        query = query.filter(
            Product.brand_id == brand_id
        )



    if min_price is not None:
        query = query.filter(
            ProductVariant.price >= min_price
        )

    if max_price is not None:
        query = query.filter(
            ProductVariant.price <= max_price
        )



    if min_rating is not None:
        query = query.filter(
            Product.average_rating >= min_rating
        )



    if is_active is not None:
        query = query.filter(
            ProductVariant.is_active == is_active
        )

        query = query.filter(
            Product.is_active == is_active
        )

    return query.all()



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
    require_admin(db, user_infos)

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
    require_admin(db, user_infos)

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

    inventory = (
        db.query(Inventory)
        .filter(
            Inventory.product_variant_id
            == variant_id
        )
        .first()
    )

    if inventory:
        # Replace current quantity
        inventory.quantity = (
            inventory_data.quantity
        )
    else:
        inventory = Inventory(
            product_variant_id=variant_id,
            quantity=inventory_data.quantity,
        )

        db.add(inventory)

    db.commit()

    # Reload everything needed by response
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
    require_admin(db, user_infos)

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

    inventory = (
        db.query(Inventory)
        .filter(
            Inventory.product_variant_id
            == variant_id
        )
        .first()
    )

    if not inventory:
        inventory = Inventory(
            product_variant_id=variant_id,
            quantity=inventory_data.quantity,
        )

        db.add(inventory)
    else:
        inventory.quantity = (
            inventory_data.quantity
        )

    db.commit()

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
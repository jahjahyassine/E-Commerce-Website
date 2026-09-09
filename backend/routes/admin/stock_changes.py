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
    StockChange,
    StockChangeType,
)

from models.product import (
    Product,
    ProductVariant,
)

from models.inventory import Supplier

from models.user import (
    User,
    UserRole,
)

from schemas.inventory import StockChangeResponse


router = APIRouter(
    prefix="/admin/stock-changes",
    tags=["Admin Stock Changes"],
)




@router.get(
    "",
    response_model=list[StockChangeResponse],
)
def get_stock_changes(
    db: Annotated[
        Session,
        Depends(get_db),
    ],

    search: str | None = None,

    type_change: StockChangeType | None = None,

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
        db.query(StockChange)
        .options(
            joinedload(
                StockChange.product_variant
            )
            .joinedload(
                ProductVariant.product
            ),

            joinedload(
                StockChange.product_variant
            )
            .joinedload(
                ProductVariant.inventory
            ),

            joinedload(
                StockChange.product_variant
            )
            .joinedload(
                ProductVariant.media
            ),

            joinedload(
                StockChange.supplier
            ),

            joinedload(
                StockChange.order
            ),
        )
    )

    if search and search.strip():

        search_pattern = (
            f"%{search.strip()}%"
        )

        query = query.filter(
            or_(
                StockChange.product_variant.has(
                    ProductVariant.sku.ilike(
                        search_pattern
                    )
                ),

                StockChange.product_variant.has(
                    ProductVariant.product.has(
                        Product.name.ilike(
                            search_pattern
                        )
                    )
                ),

                StockChange.supplier.has(
                    Supplier.name.ilike(
                        search_pattern
                    )
                ),
            )
        )


    if type_change:
        query = query.filter(
            StockChange.change_type
            == type_change
        )


    query = query.order_by(
        StockChange.changed_at.desc()
    )

    return query.all()

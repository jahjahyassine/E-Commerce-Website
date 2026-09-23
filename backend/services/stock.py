from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from models.inventory import Inventory, StockChange, StockChangeType, Supplier


def get_active_supplier_or_404(db: Session, supplier_id: int) -> Supplier:
    supplier = (
        db.query(Supplier)
        .filter(
            Supplier.id == supplier_id,
            Supplier.is_active == True,
        )
        .first()
    )

    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found or inactive",
        )

    return supplier


def receive_stock(
    db: Session,
    *,
    product_variant_id: int,
    quantity: int,
    supplier_id: int,
) -> Inventory:
    """
    Validates the supplier, upserts Inventory, and logs an IN StockChange.
    Does NOT commit — caller owns the transaction.
    quantity must be > 0 (StockChange has a CheckConstraint on this).
    """
    supplier = get_active_supplier_or_404(db, supplier_id)

    inventory = (
        db.query(Inventory)
        .filter(Inventory.product_variant_id == product_variant_id)
        .first()
    )

    if inventory:
        inventory.quantity += quantity
    else:
        inventory = Inventory(
            product_variant_id=product_variant_id,
            quantity=quantity,
        )
        db.add(inventory)

    stock_change = StockChange(
        product_variant_id=product_variant_id,
        change_type=StockChangeType.IN,
        quantity=quantity,
        supplier_id=supplier.id,
    )
    db.add(stock_change)

    return inventory
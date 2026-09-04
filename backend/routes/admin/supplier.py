from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.database import get_db
from models.inventory import Supplier
from schemas.supplier import (
    SupplierCreate,
    SupplierUpdate,
    SupplierResponse,
)


router = APIRouter(
    prefix="/admin",
    tags=["admin"],
)



@router.get(
    "/suppliers",
    response_model=list[SupplierResponse],
)
def get_suppliers(
    db: Session = Depends(get_db),
):
    suppliers = (
        db.query(Supplier)
        .order_by(Supplier.created_at.desc())
        .all()
    )

    return suppliers



@router.get(
    "/suppliers/{supplier_id}",
    response_model=SupplierResponse,
)
def get_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
):
    supplier = (
        db.query(Supplier)
        .filter(Supplier.id == supplier_id)
        .first()
    )

    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found",
        )

    return supplier




@router.post(
    "/suppliers",
    response_model=SupplierResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_supplier(
    supplier_data: SupplierCreate,
    db: Session = Depends(get_db),
):
    existing_supplier = (
        db.query(Supplier)
        .filter(Supplier.name == supplier_data.name)
        .first()
    )

    if existing_supplier:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A supplier with this name already exists",
        )

    supplier = Supplier(
        name=supplier_data.name,
        email=supplier_data.email,
        phone=supplier_data.phone,
        address=supplier_data.address,
        is_active=supplier_data.is_active,
    )

    db.add(supplier)
    db.commit()
    db.refresh(supplier)

    return supplier


@router.patch(
    "/suppliers/{supplier_id}",
    response_model=SupplierResponse,
)
def update_supplier(
    supplier_id: int,
    supplier_data: SupplierUpdate,
    db: Session = Depends(get_db),
):
    supplier = (
        db.query(Supplier)
        .filter(Supplier.id == supplier_id)
        .first()
    )

    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found",
        )

    update_data = supplier_data.model_dump(
        exclude_unset=True
    )

    if "name" in update_data:
        existing_supplier = (
            db.query(Supplier)
            .filter(
                Supplier.name == update_data["name"],
                Supplier.id != supplier_id,
            )
            .first()
        )

        if existing_supplier:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A supplier with this name already exists",
            )

    for field, value in update_data.items():
        setattr(supplier, field, value)

    db.commit()
    db.refresh(supplier)

    return supplier



@router.patch(
    "/suppliers/{supplier_id}/deactivate",
    response_model=SupplierResponse,
)
def deactivate_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
):
    supplier = (
        db.query(Supplier)
        .filter(Supplier.id == supplier_id)
        .first()
    )

    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found",
        )

    supplier.is_active = False

    db.commit()
    db.refresh(supplier)

    return supplier




@router.patch(
    "/suppliers/{supplier_id}/activate",
    response_model=SupplierResponse,
)
def activate_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
):
    supplier = (
        db.query(Supplier)
        .filter(Supplier.id == supplier_id)
        .first()
    )

    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found",
        )

    supplier.is_active = True

    db.commit()
    db.refresh(supplier)

    return supplier
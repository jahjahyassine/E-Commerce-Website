from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

# from schemas.product import InventoryCreateRequest, ProductVariantResponse
from models.inventory import Inventory
from models.product import ProductVariant
from core.database import get_db


router = APIRouter()



# @router.post("/admin/products/{id}/variants/{variant_id}/inventory", response_model=ProductVariantResponse)
# def add_product_variant_inventory(db: Annotated[Session, Depends(get_db)], id: int, variant_id: int, data: InventoryCreateRequest):
#     product_variant = db.query(ProductVariant).filter(ProductVariant.id == variant_id, ProductVariant.product_id == id).first()

#     inventory = db.query(Inventory).filter(Inventory.product_variant_id == variant_id).first()

#     if inventory:
#         inventory.quantity += data.quantity
#     else:
#         new_inventory = Inventory (
#             product_variant_id=variant_id,
#             quantity=data.quantity
#         )
#         db.add(new_inventory)

#     db.commit()

#     db.refresh(product_variant)

#     return product_variant
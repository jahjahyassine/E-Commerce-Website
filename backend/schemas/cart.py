from pydantic import BaseModel




class ItemAddRequest (BaseModel):
    variant_id: int
    quantity: int
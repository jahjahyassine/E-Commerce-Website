# rag/schemas.py
from typing import Optional
from pydantic import BaseModel, Field


class SearchFilters(BaseModel):
    category: Optional[list[str]] = None
    brand: Optional[list[str]] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_rating: Optional[float] = None
    min_discount_percentage: Optional[float] = None
    specifications: dict[str, list[str]] = Field(default_factory=dict)
    variant_attributes: dict[str, list[str]] = Field(default_factory=dict)
    in_stock: bool = True


class ProductSearchQuery(BaseModel):
    semantic_query: str
    filters: SearchFilters
    limit: int = 5
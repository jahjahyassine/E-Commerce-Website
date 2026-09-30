# rag/schemas.py
from typing import Any, Optional

from pydantic import BaseModel, Field, field_validator


class ChatRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=2000)


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

    @field_validator("category", "brand", mode="before")
    @classmethod
    def _as_list(cls, value: Any) -> Any:
        # LLMs sometimes return "Lenovo" instead of ["Lenovo"].
        if isinstance(value, str):
            return [value]
        return value

    @field_validator("specifications", "variant_attributes", mode="before")
    @classmethod
    def _values_as_string_lists(cls, value: Any) -> Any:
        if not isinstance(value, dict):
            return value
        cleaned = {}
        for key, items in value.items():
            if not isinstance(items, list):
                items = [items]
            cleaned[str(key)] = [str(item) for item in items]
        return cleaned


class ProductSearchQuery(BaseModel):
    semantic_query: str
    filters: SearchFilters
    limit: int = 5
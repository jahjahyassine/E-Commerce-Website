from collections.abc import Sequence
from typing import Any

from schemas.product import ProductResponse


def serialize_products(products: Sequence) -> list[dict[str, Any]]:
    """ORM products -> plain JSON-safe dicts (safe for JSONB and the HTTP response)."""
    return [
        ProductResponse.model_validate(product, from_attributes=True).model_dump(
            mode="json"
        )
        for product in products
    ]
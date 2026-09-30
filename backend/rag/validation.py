import logging
from collections.abc import Iterable, Sequence

from rag.schemas import ProductSearchQuery

logger = logging.getLogger(__name__)

MAX_LIMIT = 10


def canonicalize(
    values: Iterable[str] | None,
    canonical: Sequence[str],
) -> list[str] | None:
    """Map LLM-provided names to canonical DB names (case-insensitive).

    Unknown values are dropped. Returns None when nothing valid remains.
    """
    if not values:
        return None

    lookup = {name.casefold(): name for name in canonical}
    result: list[str] = []

    for value in values:
        if not isinstance(value, str):
            continue
        name = lookup.get(value.strip().casefold())
        if name is None:
            logger.info("Dropped non-canonical LLM value: %r", value)
            continue
        if name not in result:
            result.append(name)

    return result or None


def validate_search_query(
    query: ProductSearchQuery,
    *,
    categories: Sequence[str],
    brands: Sequence[str],
    fallback_semantic_query: str,
) -> ProductSearchQuery:
    filters = query.filters.model_copy(
        update={
            "category": canonicalize(query.filters.category, categories),
            "brand": canonicalize(query.filters.brand, brands),
        }
    )

    return query.model_copy(
        update={
            "filters": filters,
            "semantic_query": query.semantic_query.strip()
            or fallback_semantic_query,
            "limit": min(max(query.limit, 1), MAX_LIMIT),
        }
    )
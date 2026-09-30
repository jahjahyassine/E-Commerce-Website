from threading import Lock

from sqlalchemy import select
from sqlalchemy.orm import Session

from models.product import Category

_lock = Lock()
_categories: tuple[str, ...] | None = None
_version = 0


def get_cached_categories(db: Session) -> tuple[str, ...]:
    """Canonical active category names. Queries PostgreSQL only on a cache miss."""
    global _categories

    cached = _categories
    if cached is not None:
        return cached

    with _lock:
        if _categories is not None:
            return _categories
        version_at_start = _version

    names = tuple(
        db.scalars(
            select(Category.name)
            .where(Category.is_active.is_(True))
            .order_by(Category.name)
        ).all()
    )

    with _lock:
        # Store only if no invalidation happened while we were querying,
        # otherwise we could re-cache data read before an admin commit.
        if _version == version_at_start:
            _categories = names

    return names


def invalidate_categories() -> None:
    global _categories, _version

    with _lock:
        _categories = None
        _version += 1
from threading import Lock

from sqlalchemy import select
from sqlalchemy.orm import Session

from models.product import Brand

_lock = Lock()
_brands: tuple[str, ...] | None = None
_version = 0


def get_cached_brands(db: Session) -> tuple[str, ...]:
    """Canonical active brand names. Queries PostgreSQL only on a cache miss."""
    global _brands

    cached = _brands
    if cached is not None:
        return cached

    with _lock:
        if _brands is not None:
            return _brands
        version_at_start = _version

    names = tuple(
        db.scalars(
            select(Brand.name)
            .where(Brand.is_active.is_(True))
            .order_by(Brand.name)
        ).all()
    )

    with _lock:
        if _version == version_at_start:
            _brands = names

    return names


def invalidate_brands() -> None:
    global _brands, _version

    with _lock:
        _brands = None
        _version += 1
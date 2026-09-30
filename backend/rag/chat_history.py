import json
from collections.abc import Sequence
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from core.config import settings
from models.chatbot import ChatMessage, ChatMessageRole

NO_HISTORY_TEXT = "(no previous messages)"
MAX_MESSAGE_CHARS = 600   # per-message cap to keep token usage bounded
MAX_LISTED_PRODUCTS = 5   # product names listed per assistant message


# ----------------------------------------------------------------------
# Persistence (unchanged)
# ----------------------------------------------------------------------
def save_user_message(db: Session, user_id: int, content: str) -> ChatMessage:
    message = ChatMessage(
        user_id=user_id,
        role=ChatMessageRole.USER,
        content=content,
        products=None,
        search_query=None,
    )
    db.add(message)
    db.flush()  # not committed: the router commits user + assistant together
    return message


def save_assistant_message(
    db: Session,
    user_id: int,
    content: str,
    products: list[dict[str, Any]],
    search_query: dict[str, Any],
) -> ChatMessage:
    message = ChatMessage(
        user_id=user_id,
        role=ChatMessageRole.ASSISTANT,
        content=content,
        products=products,
        search_query=search_query,
    )
    db.add(message)
    db.flush()
    return message


# ----------------------------------------------------------------------
# Retrieval
# ----------------------------------------------------------------------
def get_chat_history(
    db: Session,
    user_id: int,
    limit: int | None = None,
) -> list[ChatMessage]:
    """The user's most recent `limit` messages, oldest -> newest.

    Always filtered by user_id. `id` is a tie-breaker because a USER and
    ASSISTANT pair committed in one transaction share the same created_at.
    """
    if limit is None:
        limit = settings.CHAT_HISTORY_LIMIT
    if limit <= 0:
        return []

    newest_first = db.scalars(
        select(ChatMessage)
        .where(ChatMessage.user_id == user_id)
        .order_by(ChatMessage.created_at.desc(), ChatMessage.id.desc())
        .limit(limit)
    ).all()

    return list(reversed(newest_first))


# ----------------------------------------------------------------------
# Formatting (ORM objects never reach the LLM)
# ----------------------------------------------------------------------
def _truncate(text: str) -> str:
    text = " ".join(text.split())
    if len(text) <= MAX_MESSAGE_CHARS:
        return text
    return text[: MAX_MESSAGE_CHARS - 1].rstrip() + "…"


def _product_names(products: Any) -> list[str]:
    """Names only, in the order they were shown to the user."""
    if not isinstance(products, list):
        return []
    names: list[str] = []
    for product in products[:MAX_LISTED_PRODUCTS]:
        if isinstance(product, dict) and isinstance(product.get("name"), str):
            names.append(product["name"])
    return names


def _search_summary(search_query: Any) -> str:
    """Compact one-line view of the filters a previous search used."""
    if not isinstance(search_query, dict):
        return ""

    parts: list[str] = []

    semantic = search_query.get("semantic_query")
    if semantic:
        parts.append(f'query="{semantic}"')

    filters = search_query.get("filters") or {}
    for key, value in filters.items():
        if key == "in_stock" or value in (None, [], {}):
            continue
        parts.append(f"{key}={json.dumps(value, ensure_ascii=False)}")

    return "; ".join(parts)


def format_chat_history(
    messages: Sequence[ChatMessage],
    *,
    include_search_context: bool = False,
) -> str:
    """Plain text for the prompt:

        USER: Show me gaming laptops under 9000 DH
        ASSISTANT: I found several gaming laptops...
        Products shown: 1. Lenovo Legion 5; 2. ASUS TUF A15
        USER: Which one has the best battery?

    `include_search_context` adds the compact filters of each previous search
    (used by the query parser so it can carry over or replace constraints).
    """
    if not messages:
        return NO_HISTORY_TEXT

    lines: list[str] = []

    for message in messages:
        role = getattr(message.role, "value", message.role)
        label = str(role).upper()
        lines.append(f"{label}: {_truncate(message.content)}")

        if label != "ASSISTANT":
            continue

        names = _product_names(message.products)
        if names:
            listed = "; ".join(f"{i}. {name}" for i, name in enumerate(names, 1))
            lines.append(f"Products shown: {listed}")

        if include_search_context:
            summary = _search_summary(message.search_query)
            if summary:
                lines.append(f"Search used: {summary}")

    return "\n".join(lines)
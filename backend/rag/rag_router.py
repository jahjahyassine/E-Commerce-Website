import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from core.config import settings
from core.database import get_db
from core.security import decode_access_token  # same import path as your admin router
from rag.cache.category_cache import get_cached_categories
from rag.cache.brand_cache import get_cached_brands
from rag.chat_history import (
    format_chat_history,
    get_chat_history,
    save_assistant_message,
    save_user_message,
)
from rag.llm import LLMError
from rag.query_parser import parse_user_query
from rag.responder import select_products
from rag.schemas import ChatRequest
from rag.search import search_products
from rag.serialization import serialize_products
from rag.validation import validate_search_query

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/rag")

NO_RESULTS_MESSAGE = "I couldn't find any products that match your request."


@router.post("")
def chat_with_ai(
    payload: ChatRequest,
    db: Annotated[Session, Depends(get_db)],
    user_infos: Annotated[dict, Depends(decode_access_token)],
):
    user_prompt = payload.prompt.strip()
    if not user_prompt:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY, "Prompt must not be empty"
        )

    # The token is the only source of truth for the user.
    user_id = user_infos["id"]

    try:
        # 1. Previous messages FIRST (Option A): the current message can never
        #    appear in its own history. Always scoped to this user_id.
        history = get_chat_history(
            db, user_id, limit=settings.CHAT_HISTORY_LIMIT
        )
        parser_history = format_chat_history(history, include_search_context=True)
        responder_history = format_chat_history(history)

        # 2. Save the current USER message (flushed; committed with the reply).
        save_user_message(db, user_id, user_prompt)

        categories = get_cached_categories(db)
        brands = get_cached_brands(db)

        # 3. LLM #1: history + current request -> ProductSearchQuery
        parsed = parse_user_query(user_prompt, categories, brands, parser_history)
        search_query = validate_search_query(
            parsed,
            categories=categories,
            brands=brands,
            fallback_semantic_query=user_prompt,
        )

        # 4. Existing hybrid search (unchanged)
        results = search_products(search_query, db)

        # 5. LLM #2: history + current request + candidates -> answer
        if results:
            message, selected = select_products(
                user_prompt, results, responder_history
            )
        else:
            message, selected = NO_RESULTS_MESSAGE, []

        # Serialize BEFORE commit (ORM attributes expire on commit).
        products = serialize_products(selected)

        # 6. Save ASSISTANT message, commit both together.
        save_assistant_message(
            db,
            user_id,
            message,
            products,
            search_query.model_dump(mode="json"),
        )
        db.commit()

    except LLMError:
        db.rollback()
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY,
            "The assistant could not process your request. Please try again.",
        )
    except Exception:
        db.rollback()
        logger.exception("RAG request failed")
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "There was an error processing your request.",
        )

    return {"message": message, "products": products}
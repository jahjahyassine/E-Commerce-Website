from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Any

from core.database import Base

if TYPE_CHECKING:
    from models.user import User

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import func
from sqlalchemy import Enum as SQLEnum
from enum import Enum


class ChatMessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    role: Mapped[ChatMessageRole] = mapped_column(
        SQLEnum(ChatMessageRole),
        nullable=False
    )

    content: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    products: Mapped[list[dict[str, Any]] | None] = mapped_column(
        JSONB,
        nullable=True
    )
    
    search_query: Mapped[dict[str, Any] | None] = mapped_column(
        JSONB,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        index=True
    )

    user: Mapped["User"] = relationship(
        "User",
        back_populates="chat_messages"
    )
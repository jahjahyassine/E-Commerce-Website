import json
import logging

from groq import Groq

from core.config import settings

logger = logging.getLogger(__name__)

MODEL = "openai/gpt-oss-20b"

client = Groq(api_key=settings.GROQ_API_KEY)


class LLMError(Exception):
    """The LLM call failed or returned unusable output."""


def complete_json(system_prompt: str, user_prompt: str) -> dict:
    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0,
            # If Groq rejects this parameter for your model, remove this line.
            response_format={"type": "json_object"},
        )
    except Exception as exc:
        logger.exception("Groq request failed")
        raise LLMError("Groq request failed") from exc

    content = response.choices[0].message.content
    if not content:
        raise LLMError("Empty LLM response")

    try:
        data = json.loads(content)
    except json.JSONDecodeError as exc:
        logger.error("Invalid JSON from LLM: %s", content)
        raise LLMError("LLM returned invalid JSON") from exc

    if not isinstance(data, dict):
        raise LLMError("LLM JSON is not an object")

    return data
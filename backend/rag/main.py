import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from groq import Groq

from core.config import settings
from core.database import get_db
from rag.search import search_products
from rag.schemas import ProductSearchQuery


router = APIRouter(
    prefix="/rag"
)


client = Groq(
    api_key=settings.GROQ_API_KEY
)


@router.post("")
def chat_with_ai(
    prompt: dict,
    db: Session = Depends(get_db)
):
    # ============================================================
    # 1. Get the user's actual prompt
    # ============================================================

    user_prompt = prompt.get("prompt")

    if not user_prompt:
        return {
            "message": "Please provide a product search request.",
            "products": []
        }

    # ============================================================
    # 2. Parse the user's query with Groq
    # ============================================================

    query_prompt = f"""
You are a product search query parser for an e-commerce store.

Your task is to convert the user's natural-language product request
into a structured JSON search query.

User query:
{user_prompt}

Return ONLY valid JSON.
Do not use markdown.
Do not add explanations.

Use exactly this structure:

{{
    "semantic_query": "string",
    "filters": {{
        "category": null,
        "brand": null,
        "min_price": null,
        "max_price": null,
        "min_rating": null,
        "min_discount_percentage": null,
        "specifications": {{}},
        "variant_attributes": {{}},
        "in_stock": true
    }},
    "limit": 5
}}

RULES:

1. semantic_query
   - Same as before: general product intent, no hard filters.

2. category / brand
   - "category" and "brand", when present, must be a LIST of plausible
     surface forms for that value, not a single string.
   - Include: the value as given, a lowercase/uppercase variant if
     relevant, singular AND plural form, and common spacing variants.
   - Example: user says "gaming laptops" -> category: ["laptop", "laptops"]
   - Example: user says "rtx gpu" -> brand: null (brand != GPU model,
     don't confuse them)
   - If not mentioned, use null (not an empty list).

3. Price / rating / discount
   - Unchanged — these stay single numbers, not lists.

4. specifications / variant_attributes
   - Each key maps to a LIST of plausible value variants instead of
     one string.
   - Include: the value as the user wrote it, the value with internal
     spaces removed, the value with spaces normalized, and — for
     recognizable product line prefixes (RTX, GTX, RX, Core i, Ryzen,
     etc.) — both WITH and WITHOUT the prefix.
   - Do not invent unrelated specs. Do not add values the user did not
     imply.

   Example:

   "RTX 3050 GPU" ->
   variant_attributes.gpu = ["RTX 3050", "RTX3050", "3050"]

   "16GB RAM" ->
   variant_attributes.ram = ["16GB", "16 GB"]

   "black headphones" ->
   variant_attributes.color = ["black"]

5. in_stock / limit
   - Unchanged.

Return ONLY the JSON object.
"""
    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a precise e-commerce product search "
                        "query parser. Return only valid JSON."
                    )
                },
                {
                    "role": "user",
                    "content": query_prompt
                }
            ],
            temperature=0,
        )

    except Exception as e:
        print("========== GROQ QUERY ERROR ==========")
        print(e)
        print("=======================================")

        return {
            "message": "There was an error processing your request.",
            "products": []
        }

    llm_response = response.choices[0].message.content

    if not llm_response:
        return {
            "message": "I couldn't understand your product request.",
            "products": []
        }

    # ============================================================
    # 3. Parse the first LLM response
    # ============================================================

    try:
        parsed_json = json.loads(llm_response)

    except json.JSONDecodeError:
        print("========== INVALID QUERY JSON ==========")
        print(llm_response)
        print("=========================================")

        return {
            "message": "I couldn't understand your product request.",
            "products": []
        }

    # ============================================================
    # 4. Validate with Pydantic
    # ============================================================

    try:
        product_search = ProductSearchQuery.model_validate(
            parsed_json
        )

    except Exception as e:
        print("========== INVALID SEARCH SCHEMA ==========")
        print(e)
        print("LLM response:")
        print(llm_response)
        print("============================================")

        return {
            "message": "I couldn't understand your product request.",
            "products": []
        }

    # Debug
    print("========== PARSED SEARCH ==========")
    print(product_search.model_dump_json(indent=2))
    print("===================================")

    # ============================================================
    # 5. Search PostgreSQL + pgvector
    # ============================================================

    try:
        results = search_products(
            product_search,
            db
        )

    except Exception as e:
        print("========== SEARCH ERROR ==========")
        print(e)
        print("==================================")

        return {
            "message": "There was an error searching for products.",
            "products": []
        }

    if not results:
        return {
            "message": "I couldn't find any products that match your request.",
            "products": []
        }

    # ============================================================
    # 6. Prepare retrieved products for the second LLM
    # ============================================================

    products = []

    for product in results:

        variants = []

        for variant in product.product_variants:

            if not variant.is_active:
                continue

            variants.append({
                "id": variant.id,
                "sku": variant.sku,
                "attributes": variant.attributes or {},
                "price": str(variant.price),
                "discount_percentage": str(
                    variant.discount_percentage
                )
            })

        products.append({
            "id": product.id,
            "name": product.name,
            "brand": product.brand.name,
            "category": product.category.name,
            "description": product.description or "",
            "specifications": product.specifications or {},
            "variants": variants,
            "rating": str(product.average_rating),
            "reviews": product.count_reviews
        })

    products_text = json.dumps(
        products,
        ensure_ascii=False,
        indent=2
    )

    # ============================================================
    # 7. Ask Groq to select the relevant products
    # ============================================================

    selection_prompt = f"""
You are the final product recommendation assistant
for an e-commerce store.

The user's original request is:

{user_prompt}

The following products were retrieved from the database:

{products_text}

Your task:

1. Select the products that genuinely match the user's request.

2. Return their exact database IDs.

3. Write a short, natural response to the user.

IMPORTANT RULES:

- You may ONLY select products from the candidates provided above.
- NEVER invent a product.
- NEVER invent a product ID.
- NEVER modify a product ID.
- The provided product information is authoritative.
- If one product matches, return only that product.
- If multiple products match, return all relevant products.
- If no product matches, return an empty product_ids list.
- Do not mention products that you did not select.
- Do not invent specifications.
- Do not invent prices.
- Do not invent ratings.
- Do not invent brands.
- Do not invent product information.
- Do not say that you are an AI.
- Do not mention databases, embeddings, vector search,
  semantic search, or internal processing.
- Keep the response short and natural.

Return ONLY valid JSON.

Use exactly this structure:

{{
    "message": "Short natural response to the user",
    "product_ids": [1, 2, 3]
}}

The IDs must be copied exactly from the candidate products.
"""

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a precise e-commerce recommendation "
                        "assistant. Return only valid JSON."
                    )
                },
                {
                    "role": "user",
                    "content": selection_prompt
                }
            ],
            temperature=0,
        )

    except Exception as e:
        print("========== GROQ SELECTION ERROR ==========")
        print(e)
        print("===========================================")

        return {
            "message": "I found some products that may match your request.",
            "products": results
        }

    llm_response = response.choices[0].message.content

    if not llm_response:
        return {
            "message": "I found some products that may match your request.",
            "products": results
        }

    # ============================================================
    # 8. Parse second LLM response
    # ============================================================

    try:
        selection = json.loads(llm_response)

    except json.JSONDecodeError:
        print("========== INVALID SELECTION JSON ==========")
        print(llm_response)
        print("=============================================")

        return {
            "message": "I found some products that may match your request.",
            "products": results
        }

    # ============================================================
    # 9. Get selected IDs
    # ============================================================

    message = selection.get(
        "message",
        "Here are some products that match your request:"
    )

    selected_ids = selection.get(
        "product_ids",
        []
    )

    # Make sure selected_ids is actually a list
    if not isinstance(selected_ids, list):
        selected_ids = []

    # ============================================================
    # 10. Map IDs to real database products
    # ============================================================

    products_by_id = {
        product.id: product
        for product in results
    }

    final_products = [
        products_by_id[product_id]
        for product_id in selected_ids
        if product_id in products_by_id
    ]

    # ============================================================
    # 11. Final response
    # ============================================================

    return {
        "message": message,
        "products": final_products
    }

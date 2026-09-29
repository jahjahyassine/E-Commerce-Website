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

CORE PRINCIPLE — read this before filling any field:

There are two completely different kinds of information in a user's
request:

(a) WHICH PRODUCT they are talking about — its name, model name,
    product line, or the product itself (e.g. "Galaxy S25", "iPhone
    15 Pro", "LOQ 15IRX9", "the Sony headphones", "a gaming laptop").
    This is IDENTITY. It goes ONLY in semantic_query. It NEVER goes
    into specifications or variant_attributes.

(b) HOW THAT PRODUCT SHOULD BE CONFIGURED — a specific spec or
    variant option the user wants (RAM size, GPU model, storage,
    color, screen size, connectivity, etc). This is CONFIGURATION.
    This is the ONLY thing that goes into specifications or
    variant_attributes.

Rule of thumb: if removing the phrase from the user's message would
change WHAT PRODUCT they're asking about, it's identity -> semantic_query.
If removing it would still leave the same product but a different
configuration of it, it's a spec/attribute filter.

Do NOT extract a filter just because a word looks like a key you
could invent (e.g. "model", "name", "version", "edition", "series").
If you are not confident a real product actually stores that exact
key in its data, leave it out of specifications/variant_attributes
entirely and trust semantic_query + category/brand to find it
instead. An empty specifications/variant_attributes object is
CORRECT and PREFERRED over a guessed key that might not exist in the
data — a wrong filter key silently excludes every product, while
semantic_query alone can still find the right one.

RULES:

1. semantic_query
   - Contains the full product identity and general intent: product
     name, model, product line, category, and any descriptive
     language. Keep it natural and complete — do not strip out the
     product name to "clean it up".
   - Example: "tell me about the Samsung Galaxy S25" ->
     semantic_query: "Samsung Galaxy S25"
   - Example: "gaming laptop with RTX 3050 and 16GB RAM under 9000 DH" ->
     semantic_query: "gaming laptop"

2. category / brand
   - "category" and "brand", when present, must be a LIST of plausible
     surface forms for that value, not a single string.
   - Include: the value as given, a lowercase/uppercase variant if
     relevant, singular AND plural form, and common spacing variants.
   - Example: user says "gaming laptops" -> category: ["laptop", "laptops"]
   - Example: user says "rtx gpu" -> brand: null (brand != GPU model,
     don't confuse them)
   - Only extract brand/category if the user's own words map to an
     actual manufacturer or product type. Never extract a brand from
     a model name (e.g. "Galaxy S25" implies brand Samsung ONLY if
     the user also said "Samsung" or you are certain of the mapping;
     when unsure, leave brand null and let semantic_query carry it).
   - If not mentioned, use null (not an empty list).

3. Price / rating / discount
   - Unchanged — these stay single numbers, not lists.

4. specifications / variant_attributes — CONFIGURATION ONLY
   - Only extract a key here if the user is asking for a specific
     hardware/variant configuration: RAM, storage, GPU, CPU, color,
     screen size, connectivity, battery, and similarly concrete specs.
   - NEVER extract: product name, model name, product line, "model"
     as a key, edition/version identifiers, or anything that
     identifies WHICH product rather than HOW it's configured.
   - Each key maps to a LIST of plausible value variants instead of
     one string. Include: the value as the user wrote it, the value
     with internal spaces removed, the value with spaces normalized,
     and — for recognizable product line prefixes (RTX, GTX, RX,
     Core i, Ryzen, etc.) — both WITH and WITHOUT the prefix.
   - Do not invent unrelated specs. Do not add values the user did not
     imply.

   Correct examples:

   "RTX 3050 GPU" ->
   variant_attributes.gpu = ["RTX 3050", "RTX3050", "3050"]

   "16GB RAM" ->
   variant_attributes.ram = ["16GB", "16 GB"]

   "black headphones" ->
   variant_attributes.color = ["black"]

   Incorrect — do NOT do this:

   "tell me about the Samsung Galaxy S25" ->
   variant_attributes.model = ["Galaxy S25"]   <- WRONG. "Galaxy S25"
   is product identity, not a configuration. It belongs only in
   semantic_query ("Samsung Galaxy S25"), with brand: ["Samsung"] if
   the user said the brand. specifications/variant_attributes should
   stay empty for this query.

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
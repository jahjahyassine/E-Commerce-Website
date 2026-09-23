import math
from typing import Annotated

from fastapi import Depends
from sqlalchemy import and_, or_, select
from sqlalchemy.orm import Session

from models.product import Brand, Category, Product, ProductVariant
from rag.schemas import ProductSearchQuery
from rag.embedding import model
from rag.tfidf import calculate_filter_scores
from core.database import get_db



def cosine_similarity(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))

    if norm_a == 0 or norm_b == 0:
        return 0.0

    return dot / (norm_a * norm_b)

def search_products(
    product_search: ProductSearchQuery,
    db: Annotated[Session, Depends(get_db)],
):
    # ---------------------------------------------------------
    # 1. Semantic embedding
    # ---------------------------------------------------------
    query_embedding = model.encode_query(
        product_search.semantic_query
    ).tolist()

    stmt = select(Product).where(Product.is_active == True)

    filters = product_search.filters

    # ---------------------------------------------------------
    # 2. HARD FILTERS
    # ---------------------------------------------------------

    # Category
    if filters.category:
        stmt = stmt.where(
            Product.category.has(
                or_(*[
                    Category.name.ilike(f"%{value}%")
                    for value in filters.category
                ])
            )
        )

    # Brand
    if filters.brand:
        stmt = stmt.where(
            Product.brand.has(
                or_(*[
                    Brand.name.ilike(f"%{value}%")
                    for value in filters.brand
                ])
            )
        )

    # Price
    if filters.max_price is not None:
        stmt = stmt.where(
            Product.product_variants.any(
                ProductVariant.price <= filters.max_price
            )
        )

    if filters.min_price is not None:
        stmt = stmt.where(
            Product.product_variants.any(
                ProductVariant.price >= filters.min_price
            )
        )

    # Rating
    if filters.min_rating is not None:
        stmt = stmt.where(
            Product.average_rating >= filters.min_rating
        )

    # Discount
    if filters.min_discount_percentage is not None:
        stmt = stmt.where(
            Product.product_variants.any(
                ProductVariant.discount_percentage
                >= filters.min_discount_percentage
            )
        )

    # ---------------------------------------------------------
    # 3. Specifications
    # ---------------------------------------------------------

    if filters.specifications:
        spec_conditions = []

        for key, values in filters.specifications.items():
            if not values:
                continue

            spec_conditions.append(
                or_(*[
                    Product.specifications[key]
                    .astext
                    .ilike(f"%{value}%")
                    for value in values
                ])
            )

        if spec_conditions:
            stmt = stmt.where(and_(*spec_conditions))

    # ---------------------------------------------------------
    # 4. Variant attributes
    # ---------------------------------------------------------

    if filters.variant_attributes:
        for key, values in filters.variant_attributes.items():
            if not values:
                continue

            key_variants = {
                key,
                key.lower(),
                key.upper(),
                key.capitalize(),
            }

            value_conditions = or_(*[
                ProductVariant.attributes[k]
                .astext
                .ilike(f"%{value}%")
                for k in key_variants
                for value in values
            ])

            stmt = stmt.where(
                Product.product_variants.any(
                    and_(
                        ProductVariant.is_active == True,
                        value_conditions,
                    )
                )
            )

    # ---------------------------------------------------------
    # 5. Stock
    # ---------------------------------------------------------

    if filters.in_stock:
        stmt = stmt.where(
            Product.product_variants.any(
                ProductVariant.is_active == True
            )
        )

    # ---------------------------------------------------------
    # 6. Get candidates
    # ---------------------------------------------------------

    products = db.scalars(stmt).all()

    if not products:
        return []

    # ---------------------------------------------------------
    # 7. TF-IDF score
    # ---------------------------------------------------------

    filter_scores = calculate_filter_scores(
        products=products,
        filters=filters,
    )

    # ---------------------------------------------------------
    # 8. Semantic cosine score
    # ---------------------------------------------------------

    semantic_scores = []

    for product in products:
        if not product.embedding:
            semantic_scores.append(0.0)
            continue

        similarity = cosine_similarity(
            product.embedding,
            query_embedding
        )

        semantic_scores.append(similarity)

    # ---------------------------------------------------------
    # 9. Combine scores
    # ---------------------------------------------------------

    ranked = []

    for product, distance in zip(products, semantic_scores):

        semantic_score = 1.0 - distance

        filter_score = filter_scores.get(
            product.id,
            0.0
        )

        final_score = (
            0.6 * semantic_score
            + 0.4 * filter_score
        )

        ranked.append(
            (product, final_score)
        )

    # ---------------------------------------------------------
    # 10. Final ranking
    # ---------------------------------------------------------

    ranked.sort(
        key=lambda x: x[1],
        reverse=True,
    )

    return [
        product
        for product, score in ranked[:product_search.limit]
    ]
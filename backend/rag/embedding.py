from langchain_core.documents import Document
from sentence_transformers import SentenceTransformer


model = SentenceTransformer(
    "BAAI/bge-m3",
    device="cpu"
)


def product_to_document(product) -> Document:
    variants = []

    for variant in product.product_variants:
        if not variant.is_active:
            continue

        variant_text = f"""
SKU: {variant.sku}
Price: {variant.price} DH
"""

        if variant.discount_percentage is not None:
            variant_text += (
                f"Discount: {variant.discount_percentage}%\n"
            )

        if variant.attributes:
            attributes = "\n".join(
                f"- {key}: {value}"
                for key, value in variant.attributes.items()
            )

            variant_text += (
                f"Attributes:\n{attributes}\n"
            )

        if variant.inventory:
            variant_text += (
                f"Stock quantity: {variant.inventory.quantity}\n"
            )

        variants.append(variant_text.strip())

    variants_text = "\n\n".join(variants)

    page_content = f"""
Product: {product.name}

Brand: {product.brand.name}

Category: {product.category.name}

Description:
{product.description or "No description available."}

Product specifications:
{product.specifications or "No additional specifications available."}

Available variants:
{variants_text or "No variants available."}

Average rating:
{product.average_rating}/5

Number of reviews:
{product.count_reviews}
""".strip()

    return Document(
        page_content=page_content,
        metadata={
            "product_id": product.id,
            "brand_id": product.brand_id,
            "category_id": product.category_id,
        }
    )


def indexing_product(product) -> list[float]:
    document = product_to_document(product)

    embedding = model.encode_document(
        document.page_content,
        normalize_embeddings=True
    )

    return embedding.tolist()

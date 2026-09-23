from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def calculate_filter_scores(products, filters):
    """
    Scores each product's degree of textual match against the
    filter criteria (category, brand, specifications, variant
    attributes) using TF-IDF + cosine similarity.

    Returns: {product_id: score in [0, 1]}
    """

    # ---------------------------------------------------------
    # Build the "query" text from filter values
    # ---------------------------------------------------------

    query_terms = []

    if filters.category:
        query_terms.extend(filters.category)

    if filters.brand:
        query_terms.extend(filters.brand)

    if filters.specifications:
        for values in filters.specifications.values():
            query_terms.extend(str(v) for v in values)

    if filters.variant_attributes:
        for values in filters.variant_attributes.values():
            query_terms.extend(str(v) for v in values)

    if not query_terms:
        return {product.id: 0.0 for product in products}

    query_text = " ".join(query_terms)

    # ---------------------------------------------------------
    # Build a document per product from its attribute text
    # ---------------------------------------------------------

    documents = []

    for product in products:
        parts = [
            product.name or "",
            product.brand.name if product.brand else "",
            product.category.name if product.category else "",
        ]

        if product.specifications:
            for key, value in product.specifications.items():
                parts.append(f"{key} {value}")

        for variant in product.product_variants:
            if variant.attributes:
                for key, value in variant.attributes.items():
                    parts.append(f"{key} {value}")

        documents.append(" ".join(str(p) for p in parts))

    # ---------------------------------------------------------
    # TF-IDF over [query] + documents, then cosine similarity
    # ---------------------------------------------------------

    corpus = [query_text] + documents

    vectorizer = TfidfVectorizer(lowercase=True)
    tfidf_matrix = vectorizer.fit_transform(corpus)

    query_vector = tfidf_matrix[0]
    doc_vectors = tfidf_matrix[1:]

    similarities = cosine_similarity(
        query_vector,
        doc_vectors,
    ).flatten()

    return {
        product.id: float(score)
        for product, score in zip(products, similarities)
    }
import { useOne } from "@refinedev/core";
import { useParams } from "react-router-dom";

import type { Product } from "../../types/product";

export function ProductShow() {
    const { id } = useParams();

    const {
        data,
        isLoading,
        isError,
        error,
    } = useOne<Product>({
        resource: "products",
        id,
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isError) {
        return <div>Error: {error?.message}</div>;
    }

    const product = data?.data;

    if (!product) {
        return <div>Product not found</div>;
    }

    return (
        <div>
            <h1>{product.name}</h1>

            <p>
                Description: {product.description}
            </p>

            <p>
                Price: {product.min_price}
            </p>

            <p>
                Rating: {product.average_rating}
            </p>

            <p>
                Reviews: {product.count_reviews}
            </p>
        </div>
    );
}
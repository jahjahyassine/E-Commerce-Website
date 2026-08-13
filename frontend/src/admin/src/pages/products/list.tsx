import { useList } from "@refinedev/core";
import type { Product } from "../../types/product";

export function ProductList() {
    const {
        data,
        isLoading,
        isError,
        error,
    } = useList<Product>({
        resource: "products",
    });

    if (isLoading) {
        return <div>Loading products...</div>;
    }

    if (isError) {
        return <div>Error: {error?.message}</div>;
    }

    const products = data?.data ?? [];

    return (
        <div>
            <h1>Products</h1>

            {products.map((product) => (
                <div key={product.id}>
                    <h2>{product.name}</h2>

                    <p>
                        Price: {product.min_price}
                    </p>

                    <p>
                        Rating: {product.average_rating}
                    </p>
                </div>
            ))}
        </div>
    );
}
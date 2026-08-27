import { useQuery } from "@tanstack/react-query";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

function BestSellers() {
    const BASE_URL = import.meta.env.VITE_BASE_URL;
    const navigate = useNavigate();

    const fetchProducts = async () => {
        const response = await fetch(`${BASE_URL}/products`, {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error("Failed to retrieve products");
        }

        return await response.json();
    };

    const {
        data: products = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["products"],
        queryFn: fetchProducts,
    });

    const bestSellers = [...products]
        .sort((a, b) => {
            const ratingA = Number(a.average_rating ?? 0);
            const ratingB = Number(b.average_rating ?? 0);

            if (ratingB !== ratingA) {
                return ratingB - ratingA;
            }

            return (
                Number(b.count_reviews ?? 0) -
                Number(a.count_reviews ?? 0)
            );
        })
        .slice(0, 12);

    const renderStars = (rating) => {
        const numericRating = Number(rating) || 0;

        return (
            <div
                className="flex items-center gap-0.5"
                aria-label={`${numericRating} out of 5 stars`}
            >
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className={
                            star <= Math.round(numericRating)
                                ? "text-minimal-yellow"
                                : "text-muted"
                        }
                    >
                        ★
                    </span>
                ))}

                <span className="ml-1 text-xs text-muted">
                    {numericRating.toFixed(1)}
                </span>
            </div>
        );
    };

    if (isLoading) {
        return (
            <section
                id="bestsellers"
                className="
                    min-h-screen
                    w-full
                    flex
                    items-center
                    justify-center
                    text-foreground
                "
            >
                <p className="text-muted">
                    Loading best sellers...
                </p>
            </section>
        );
    }

    if (isError) {
        return (
            <section
                id="bestsellers"
                className="
                    min-h-screen
                    w-full
                    flex
                    items-center
                    justify-center
                    text-foreground
                "
            >
                <p className="text-minimal-red">
                    Failed to load best sellers.
                </p>
            </section>
        );
    }

    return (
        <section
            id="bestsellers"
            className="
                h-screen
                w-full
                flex
                text-foreground
                overflow-x-auto
                snap-x
                snap-mandatory
                scroll-smooth
                scrollbar-none
            "
            aria-label="Best sellers"
        >
            {bestSellers.length === 0 ? (
                <div className="min-w-full h-full flex items-center justify-center">
                    <p className="text-muted">
                        No products available.
                    </p>
                </div>
            ) : (
                Array.from(
                    {
                        length: Math.ceil(
                            bestSellers.length / 6
                        ),
                    },
                    (_, pageIndex) => {
                        const page = bestSellers.slice(
                            pageIndex * 6,
                            pageIndex * 6 + 6
                        );

                        return (
                            <div
                                key={pageIndex}
                                className="
                                    h-screen
                                    min-w-full
                                    snap-start
                                    grid
                                    grid-cols-1
                                    sm:grid-cols-2
                                    lg:grid-cols-3
                                    grid-rows-6
                                    sm:grid-rows-3
                                    lg:grid-rows-2
                                    gap-6
                                    px-6
                                    lg:px-10
                                    pt-28
                                    pb-6
                                    relative
                                "
                            >
                                {/* Header */}
                                {pageIndex === 0 && (
                                    <div
                                        className="
                                            absolute
                                            top-10
                                            left-0
                                            w-full
                                            text-center
                                            pointer-events-none
                                        "
                                    >
                                        <h2
                                            className="
                                                text-4xl
                                                md:text-5xl
                                                font-cormorant
                                                font-semibold
                                                text-foreground
                                            "
                                        >
                                            Best Sellers
                                        </h2>

                                        <p className="mt-2 text-sm text-muted">
                                            Our highest-rated products
                                        </p>
                                    </div>
                                )}

                                {page.map((product) => {
                                    const rating = Number(
                                        product.average_rating ?? 0
                                    );

                                    const image =
                                        product.media?.[0]?.media_url ??
                                        product.product_variants?.[0]
                                            ?.media?.[0]?.media_url ??
                                        null;

                                    return (
                                        <article
                                            key={product.id}
                                            onClick={() =>
                                                navigate(
                                                    `/products/${product.id}`
                                                )
                                            }
                                            className="
                                                h-full
                                                w-full
                                                overflow-hidden
                                                rounded-2xl
                                                border
                                                border-border-soft
                                                bg-background-black/70
                                                backdrop-blur-xl
                                                transition-all
                                                duration-300
                                                hover:scale-[1.02]
                                                hover:border-border
                                                flex
                                                flex-col
                                                relative
                                                cursor-pointer
                                            "
                                        >
                                            {/* Product image */}
                                            <div
                                                className="
                                                    flex-1
                                                    flex
                                                    items-center
                                                    justify-center
                                                    min-h-0
                                                    relative
                                                    overflow-hidden
                                                "
                                            >
                                                {image ? (
                                                    <img
                                                        src={image}
                                                        alt={product.name}
                                                        className="
                                                            object-contain
                                                            w-full
                                                            h-full
                                                            max-h-[220px]
                                                            p-5
                                                            transition-transform
                                                            duration-500
                                                            hover:scale-105
                                                        "
                                                    />
                                                ) : (
                                                    <div className="text-muted text-sm">
                                                        No image
                                                    </div>
                                                )}

                                                {/* Add to cart */}
                                                <button
                                                    type="button"
                                                    aria-label={`Add ${product.name} to cart`}
                                                    onClick={(event) => {
                                                        event.stopPropagation();

                                                        // Add to cart logic here
                                                    }}
                                                    className="
                                                        absolute
                                                        bottom-4
                                                        right-4
                                                        flex
                                                        items-center
                                                        gap-2
                                                        bg-primary
                                                        text-inverse
                                                        text-sm
                                                        font-bold
                                                        px-4
                                                        py-2
                                                        rounded-full
                                                        z-10
                                                        cursor-pointer
                                                        transition-all
                                                        duration-300
                                                        hover:scale-105
                                                        hover:bg-primary-hover
                                                    "
                                                >
                                                    <ShoppingCart
                                                        size={16}
                                                    />

                                                    <span>
                                                        Add to Cart
                                                    </span>
                                                </button>
                                            </div>

                                            {/* Product information */}
                                            <div
                                                className="
                                                    px-4
                                                    py-3
                                                    space-y-2
                                                    bg-background
                                                "
                                            >
                                                {/* Brand */}
                                                <p
                                                    className="
                                                        text-xs
                                                        text-muted
                                                        font-medium
                                                        uppercase
                                                        tracking-wide
                                                    "
                                                >
                                                    {product.brand?.name ??
                                                        "Brand"}
                                                </p>

                                                {/* Name */}
                                                <h3
                                                    className="
                                                        text-base
                                                        md:text-lg
                                                        font-semibold
                                                        text-foreground
                                                        line-clamp-1
                                                    "
                                                >
                                                    {product.name}
                                                </h3>

                                                {/* Rating + Price */}
                                                <div
                                                    className="
                                                        flex
                                                        items-center
                                                        justify-between
                                                        gap-3
                                                    "
                                                >
                                                    {renderStars(rating)}

                                                    <span
                                                        className="
                                                            font-bold
                                                            text-minimal-green
                                                            whitespace-nowrap
                                                        "
                                                    >
                                                        From{" "}
                                                        {Number(
                                                            product.min_price ??
                                                                0
                                                        ).toFixed(2)}{" "}
                                                        DH
                                                    </span>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        );
                    }
                )
            )}
        </section>
    );
}

export default BestSellers;
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import DepthCarousel from "./animation/DepthCarousel";

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

    /*
     * Best sellers:
     * 1. Highest rating
     * 2. Highest number of reviews
     */
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
        .slice(0, 6);

    /*
     * Get the best image available for the product.
     */
    const getProductImage = (product) => {
        // Prefer product-level media
        if (product?.media?.length > 0) {
            return product.media[0].media_url;
        }

        // Prefer active variant media
        const activeVariant = product?.product_variants?.find(
            (variant) =>
                variant.is_active &&
                variant.media?.length > 0
        );

        if (activeVariant?.media?.length > 0) {
            return activeVariant.media[0].media_url;
        }

        // Fallback to any variant with media
        const variantWithMedia =
            product?.product_variants?.find(
                (variant) => variant.media?.length > 0
            );

        return (
            variantWithMedia?.media?.[0]?.media_url ?? null
        );
    };

    /*
     * Get the cheapest active variant that has stock.
     */
    const getBestVariant = (product) => {
        const variants =
            product?.product_variants?.filter(
                (variant) =>
                    variant.is_active &&
                    Number(
                        variant.inventory?.quantity ?? 0
                    ) > 0
            ) ?? [];

        if (!variants.length) {
            return null;
        }

        return [...variants].sort(
            (a, b) =>
                Number(a.price) - Number(b.price)
        )[0];
    };

    /*
     * Convert products into the format expected by
     * DepthCarousel.
     */
    const carouselItems = bestSellers
        .map((product) => {
            const image = getProductImage(product);
            const variant = getBestVariant(product);

            if (!image || !variant) {
                return null;
            }

            const price = Number(variant.price ?? 0);

            const discount = Number(
                variant.discount_percentage ?? 0
            );

            const discountedPrice =
                price * (1 - discount / 100);

            return {
                id: product.id,

                image,

                alt: product.name,

                brand:
                    product.brand?.name ??
                    "Brand",

                name: product.name,

                category:
                    product.category?.name ??
                    "",

                rating: Number(
                    product.average_rating ?? 0
                ),

                reviews: Number(
                    product.count_reviews ?? 0
                ),

                price: discountedPrice,

                originalPrice:
                    discount > 0
                        ? price
                        : null,

                discount,
            };
        })
        .filter(Boolean);

    /*
     * ---------------------------------------------------------
     * LOADING
     * ---------------------------------------------------------
     */

    if (isLoading) {
        return (
            <section
                id="bestsellers"
                className="
                    min-h-screen
                    w-full
                    flex
                    flex-col
                    items-center
                    justify-center
                    text-foreground
                "
                aria-label="Best sellers"
            >
                <div className="space-y-3 text-center">
                    <div className="mx-auto h-8 w-48 animate-pulse rounded-lg bg-background-black/10" />

                    <div className="mx-auto h-4 w-64 animate-pulse rounded bg-background-black/10" />

                    <div className="mt-8 h-[410px] w-[300px] animate-pulse rounded-3xl bg-background-black/10" />
                </div>
            </section>
        );
    }

    /*
     * ---------------------------------------------------------
     * ERROR
     * ---------------------------------------------------------
     */

    if (isError) {
        return (
            <section
                id="bestsellers"
                className="
                    min-h-screen
                    w-full
                    flex
                    flex-col
                    items-center
                    justify-center
                    text-foreground
                "
                aria-label="Best sellers"
            >
                <p className="text-minimal-red">
                    Failed to load best sellers.
                </p>
            </section>
        );
    }

    /*
     * ---------------------------------------------------------
     * EMPTY
     * ---------------------------------------------------------
     */

    if (carouselItems.length === 0) {
        return (
            <section
                id="bestsellers"
                className="
                    min-h-screen
                    w-full
                    flex
                    flex-col
                    items-center
                    justify-center
                    text-foreground
                "
                aria-label="Best sellers"
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

                <p className="mt-8 text-muted">
                    No products available.
                </p>
            </section>
        );
    }

    /*
     * ---------------------------------------------------------
     * SECTION
     * ---------------------------------------------------------
     */

    return (
        <section
            id="bestsellers"
            className="
                min-h-screen
                w-full
                flex
                flex-col
                items-center
                justify-center
                text-foreground
                overflow-hidden
                px-6
                py-16
            "
            aria-label="Best sellers"
        >
            {/* -------------------------------------------------
                TITLE
            ------------------------------------------------- */}

            <div className="relative z-10 text-center">
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

            {/* -------------------------------------------------
                CENTERED CAROUSEL
            ------------------------------------------------- */}

            <div
                className="
                    mt-8
                    w-full
                    max-w-6xl
                    h-[500px]
                    flex
                    items-center
                    justify-center
                "
            >
                <DepthCarousel
                    items={carouselItems}

                    cardWidth={300}
                    cardHeight={410}
                    radius={24}

                    depth={180}
                    spread={75}
                    tilt={18}
                    tiltDirection="right"

                    perspective={1400}

                    visibleCards={3}

                    falloff={0.18}
                    blur={4}

                    duration={700}
                    ease="power3.out"

                    autoplay={true}
                    autoplayDelay={4500}

                    loop={true}

                    showControls={true}
                    showIndicators={true}

                    onChange={(index, item) => {
                        // Optional:
                        // console.log("Active product:", item);
                    }}
                />
            </div>

            {/* -------------------------------------------------
                VIEW ALL
            ------------------------------------------------- */}

            <button
                type="button"
                onClick={() => navigate("/products")}
                className="
                    mt-2
                    text-sm
                    font-semibold
                    text-primary
                    transition-colors
                    hover:text-primary-hover
                "
            >
                View all products →
            </button>
        </section>
    );
}

export default BestSellers;

import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    Star,
    ShoppingBag,
    TrendingUp,
} from "lucide-react";

import DepthCarousel from "./animation/DepthCarousel";

function BestSellers() {
    const BASE_URL =
        import.meta.env.VITE_BASE_URL || "http://localhost:8000";

    const navigate = useNavigate();

    // ---------------------------------------------------------
    // FETCH PRODUCTS
    // ---------------------------------------------------------

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

    // ---------------------------------------------------------
    // BEST SELLERS
    //
    // 1. Highest rating
    // 2. Highest number of reviews
    // ---------------------------------------------------------

    const bestSellers = [...products]
        .filter((product) => product?.is_active !== false)
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

    // ---------------------------------------------------------
    // GET PRODUCT IMAGE
    // ---------------------------------------------------------

    const getProductImage = (product) => {
        // Product-level media
        if (product?.media?.length > 0) {
            return product.media[0].media_url;
        }

        // Active variant media
        const activeVariant =
            product?.product_variants?.find(
                (variant) =>
                    variant.is_active &&
                    variant.media?.length > 0
            );

        if (activeVariant?.media?.length > 0) {
            return activeVariant.media[0].media_url;
        }

        // Any variant media
        const variantWithMedia =
            product?.product_variants?.find(
                (variant) => variant.media?.length > 0
            );

        return (
            variantWithMedia?.media?.[0]?.media_url ?? null
        );
    };

    // ---------------------------------------------------------
    // GET CHEAPEST ACTIVE VARIANT IN STOCK
    // ---------------------------------------------------------

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

    // ---------------------------------------------------------
    // CAROUSEL ITEMS
    // ---------------------------------------------------------

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

    // ---------------------------------------------------------
    // LOADING
    // ---------------------------------------------------------

    if (isLoading) {
        return (
            <section
                id="bestsellers"
                className="
                    w-full
                    px-6
                    py-20
                "
                aria-label="Best sellers"
            >
                <div className="mx-auto w-full max-w-7xl">
                    <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div className="space-y-3">
                            <div className="h-4 w-24 animate-pulse rounded bg-[#17242B]/10" />
                            <div className="h-12 w-72 animate-pulse rounded bg-[#17242B]/10" />
                            <div className="h-4 w-96 max-w-full animate-pulse rounded bg-[#17242B]/10" />
                        </div>

                        <div className="h-10 w-36 animate-pulse rounded-xl bg-[#17242B]/10" />
                    </div>

                    <div className="flex justify-center">
                        <div className="h-[410px] w-[300px] animate-pulse rounded-3xl bg-[#17242B]/10" />
                    </div>
                </div>
            </section>
        );
    }

    // ---------------------------------------------------------
    // ERROR
    // ---------------------------------------------------------

    if (isError) {
        return (
            <section
                id="bestsellers"
                className="
                    w-full
                    px-6
                    py-24
                "
                aria-label="Best sellers"
            >
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-3xl border border-[#17242B]/10 bg-[#F8FAFB] px-8 py-16 text-center">
                        <p className="text-sm font-medium text-[#68777E]">
                            Failed to load best sellers.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                window.location.reload()
                            }
                            className="
                                mt-5
                                text-sm
                                font-semibold
                                text-[#567C8D]
                                transition
                                hover:text-[#496D7E]
                            "
                        >
                            Try again →
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    // ---------------------------------------------------------
    // EMPTY
    // ---------------------------------------------------------

    if (carouselItems.length === 0) {
        return (
            <section
                id="bestsellers"
                className="
                    w-full
                    px-6
                    py-24
                "
                aria-label="Best sellers"
            >
                <div className="mx-auto max-w-7xl text-center">
                    <p
                        className="
                            text-xs
                            font-semibold
                            uppercase
                            tracking-[0.25em]
                            text-[#567C8D]
                        "
                    >
                        Our selection
                    </p>

                    <h2
                        className="
                            mt-3
                            font-cormorant
                            text-5xl
                            font-semibold
                            text-[#17242B]
                        "
                    >
                        Best Sellers
                    </h2>

                    <p className="mt-3 text-sm text-[#68777E]">
                        Our highest-rated products
                    </p>

                    <p className="mt-12 text-sm text-[#89979E]">
                        No products available.
                    </p>
                </div>
            </section>
        );
    }

    // ---------------------------------------------------------
    // SECTION
    // ---------------------------------------------------------

    return (
        <section
            id="bestsellers"
            className="
                relative
                w-full
                overflow-hidden
                px-6
                py-20
                md:py-24
            "
            aria-label="Best sellers"
        >
            {/* -------------------------------------------------
                BACKGROUND
            ------------------------------------------------- */}

            <div className="pointer-events-none absolute inset-0">
                {/* Main radial glow */}
                <div
                    className="
                        absolute
                        left-1/2
                        top-1/2
                        h-[650px]
                        w-[650px]
                        -translate-x-1/2
                        -translate-y-1/2
                        rounded-full
                        bg-[#567C8D]/[0.045]
                        blur-3xl
                    "
                />

                {/* Cream glow */}
                <div
                    className="
                        absolute
                        -right-40
                        top-20
                        h-[400px]
                        w-[400px]
                        rounded-full
                        bg-[#F5E4C8]/20
                        blur-3xl
                    "
                />
            </div>

            <div className="relative z-10 mx-auto w-full max-w-7xl">

                {/* =================================================
                    HEADER
                ================================================= */}

                <div
                    className="
                        mb-8
                        flex
                        flex-col
                        gap-8
                        border-b
                        border-[#17242B]/10
                        pb-8
                        lg:flex-row
                        lg:items-end
                        lg:justify-between
                    "
                >
                    {/* Left */}
                    <div className="max-w-2xl">

                        <div className="flex items-center gap-3">
                            <span
                                className="
                                    text-xs
                                    font-semibold
                                    uppercase
                                    tracking-[0.25em]
                                    text-[#567C8D]
                                "
                            >
                                Our selection
                            </span>

                            <span className="h-px w-10 bg-[#567C8D]/30" />
                        </div>

                        <h2
                            className="
                                mt-3
                                font-cormorant
                                text-5xl
                                font-semibold
                                leading-none
                                tracking-tight
                                text-[#17242B]
                                sm:text-6xl
                                lg:text-7xl
                            "
                        >
                            Best Sellers
                        </h2>

                        <p
                            className="
                                mt-4
                                max-w-xl
                                text-sm
                                leading-6
                                text-[#68777E]
                                md:text-base
                            "
                        >
                            Discover the products customers
                            are choosing most. Highly rated,
                            carefully selected, and ready for
                            your next upgrade.
                        </p>
                    </div>

                    {/* Right */}
                    <div
                        className="
                            flex
                            shrink-0
                            flex-col
                            items-start
                            gap-4
                            lg:items-end
                        "
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="
                                    flex
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-[#567C8D]/10
                                "
                            >
                                <TrendingUp
                                    size={17}
                                    className="text-[#567C8D]"
                                />
                            </div>

                            <div>
                                <p
                                    className="
                                        text-sm
                                        font-semibold
                                        text-[#17242B]
                                    "
                                >
                                    Customer favorites
                                </p>

                                <p
                                    className="
                                        mt-0.5
                                        text-xs
                                        text-[#89979E]
                                    "
                                >
                                    Based on ratings & reviews
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/products")
                            }
                            className="
                                group
                                inline-flex
                                items-center
                                gap-2
                                rounded-xl
                                border
                                border-[#17242B]/10
                                bg-white/60
                                px-5
                                py-3
                                text-sm
                                font-semibold
                                text-[#17242B]
                                shadow-sm
                                backdrop-blur-md
                                transition-all
                                duration-300
                                hover:-translate-y-0.5
                                hover:border-[#567C8D]/30
                                hover:bg-white
                                hover:text-[#567C8D]
                            "
                        >
                            View all products

                            <ArrowRight
                                size={16}
                                className="
                                    transition-transform
                                    duration-300
                                    group-hover:translate-x-1
                                "
                            />
                        </button>
                    </div>
                </div>

                {/* =================================================
                    CAROUSEL AREA
                ================================================= */}

                <div
                    className="
                        relative
                        flex
                        min-h-[470px]
                        w-full
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-[2rem]
                        border
                        border-[#17242B]/[0.07]
                        bg-white/30
                        backdrop-blur-[2px]
                    "
                >
                    {/* Decorative top label */}
                    <div
                        className="
                            pointer-events-none
                            absolute
                            left-6
                            top-5
                            z-20
                            hidden
                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-[0.2em]
                            text-[#89979E]
                            sm:block
                        "
                    >
                        Top rated
                    </div>

                    {/* Decorative count */}
                    <div
                        className="
                            pointer-events-none
                            absolute
                            right-6
                            top-5
                            z-20
                            hidden
                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-[0.2em]
                            text-[#89979E]
                            sm:block
                        "
                    >
                        {carouselItems.length} products
                    </div>

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
                            // console.log(
                            //     "Active product:",
                            //     item
                            // );
                        }}
                    />
                </div>

                {/* =================================================
                    BOTTOM INFORMATION
                ================================================= */}

                <div
                    className="
                        mt-8
                        flex
                        flex-col
                        gap-6
                        border-t
                        border-[#17242B]/10
                        pt-6
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                    "
                >
                    {/* Left stats */}
                    <div
                        className="
                            flex
                            flex-wrap
                            items-center
                            gap-x-8
                            gap-y-3
                        "
                    >
                        <div className="flex items-center gap-2">
                            <Star
                                size={15}
                                fill="currentColor"
                                className="text-[#F5B942]"
                            />

                            <span
                                className="
                                    text-xs
                                    font-medium
                                    text-[#68777E]
                                "
                            >
                                Highly rated
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <ShoppingBag
                                size={15}
                                className="text-[#567C8D]"
                            />

                            <span
                                className="
                                    text-xs
                                    font-medium
                                    text-[#68777E]
                                "
                            >
                                Trusted products
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span
                                className="
                                    flex
                                    h-1.5
                                    w-1.5
                                    rounded-full
                                    bg-[#567C8D]
                                "
                            />

                            <span
                                className="
                                    text-xs
                                    font-medium
                                    text-[#68777E]
                                "
                            >
                                Cash on delivery
                            </span>
                        </div>
                    </div>

                    {/* Right CTA */}
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/products")
                        }
                        className="
                            group
                            flex
                            w-fit
                            items-center
                            gap-2
                            text-xs
                            font-semibold
                            uppercase
                            tracking-[0.12em]
                            text-[#567C8D]
                        "
                    >
                        Explore the collection

                        <ArrowRight
                            size={14}
                            className="
                                transition-transform
                                duration-300
                                group-hover:translate-x-1
                            "
                        />
                    </button>
                </div>
            </div>
        </section>
    );
}

export default BestSellers;
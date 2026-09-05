import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Star, ShoppingBag } from "lucide-react";

function HeroSection() {
    const BASE_URL =
        import.meta.env.VITE_BASE_URL || "http://localhost:8000";

    const navigate = useNavigate();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    // ============================================================
    // FETCH PRODUCTS
    // ============================================================

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
        queryKey: ["hero-products"],
        queryFn: fetchProducts,
    });

    // ============================================================
    // HELPERS
    // ============================================================

    const getProductImage = (product) => {
        // Product-level media
        if (product?.media?.length > 0) {
            return product.media[0]?.media_url ?? null;
        }

        // Active variant with media
        const activeVariant = product?.product_variants?.find(
            (variant) =>
                variant?.is_active === true &&
                variant?.media?.length > 0
        );

        if (activeVariant?.media?.length > 0) {
            return activeVariant.media[0]?.media_url ?? null;
        }

        // Any variant with media
        const variantWithMedia = product?.product_variants?.find(
            (variant) => variant?.media?.length > 0
        );

        return (
            variantWithMedia?.media?.[0]?.media_url ?? null
        );
    };

    const getBestVariant = (product) => {
        const variants =
            product?.product_variants?.filter(
                (variant) =>
                    variant?.is_active === true &&
                    Number(
                        variant?.inventory?.quantity ?? 0
                    ) > 0
            ) ?? [];

        if (!variants.length) {
            return null;
        }

        return [...variants].sort(
            (a, b) =>
                Number(a?.price ?? 0) -
                Number(b?.price ?? 0)
        )[0];
    };

    const calculateDiscountedPrice = (
        price,
        discount
    ) => {
        const p = Number(price ?? 0);
        const d = Number(discount ?? 0);

        return p * (1 - d / 100);
    };

    // ============================================================
    // PREPARE HERO PRODUCTS
    // ============================================================
    //
    // ProductResponse gives us:
    //
    // id
    // name
    // description
    // min_price
    // average_rating
    // count_reviews
    // specifications
    // brand
    // category
    // media
    // product_variants
    //
    // ============================================================

    const heroProducts = useMemo(() => {
        if (!Array.isArray(products)) {
            return [];
        }

        return products
            .filter(
                (product) =>
                    product?.is_active !== false
            )
            .filter((product) => {
                // Only use products that have at least
                // one active variant currently in stock.
                const hasAvailableVariant =
                    product?.product_variants?.some(
                        (variant) =>
                            variant?.is_active === true &&
                            Number(
                                variant?.inventory
                                    ?.quantity ?? 0
                            ) > 0
                    );

                return hasAvailableVariant;
            })
            .sort((a, b) => {
                const ratingA = Number(
                    a?.average_rating ?? 0
                );

                const ratingB = Number(
                    b?.average_rating ?? 0
                );

                if (ratingB !== ratingA) {
                    return ratingB - ratingA;
                }

                return (
                    Number(b?.count_reviews ?? 0) -
                    Number(a?.count_reviews ?? 0)
                );
            });
    }, [products]);

    // ============================================================
    // AUTOMATIC PRODUCT ROTATION
    // ============================================================

    useEffect(() => {
        if (heroProducts.length <= 1) {
            return;
        }

        const interval = setInterval(() => {
            setIsAnimating(true);

            // Wait for the exit animation
            setTimeout(() => {
                setCurrentIndex(
                    (previousIndex) =>
                        (previousIndex + 1) %
                        heroProducts.length
                );

                setIsAnimating(false);
            }, 350);
        }, 5000);

        return () => {
            clearInterval(interval);
        };
    }, [heroProducts.length]);

    // ============================================================
    // KEEP INDEX VALID
    // ============================================================

    useEffect(() => {
        if (
            heroProducts.length > 0 &&
            currentIndex >= heroProducts.length
        ) {
            setCurrentIndex(0);
        }
    }, [heroProducts.length, currentIndex]);

    // ============================================================
    // CURRENT PRODUCT
    // ============================================================

    const featuredProduct =
        heroProducts[currentIndex];

    // ============================================================
    // LOADING
    // ============================================================

    if (isLoading) {
        return (
            <section
                id="hero"
                className="
                    relative
                    min-h-screen
                    w-full
                    overflow-hidden
                    px-0
                    pt-24
                    pb-0
                "
            >
                <div
                    className="
                        h-full
                        min-h-[calc(100vh-96px)]
                        w-full
                        animate-pulse
                        bg-slate-100/40
                    "
                />
            </section>
        );
    }

    // ============================================================
    // ERROR
    // ============================================================

    if (
        isError ||
        !featuredProduct
    ) {
        return (
            <section
                id="hero"
                className="
                    relative
                    flex
                    min-h-screen
                    w-full
                    items-center
                    justify-center
                    px-6
                    pt-24
                "
            >
                <div className="text-center">
                    <p className="text-sm font-medium text-[#68777E]">
                        Unable to load featured product.
                    </p>
                </div>
            </section>
        );
    }

    // ============================================================
    // CURRENT PRODUCT DATA
    // ============================================================

    const image =
        getProductImage(featuredProduct);

    const variant =
        getBestVariant(featuredProduct);

    const price = Number(
        variant?.price ??
            featuredProduct?.min_price ??
            0
    );

    const discount = Number(
        variant?.discount_percentage ?? 0
    );

    const discountedPrice =
        calculateDiscountedPrice(
            price,
            discount
        );

    const rating = Number(
        featuredProduct?.average_rating ?? 0
    );

    const reviews = Number(
        featuredProduct?.count_reviews ?? 0
    );

    const brand =
        featuredProduct?.brand?.name ??
        "ByteStore";

    const category =
        featuredProduct?.category?.name ??
        "Technology";

    const specifications =
        featuredProduct?.specifications ?? {};

    const specificationEntries =
        Object.entries(
            specifications
        ).slice(0, 3);

    // ============================================================
    // HERO
    // ============================================================

    return (
        <section
            id="hero"
            className="
                relative
                min-h-screen
                h-full
                w-full
                overflow-hidden
                px-0
                pt-24
                pb-0
            "
        >
            {/* =====================================================
                ANIMATED BACKGROUND
            ===================================================== */}

            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {/* Main soft gradient */}
                <div
                    className="
                        absolute
                        inset-0
                        bg-[radial-gradient(circle_at_50%_45%,rgba(86,124,141,0.10),transparent_42%)]
                    "
                />

                {/* Cream glow */}
                <div
                    className="
                        hero-glow
                        absolute
                        -left-32
                        -top-32
                        h-[500px]
                        w-[500px]
                        rounded-full
                        bg-[#F5E4C8]/40
                        blur-3xl
                    "
                />

                {/* Blue glow */}
                <div
                    className="
                        hero-glow-reverse
                        absolute
                        -right-40
                        bottom-[-100px]
                        h-[600px]
                        w-[600px]
                        rounded-full
                        bg-[#567C8D]/10
                        blur-3xl
                    "
                />

                {/* Outer orbit */}
                <div
                    className="
                        hero-orbit
                        absolute
                        left-1/2
                        top-1/2
                        h-[700px]
                        w-[700px]
                        -translate-x-1/2
                        -translate-y-1/2
                        rounded-full
                        border
                        border-[#567C8D]/[0.06]
                    "
                />

                {/* Inner orbit */}
                <div
                    className="
                        hero-orbit-reverse
                        absolute
                        left-1/2
                        top-1/2
                        h-[500px]
                        w-[500px]
                        -translate-x-1/2
                        -translate-y-1/2
                        rounded-full
                        border
                        border-[#F5E4C8]/[0.12]
                    "
                />
            </div>

            {/* =====================================================
                PRODUCT DIV

                FULL WIDTH
                TRANSPARENT
            ===================================================== */}

            <div
                className="
                    relative
                    z-10
                    h-full
                    min-h-[calc(100vh-96px)]
                    w-full
                    overflow-hidden
                    bg-transparent
                "
            >
                <div
                    key={featuredProduct.id}
                    className={`
                        hero-product-transition
                        grid
                        h-full
                        min-h-[calc(100vh-96px)]
                        w-full
                        grid-cols-1
                        lg:grid-cols-[1fr_1.15fr_1fr]
                        ${
                            isAnimating
                                ? "hero-product-exit"
                                : "hero-product-enter"
                        }
                    `}
                >
                    {/* =================================================
                        LEFT COLUMN
                    ================================================= */}

                    <div
                        className="
                            flex
                            flex-col
                            justify-center
                            border-b
                            border-[#17242B]/[0.08]
                            px-8
                            py-12
                            sm:px-12
                            lg:border-b-0
                            lg:border-r
                            lg:px-12
                            xl:px-16
                        "
                    >
                        {/* Eyebrow */}
                        <span
                            className="
                                mb-5
                                text-[11px]
                                font-semibold
                                uppercase
                                tracking-[0.25em]
                                text-[#567C8D]
                            "
                        >
                            Featured Product
                        </span>

                        {/* Product name */}
                        <h1
                            className="
                                max-w-[520px]
                                font-cormorant
                                text-5xl
                                font-semibold
                                leading-[0.88]
                                tracking-tight
                                text-[#17242B]
                                sm:text-6xl
                                lg:text-6xl
                                xl:text-7xl
                            "
                        >
                            {featuredProduct.name}
                        </h1>

                        {/* Description */}
                        <p
                            className="
                                mt-7
                                max-w-[420px]
                                text-sm
                                leading-7
                                text-[#68777E]
                                sm:text-base
                            "
                        >
                            {featuredProduct.description ||
                                "Discover premium technology carefully selected for performance, design and everyday use."}
                        </p>

                        {/* Buttons */}
                        <div className="mt-8 flex items-center gap-4">
                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        `/products/${featuredProduct.id}`
                                    )
                                }
                                className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-xl
                                    bg-[#567C8D]
                                    px-5
                                    py-3
                                    text-sm
                                    font-semibold
                                    text-white
                                    shadow-lg
                                    shadow-[#567C8D]/20
                                    transition
                                    duration-300
                                    hover:-translate-y-0.5
                                    hover:bg-[#496D7E]
                                "
                            >
                                Shop Now

                                <ArrowRight
                                    size={16}
                                />
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/products"
                                    )
                                }
                                className="
                                    text-sm
                                    font-medium
                                    text-[#68777E]
                                    transition
                                    hover:text-[#17242B]
                                "
                            >
                                View all
                            </button>
                        </div>

                        {/* Trust indicators */}
                        <div
                            className="
                                mt-10
                                flex
                                flex-wrap
                                gap-x-6
                                gap-y-2
                                text-xs
                                font-medium
                                text-[#89979E]
                            "
                        >
                            <span>
                                ✓ Trusted brands
                            </span>

                            <span>
                                ✓ Secure shopping
                            </span>

                            <span>
                                ✓ Cash on delivery
                            </span>
                        </div>
                    </div>

                    {/* =================================================
                        CENTER COLUMN
                    ================================================= */}

                    <div
                        className="
                            relative
                            flex
                            min-h-[460px]
                            items-center
                            justify-center
                            overflow-hidden
                            border-b
                            border-[#17242B]/[0.08]
                            lg:min-h-0
                            lg:border-b-0
                            lg:border-r
                        "
                    >
                        {/* Product spotlight */}
                        <div
                            className="
                                absolute
                                h-[360px]
                                w-[360px]
                                rounded-full
                                bg-[#567C8D]/10
                                blur-3xl
                            "
                        />

                        {/* Inner spotlight */}
                        <div
                            className="
                                absolute
                                h-[250px]
                                w-[250px]
                                rounded-full
                                bg-[#F5E4C8]/20
                                blur-3xl
                            "
                        />

                        {/* Category */}
                        <div
                            className="
                                absolute
                                left-8
                                top-8
                                z-20
                                rounded-full
                                border
                                border-[#17242B]/[0.08]
                                bg-white/50
                                px-4
                                py-2
                                text-xs
                                font-medium
                                text-[#68777E]
                                backdrop-blur-md
                            "
                        >
                            {category}
                        </div>

                        {/* Discount */}
                        {discount > 0 && (
                            <div
                                className="
                                    absolute
                                    right-8
                                    top-8
                                    z-20
                                    flex
                                    h-16
                                    w-16
                                    flex-col
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-[#F5E4C8]
                                    text-[#17242B]
                                    shadow-lg
                                "
                            >
                                <span className="text-sm font-bold">
                                    -{discount}%
                                </span>

                                <span
                                    className="
                                        text-[8px]
                                        uppercase
                                        tracking-wide
                                        opacity-60
                                    "
                                >
                                    Off
                                </span>
                            </div>
                        )}

                        {/* Product image */}
                        {image ? (
                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        `/products/${featuredProduct.id}`
                                    )
                                }
                                className="
                                    relative
                                    z-10
                                    flex
                                    h-full
                                    w-full
                                    cursor-pointer
                                    items-center
                                    justify-center
                                    outline-none
                                "
                                aria-label={`View ${featuredProduct.name}`}
                            >
                                <img
                                    src={image}
                                    alt={
                                        featuredProduct.name
                                    }
                                    className="
                                        max-h-[500px]
                                        max-w-[85%]
                                        object-contain
                                        drop-shadow-[0_35px_45px_rgba(23,36,43,0.20)]
                                        transition-transform
                                        duration-700
                                        hover:scale-105
                                    "
                                />
                            </button>
                        ) : (
                            <div
                                className="
                                    relative
                                    z-10
                                    text-sm
                                    text-[#89979E]
                                "
                            >
                                No image available
                            </div>
                        )}

                        {/* Price */}
                        <div
                            className="
                                absolute
                                bottom-8
                                left-1/2
                                z-20
                                -translate-x-1/2
                                whitespace-nowrap
                                rounded-full
                                border
                                border-[#17242B]/[0.08]
                                bg-white/60
                                px-5
                                py-2.5
                                shadow-lg
                                backdrop-blur-xl
                            "
                        >
                            {discount > 0 && (
                                <span
                                    className="
                                        mr-2
                                        text-sm
                                        text-[#89979E]
                                        line-through
                                    "
                                >
                                    {price.toFixed(2)} DH
                                </span>
                            )}

                            <span
                                className="
                                    text-lg
                                    font-bold
                                    text-[#567C8D]
                                "
                            >
                                {discountedPrice.toFixed(
                                    2
                                )}{" "}
                                DH
                            </span>
                        </div>

                        {/* Product position indicators */}
                        {heroProducts.length > 1 && (
                            <div
                                className="
                                    absolute
                                    bottom-9
                                    right-8
                                    z-30
                                    flex
                                    items-center
                                    gap-1.5
                                "
                            >
                                {heroProducts.map(
                                    (product, index) => (
                                        <button
                                            key={
                                                product.id
                                            }
                                            type="button"
                                            onClick={() => {
                                                if (
                                                    index ===
                                                    currentIndex
                                                ) {
                                                    return;
                                                }

                                                setIsAnimating(
                                                    true
                                                );

                                                setTimeout(
                                                    () => {
                                                        setCurrentIndex(
                                                            index
                                                        );
                                                        setIsAnimating(
                                                            false
                                                        );
                                                    },
                                                    350
                                                );
                                            }}
                                            aria-label={`Show product ${index + 1}`}
                                            className={`
                                                h-1.5
                                                rounded-full
                                                transition-all
                                                duration-300
                                                ${
                                                    index ===
                                                    currentIndex
                                                        ? "w-6 bg-[#567C8D]"
                                                        : "w-1.5 bg-[#567C8D]/25 hover:bg-[#567C8D]/50"
                                                }
                                            `}
                                        />
                                    )
                                )}
                            </div>
                        )}
                    </div>

                    {/* =================================================
                        RIGHT COLUMN
                    ================================================= */}

                    <div
                        className="
                            flex
                            flex-col
                            justify-between
                            px-8
                            py-10
                            sm:px-12
                            lg:px-10
                            xl:px-14
                        "
                    >
                        {/* Product information */}
                        <div>
                            <div className="flex items-center gap-3">
                                <span
                                    className="
                                        text-xs
                                        font-semibold
                                        uppercase
                                        tracking-[0.2em]
                                        text-[#567C8D]
                                    "
                                >
                                    {brand}
                                </span>

                                <span
                                    className="
                                        h-1
                                        w-1
                                        rounded-full
                                        bg-[#17242B]/20
                                    "
                                />

                                <span
                                    className="
                                        text-xs
                                        text-[#89979E]
                                    "
                                >
                                    {category}
                                </span>
                            </div>

                            <p
                                className="
                                    mt-6
                                    max-w-[360px]
                                    text-sm
                                    leading-6
                                    text-[#68777E]
                                "
                            >
                                A carefully selected
                                product from our
                                collection of premium
                                technology.
                            </p>

                            {/* Rating */}
                            <div className="mt-5 flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    <Star
                                        size={15}
                                        fill="currentColor"
                                        className="text-[#F5B942]"
                                    />

                                    <span
                                        className="
                                            text-sm
                                            font-semibold
                                            text-[#17242B]
                                        "
                                    >
                                        {rating.toFixed(
                                            1
                                        )}
                                    </span>
                                </div>

                                <span
                                    className="
                                        text-xs
                                        text-[#89979E]
                                    "
                                >
                                    ({reviews} reviews)
                                </span>
                            </div>
                        </div>

                        {/* Specifications */}
                        <div className="mt-12 lg:mt-0">
                            {specificationEntries.length >
                            0 ? (
                                <div className="space-y-5">
                                    {specificationEntries.map(
                                        ([key, value]) => (
                                            <div
                                                key={key}
                                                className="
                                                    flex
                                                    items-center
                                                    justify-between
                                                    gap-6
                                                    border-b
                                                    border-[#17242B]/[0.08]
                                                    pb-4
                                                "
                                            >
                                                <span
                                                    className="
                                                        text-xs
                                                        text-[#89979E]
                                                    "
                                                >
                                                    {key}
                                                </span>

                                                <span
                                                    className="
                                                        max-w-[180px]
                                                        truncate
                                                        text-right
                                                        text-sm
                                                        font-medium
                                                        text-[#17242B]
                                                    "
                                                >
                                                    {String(
                                                        value
                                                    )}
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {/* Premium */}
                                    <div className="flex items-center gap-4">
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
                                            <ShoppingBag
                                                size={17}
                                                className="text-[#567C8D]"
                                            />
                                        </div>

                                        <div>
                                            <p
                                                className="
                                                    text-sm
                                                    font-medium
                                                    text-[#17242B]
                                                "
                                            >
                                                Premium
                                                Quality
                                            </p>

                                            <p
                                                className="
                                                    mt-1
                                                    text-xs
                                                    text-[#89979E]
                                                "
                                            >
                                                Carefully
                                                selected
                                            </p>
                                        </div>
                                    </div>

                                    {/* Rating */}
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="
                                                flex
                                                h-10
                                                w-10
                                                items-center
                                                justify-center
                                                rounded-full
                                                bg-[#F5E4C8]
                                            "
                                        >
                                            <Star
                                                size={17}
                                                className="text-[#9A7B35]"
                                                fill="currentColor"
                                            />
                                        </div>

                                        <div>
                                            <p
                                                className="
                                                    text-sm
                                                    font-medium
                                                    text-[#17242B]
                                                "
                                            >
                                                Top Rated
                                            </p>

                                            <p
                                                className="
                                                    mt-1
                                                    text-xs
                                                    text-[#89979E]
                                                "
                                            >
                                                Loved by
                                                customers
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Explore */}
                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    `/products/${featuredProduct.id}`
                                )
                            }
                            className="
                                mt-10
                                flex
                                w-fit
                                items-center
                                gap-2
                                border-b
                                border-[#567C8D]/40
                                pb-1
                                text-xs
                                font-semibold
                                text-[#567C8D]
                                transition
                                hover:border-[#567C8D]
                                hover:text-[#496D7E]
                            "
                        >
                            Explore product

                            <ArrowRight
                                size={14}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* =====================================================
                ANIMATIONS
            ===================================================== */}

            <style>{`
                @keyframes heroGlow {
                    0%,
                    100% {
                        transform: translate3d(0, 0, 0) scale(1);
                    }

                    50% {
                        transform: translate3d(45px, 25px, 0)
                            scale(1.08);
                    }
                }

                @keyframes heroGlowReverse {
                    0%,
                    100% {
                        transform: translate3d(0, 0, 0) scale(1);
                    }

                    50% {
                        transform: translate3d(-40px, -30px, 0)
                            scale(1.1);
                    }
                }

                @keyframes heroOrbit {
                    from {
                        transform: translate(-50%, -50%)
                            rotate(0deg);
                    }

                    to {
                        transform: translate(-50%, -50%)
                            rotate(360deg);
                    }
                }

                @keyframes heroOrbitReverse {
                    from {
                        transform: translate(-50%, -50%)
                            rotate(360deg);
                    }

                    to {
                        transform: translate(-50%, -50%)
                            rotate(0deg);
                    }
                }

                @keyframes heroProductEnter {
                    0% {
                        opacity: 0;
                        transform: translateY(18px);
                    }

                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes heroProductExit {
                    0% {
                        opacity: 1;
                        transform: translateY(0);
                    }

                    100% {
                        opacity: 0;
                        transform: translateY(-18px);
                    }
                }

                .hero-glow {
                    animation: heroGlow 12s ease-in-out infinite;
                }

                .hero-glow-reverse {
                    animation: heroGlowReverse 15s ease-in-out infinite;
                }

                .hero-orbit {
                    animation: heroOrbit 35s linear infinite;
                }

                .hero-orbit-reverse {
                    animation: heroOrbitReverse 25s linear infinite;
                }

                .hero-product-enter {
                    animation:
                        heroProductEnter
                        650ms
                        cubic-bezier(0.22, 1, 0.36, 1)
                        both;
                }

                .hero-product-exit {
                    animation:
                        heroProductExit
                        350ms
                        ease-in
                        both;
                }

                @media (prefers-reduced-motion: reduce) {
                    .hero-glow,
                    .hero-glow-reverse,
                    .hero-orbit,
                    .hero-orbit-reverse,
                    .hero-product-enter,
                    .hero-product-exit {
                        animation: none;
                    }
                }
            `}</style>
        </section>
    );
}

export default HeroSection;
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import AccordionGallery from "../components/animation/AccordionGallery";
import { ArrowRight } from "lucide-react";

function FeaturedCategories() {
    const BASE_URL =
        import.meta.env.VITE_BASE_URL ||
        "http://localhost:8000";

    const navigate = useNavigate();

    // -----------------------------------------
    // Fetch categories
    // -----------------------------------------
    const fetchCategories = async () => {
        const response = await fetch(`${BASE_URL}/categories`);

        if (!response.ok) {
            throw new Error("Failed to fetch categories");
        }

        const data = await response.json();

        return data;
    };

    // -----------------------------------------
    // Fetch products
    // -----------------------------------------
    const fetchProducts = async () => {
        const response = await fetch(`${BASE_URL}/products`);

        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        return Array.isArray(data) ? data : [];
    };

    const {
        data: categories,
        isLoading: categoriesLoading,
        isError: categoriesError,
    } = useQuery({
        queryKey: ["featured-categories"],
        queryFn: fetchCategories,
    });

    const {
        data: products = [],
        isLoading: productsLoading,
        isError: productsError,
    } = useQuery({
        queryKey: ["featured-category-products"],
        queryFn: fetchProducts,
    });

    // -----------------------------------------
    // Get image from a product
    // -----------------------------------------
    const getProductImage = (product) => {
        // First: product media
        if (
            Array.isArray(product?.media) &&
            product.media.length > 0
        ) {
            return product.media[0]?.media_url;
        }

        // Second: active variant media
        const activeVariant = product?.product_variants?.find(
            (variant) =>
                variant?.is_active &&
                Array.isArray(variant?.media) &&
                variant.media.length > 0
        );

        if (activeVariant) {
            return activeVariant.media[0]?.media_url;
        }

        // Third: any variant media
        const variantWithMedia =
            product?.product_variants?.find(
                (variant) =>
                    Array.isArray(variant?.media) &&
                    variant.media.length > 0
            );

        if (variantWithMedia) {
            return variantWithMedia.media[0]?.media_url;
        }

        return null;
    };

    // -----------------------------------------
    // Create AccordionGallery items
    // -----------------------------------------
    const items = categories?.filter((category) => category?.is_active !== false)
        .map((category) => {
            const categoryProducts = products.filter(
                (product) =>
                    Number(product?.category_id) === Number(category?.id)
            );

            const productWithImage = categoryProducts.find(
                (product) => getProductImage(product)
            );

            const image = productWithImage
                ? getProductImage(productWithImage)
                : null;

            return {
                image,
                label: category.name,
                alt: category.name,
                link: "#",
                category,
            };
        })
        .filter((item) => item.image)
        .slice(0, 8);

    // -----------------------------------------
    // Loading
    // -----------------------------------------
    const isLoading =
        categoriesLoading || productsLoading;

    // -----------------------------------------
    // Error
    // -----------------------------------------
    const isError =
        categoriesError || productsError;

    // -----------------------------------------
    // Loading state
    // -----------------------------------------
    if (isLoading) {
        return (
            <section
                id="categories"
                className="
                    min-h-screen
                    w-full
                    px-6
                    py-20
                    text-foreground
                    flex
                    flex-col
                    justify-center
                "
                aria-label="Featured categories"
            >
                <div className="w-full max-w-7xl mx-auto">
                    <div className="mb-8">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
                            Explore
                        </p>

                        <h2
                            className="
                                mt-2
                                text-4xl
                                md:text-5xl
                                lg:text-6xl
                                font-cormorant
                                font-semibold
                            "
                        >
                            Featured Categories
                        </h2>

                        <p
                            className="
                                mt-3
                                max-w-2xl
                                text-sm
                                md:text-base
                                text-muted
                            "
                        >
                            Discover carefully selected categories
                            designed around the way you use technology.
                        </p>
                    </div>

                    <div
                        className="
                            h-[460px]
                            w-full
                            rounded-2xl
                            bg-white/5
                            animate-pulse
                        "
                    />
                </div>
            </section>
        );
    }

    // -----------------------------------------
    // Error state
    // -----------------------------------------
    if (isError) {
        return (
            <section
                id="categories"
                className="
                    min-h-screen
                    w-full
                    px-6
                    py-20
                    text-foreground
                    flex
                    flex-col
                    justify-center
                "
                aria-label="Featured categories"
            >
                <div className="w-full max-w-7xl mx-auto">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
                        Explore
                    </p>

                    <h2
                        className="
                            mt-2
                            text-4xl
                            md:text-5xl
                            lg:text-6xl
                            font-cormorant
                            font-semibold
                        "
                    >
                        Featured Categories
                    </h2>

                    <p className="mt-3 text-muted">
                        Unable to load categories right now.
                    </p>
                </div>
            </section>
        );
    }

    // -----------------------------------------
    // No categories
    // -----------------------------------------
    if (items.length === 0) {
        return (
            <section
                id="categories"
                className="
                    min-h-screen
                    w-full
                    px-6
                    py-20
                    text-foreground
                    flex
                    flex-col
                    justify-center
                "
                aria-label="Featured categories"
            >
                <div className="w-full max-w-7xl mx-auto">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
                        Explore
                    </p>

                    <h2
                        className="
                            mt-2
                            text-4xl
                            md:text-5xl
                            lg:text-6xl
                            font-cormorant
                            font-semibold
                        "
                    >
                        Featured Categories
                    </h2>

                    <p className="mt-3 text-muted">
                        No featured categories are available yet.
                    </p>
                </div>
            </section>
        );
    }

    // -----------------------------------------
    // Main
    // -----------------------------------------
    return (
        <section
            id="categories"
            className="
            w-full
            px-6
            py-20
            text-foreground
            flex
            flex-col
            justify-center
        "
            aria-label="Featured categories"
        >
            <div className="w-full max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <p
                        className="
                        text-sm
                        font-semibold
                        uppercase
                        tracking-[0.2em]
                        text-muted
                    "
                    >
                        Explore
                    </p>

                    <h2
                        className="
                        mt-2
                        text-4xl
                        md:text-5xl
                        lg:text-6xl
                        font-cormorant
                        font-semibold
                    "
                    >
                        Featured Categories
                    </h2>

                    <p
                        className="
                        mt-3
                        max-w-2xl
                        text-sm
                        md:text-base
                        text-muted
                    "
                    >
                        Discover carefully selected categories
                        designed around the way you use technology.
                    </p>
                </div>

                {/* Accordion */}
                <AccordionGallery
                    items={items}
                    defaultIndex={0}
                    expandRatio={0.52}
                    trigger="hover"
                    accentColor="#ffffff"
                    overlayColor="#060010"
                    textColor="#ffffff"
                    grayscale
                    showLabels
                    duration={0.6}
                    ease="power3.out"
                    parallax={0.5}
                    tilt={8}
                    stagger={0.06}
                    height={460}
                    gap={10}
                    radius={16}
                    orientation="horizontal"
                    onItemClick={(item) => {
                        navigate(
                            `/products?category_id=${item.category.id}`
                        );
                    }}
                />

                {/* =====================================================
                BELOW ACCORDION — SHOPPING CTA
            ====================================================== */}

                <div
                    className="
                    mt-16
                    flex
                    flex-col
                    md:flex-row
                    items-start
                    md:items-center
                    justify-between
                    gap-8
                    border-t
                    border-black/10
                    pt-10
                "
                >
                    <div className="max-w-2xl">
                        <p
                            className="
                            text-sm
                            font-semibold
                            uppercase
                            tracking-[0.2em]
                            text-muted
                        "
                        >
                            Your next upgrade
                        </p>

                        <h3
                            className="
                            mt-2
                            text-3xl
                            md:text-4xl
                            lg:text-5xl
                            font-cormorant
                            font-semibold
                        "
                        >
                            Find something worth bringing home.
                        </h3>

                        <p
                            className="
                            mt-3
                            text-sm
                            md:text-base
                            text-muted
                            max-w-xl
                        "
                        >
                            From everyday essentials to powerful
                            machines, explore the full ByteStore
                            collection and find what fits you.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/products")}
                        className="
                        shrink-0
                        inline-flex
                        items-center
                        gap-3
                        rounded-full
                        bg-[#567C8D]
                        px-7
                        py-3.5
                        text-sm
                        font-semibold
                        text-white
                        transition-all
                        duration-300
                        hover:scale-[1.03]
                        hover:shadow-lg
                    "
                    >
                        Explore all products

                        <ArrowRight
                            size={17}
                            strokeWidth={1.8}
                        />
                    </button>
                </div>

            </div>
        </section>
    );
}

export default FeaturedCategories;
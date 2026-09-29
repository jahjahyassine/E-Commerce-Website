import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useState } from "react";

import DotField from "../components/animation/DotField";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import FooterSection from "../components/FooterSection";
import Footer from "../components/Footer";

function Explore() {
    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const [searchParams, setSearchParams] = useSearchParams();

    // ==========================================
    // Filters stored in URL
    // ==========================================

    const categoryId = searchParams.get("category_id") || "";
    const brandId = searchParams.get("brand_id") || "";

    // Promotion filter
    const promotion = searchParams.get("promotion") === "true";

    // Search can come from the Navbar
    const urlSearch = searchParams.get("search") || "";
    const [search, setSearch] = useState(urlSearch);

    // ==========================================
    // Local Filters
    // ==========================================

    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [rating, setRating] = useState("");

    // ==========================================
    // Fetch Products
    // ==========================================

    const getProducts = async () => {
        const params = new URLSearchParams();

        if (categoryId) {
            params.set("category_id", categoryId);
        }

        if (brandId) {
            params.set("brand_id", brandId);
        }

        if (minPrice) {
            params.set("min_price", minPrice);
        }

        if (maxPrice) {
            params.set("max_price", maxPrice);
        }

        if (rating) {
            params.set("min_rating", rating);
        }

        if (search.trim()) {
            params.set("search", search.trim());
        }

        if (promotion) {
            params.set("on_promotion", "true");
        }

        const response = await fetch(
            `${BASE_URL}/products?${params.toString()}`,
            {
                method: "GET",
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }

        return await response.json();
    };

    // ==========================================
    // Fetch Categories
    // ==========================================

    const getCategories = async () => {
        const response = await fetch(
            `${BASE_URL}/categories`,
            {
                method: "GET",
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch categories");
        }

        return await response.json();
    };

    // ==========================================
    // Fetch Brands
    // ==========================================

    const getBrands = async () => {
        const response = await fetch(
            `${BASE_URL}/brands`,
            {
                method: "GET",
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch brands");
        }

        return await response.json();
    };

    // ==========================================
    // Products Query
    // ==========================================

    const {
        data: products = [],
        isLoading: productsLoading,
        isError: productsError,
    } = useQuery({
        queryKey: [
            "products",
            categoryId,
            brandId,
            minPrice,
            maxPrice,
            rating,
            search,
            promotion,
        ],
        queryFn: getProducts,
    });

    // ==========================================
    // Categories Query
    // ==========================================

    const {
        data: categories = [],
        isLoading: categoriesLoading,
        isError: categoriesError,
    } = useQuery({
        queryKey: ["categories"],
        queryFn: getCategories,
        staleTime: 5 * 60 * 1000,
    });

    // ==========================================
    // Brands Query
    // ==========================================

    const {
        data: brands = [],
        isLoading: brandsLoading,
        isError: brandsError,
    } = useQuery({
        queryKey: ["brands"],
        queryFn: getBrands,
        staleTime: 5 * 60 * 1000,
    });

    // ==========================================
    // Update URL Search
    // ==========================================

    const updateSearch = (value) => {
        setSearch(value);

        const params = new URLSearchParams(searchParams);

        if (value.trim()) {
            params.set("search", value.trim());
        } else {
            params.delete("search");
        }

        setSearchParams(params);
    };

    // ==========================================
    // Update Brand
    // ==========================================

    const updateBrand = (value) => {
        const params = new URLSearchParams(searchParams);

        if (value) {
            params.set("brand_id", value);
        } else {
            params.delete("brand_id");
        }

        setSearchParams(params);
    };

    // ==========================================
    // Update Category
    // ==========================================

    const updateCategory = (value) => {
        const params = new URLSearchParams(searchParams);

        if (value) {
            params.set("category_id", value);
        } else {
            params.delete("category_id");
        }

        setSearchParams(params);
    };

    // ==========================================
    // Update Promotion
    // ==========================================

    const updatePromotion = (checked) => {
        const params = new URLSearchParams(searchParams);

        if (checked) {
            params.set("promotion", "true");
        } else {
            params.delete("promotion");
        }

        setSearchParams(params);
    };

    // ==========================================
    // Clear All Filters
    // ==========================================

    const clearFilters = () => {
        setMinPrice("");
        setMaxPrice("");
        setRating("");
        setSearch("");
        setSearchParams({});
    };

    return (
        <main className="relative min-h-screen bg-background">

            {/* ==========================================
            Navbar
        ========================================== */}

            <header className="fixed top-0 left-0 w-full z-50">
                <Navbar />
            </header>

            {/* ==========================================
            Background
        ========================================== */}

            <div
                className="
                fixed
                inset-0
                w-full
                h-full
                z-0
                pointer-events-none
            "
                aria-hidden="true"
            >
                <DotField
                    dotRadius={1.2}
                    dotSpacing={18}
                    bulgeStrength={40}
                    glowRadius={140}
                    sparkle={false}
                    waveAmplitude={0}
                    cursorRadius={420}
                    cursorForce={0.08}
                    bulgeOnly
                    gradientFrom="#6e6e7380"
                    gradientTo="#d2d2d760"
                    glowColor="#1d1d1f20"
                />
            </div>

            {/* ==========================================
            Page Content
        ========================================== */}

            <section className="relative z-10 pt-20 pb-16">

                {/* ======================================
                Content Container
            ====================================== */}

                <div className="px-6">

                    {/* Heading */}

                    <h2
                        className="
                        text-5xl
                        font-cormorant
                        text-center
                        border-b
                        border-border-soft
                        mb-6
                        pb-3
                    "
                    >
                        Discover our premium collection of electronics.
                    </h2>

                    {/* ==================================
                    Search
                ================================== */}

                    <div className="flex justify-center mb-8">
                        <input
                            type="search"
                            placeholder="Search products..."
                            aria-label="Search products"
                            value={search}
                            onChange={(e) => updateSearch(e.target.value)}
                            className="
                                w-full
                                max-w-2xl
                                px-6 py-4
                                text-base
                                font-medium
                                backdrop-blur-xl
                                rounded-2xl
                                border
                                border-border-soft
                                bg-white/40
                                shadow-sm
                                transition-all
                                duration-200
                                focus:outline-none
                                focus:ring-2
                                focus:ring-primary/20
                                focus:border-primary
                                placeholder:text-subtle
                            "
                        />
                    </div>

                    {/* ==================================
                    Categories
                ================================== */}

                    <div
                        className="
                        border-y
                        border-border-soft
                        py-3
                        mb-5
                        overflow-hidden
                    "
                    >
                        <div
                            className="
                            flex
                            items-center
                            gap-2
                            overflow-x-auto
                            scrollbar-none
                            px-1
                            pb-1
                        "
                        >
                            {/* All */}

                            <button
                                type="button"
                                onClick={() => updateCategory("")}
                                className={`
                                shrink-0
                                px-4
                                py-2
                                rounded-full
                                text-sm
                                font-medium
                                transition-all
                                duration-200
                                whitespace-nowrap
                                ${categoryId === ""
                                        ? "bg-black text-white"
                                        : "bg-white/40 hover:bg-black/5 text-gray-700"
                                    }
                            `}
                            >
                                All
                            </button>

                            {/* Loading */}

                            {categoriesLoading && (
                                <span
                                    className="
                                    shrink-0
                                    px-4
                                    py-2
                                    text-sm
                                    text-muted
                                "
                                >
                                    Loading...
                                </span>
                            )}

                            {/* Categories */}

                            {!categoriesLoading &&
                                categories.map((category) => {
                                    const isActive =
                                        categoryId ===
                                        String(category.id);

                                    return (
                                        <button
                                            key={category.id}
                                            type="button"
                                            onClick={() =>
                                                updateCategory(
                                                    String(category.id)
                                                )
                                            }
                                            className={`
                                            shrink-0
                                            px-4
                                            py-2
                                            rounded-full
                                            text-sm
                                            font-medium
                                            whitespace-nowrap
                                            transition-all
                                            duration-200
                                            ${isActive
                                                    ? "bg-black text-white"
                                                    : "bg-white/40 text-gray-700 hover:bg-black/5"
                                                }
                                        `}
                                        >
                                            {category.name}
                                        </button>
                                    );
                                })}
                        </div>
                    </div>

                    {/* ==================================
                    Filters
                ================================== */}

                    <div
                        className="
                        flex
                        flex-wrap
                        items-center
                        gap-3
                        mb-6
                        justify-around
                    "
                    >
                        {/* Brand */}

                        <select
                            value={brandId}
                            onChange={(e) =>
                                updateBrand(e.target.value)
                            }
                            className="
                            min-w-36
                            rounded-xl
                            border
                            border-border-soft/70
                            bg-white/30
                            backdrop-blur-xl
                            px-3
                            py-2
                            text-sm
                            text-gray-700
                            outline-none
                            focus:border-border
                        "
                        >
                            <option value="">
                                All Brands
                            </option>

                            {brandsLoading && (
                                <option disabled>
                                    Loading brands...
                                </option>
                            )}

                            {!brandsLoading &&
                                brands.map((brand) => (
                                    <option
                                        key={brand.id}
                                        value={brand.id}
                                    >
                                        {brand.name}
                                    </option>
                                ))}
                        </select>

                        {/* Price */}

                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min="0"
                                placeholder="Min price"
                                value={minPrice}
                                onChange={(e) =>
                                    setMinPrice(e.target.value)
                                }
                                className="
                                w-32
                                rounded-xl
                                border
                                border-border-soft/70
                                bg-white/30
                                backdrop-blur-xl
                                px-3
                                py-2
                                text-sm
                                outline-none
                                focus:border-border
                            "
                            />

                            <span className="text-subtle">
                                —
                            </span>

                            <input
                                type="number"
                                min="0"
                                placeholder="Max price"
                                value={maxPrice}
                                onChange={(e) =>
                                    setMaxPrice(e.target.value)
                                }
                                className="
                                w-32
                                rounded-xl
                                border
                                border-border-soft/70
                                bg-white/30
                                backdrop-blur-xl
                                px-3
                                py-2
                                text-sm
                                outline-none
                                focus:border-border
                            "
                            />
                        </div>

                        {/* Rating */}

                        <select
                            value={rating}
                            onChange={(e) =>
                                setRating(e.target.value)
                            }
                            className="
                            min-w-36
                            rounded-xl
                            border
                            border-border-soft/70
                            bg-white/30
                            backdrop-blur-xl
                            px-3
                            py-2
                            text-sm
                            text-gray-700
                            outline-none
                            focus:border-border
                        "
                        >
                            <option value="">
                                Any Rating
                            </option>

                            <option value="5">
                                ★★★★★
                            </option>

                            <option value="4">
                                ★★★★☆ & up
                            </option>

                            <option value="3">
                                ★★★☆☆ & up
                            </option>

                            <option value="2">
                                ★★☆☆☆ & up
                            </option>

                            <option value="1">
                                ★☆☆☆☆ & up
                            </option>
                        </select>

                        {/* Promotion */}

                        <label
                            className="
                            flex
                            items-center
                            gap-2
                            px-3
                            py-2
                            rounded-xl
                            border
                            border-border-soft/70
                            bg-white/30
                            backdrop-blur-xl
                            text-sm
                            font-medium
                            cursor-pointer
                            select-none
                        "
                        >
                            <input
                                type="checkbox"
                                checked={promotion}
                                onChange={(e) =>
                                    updatePromotion(
                                        e.target.checked
                                    )
                                }
                                className="
                                h-4
                                w-4
                                accent-black
                                cursor-pointer
                            "
                            />

                            On promotion
                        </label>

                        {/* Clear */}

                        {(categoryId ||
                            brandId ||
                            minPrice ||
                            maxPrice ||
                            rating ||
                            search ||
                            promotion) && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="
                                px-4
                                py-2
                                rounded-xl
                                text-sm
                                font-medium
                                border
                                border-border-soft
                                hover:bg-black/5
                                transition
                            "
                                >
                                    Clear filters
                                </button>
                            )}
                    </div>

                    {/* ==================================
                    Errors
                ================================== */}

                    {(categoriesError || brandsError) && (
                        <p className="text-sm text-red-500 mb-4">
                            Failed to load categories or brands.
                        </p>
                    )}

                    {/* ==================================
                    Products
                ================================== */}

                    <section
                        className="
                        flex
                        flex-wrap
                        gap-6
                    "
                    >
                        {/* Loading */}

                        {productsLoading && (
                            <p className="w-full text-center py-10">
                                Loading products...
                            </p>
                        )}

                        {/* Error */}

                        {productsError && (
                            <p className="w-full text-center py-10 text-red-500">
                                Failed to load products.
                            </p>
                        )}

                        {/* Empty */}

                        {!productsLoading &&
                            !productsError &&
                            products.length === 0 && (
                                <p className="w-full text-center py-10 text-muted">
                                    No products found.
                                </p>
                            )}

                        {/* Products */}

                        {!productsLoading &&
                            !productsError &&
                            products.map((product) => (
                                <div
                                    key={product.id}
                                    className="
                                    w-full
                                    sm:w-[calc(50%-0.75rem)]
                                    md:w-[calc(33.333%-1rem)]
                                    lg:w-[calc(25%-1.125rem)]
                                    xl:w-[calc(20%-1.2rem)]
                                "
                                >
                                    <ProductCard
                                        product={product}
                                    />
                                </div>
                            ))}
                    </section>

                </div>
            </section>

            {/* ==========================================
            Footer — Full Width
        ========================================== */}

            <footer className="relative z-10 w-full">
                <Footer />
            </footer>

        </main>
    );
}

export default Explore;

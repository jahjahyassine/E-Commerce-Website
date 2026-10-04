import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import DotField from "../components/animation/DotField";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";

// ==========================================
// Shared classes (theme tokens only)
// ==========================================

// Inputs, selects, promotion toggle
const FIELD_SHAPE =
    "rounded-xl border px-3 py-2.5 text-base outline-none transition-colors";
const FIELD_IDLE =
    "border-border bg-surface/80 text-foreground placeholder:text-subtle hover:border-accent/40 focus:border-accent";
const FIELD = `${FIELD_SHAPE} ${FIELD_IDLE}`;
const FIELD_ON = `${FIELD_SHAPE} border-accent/60 bg-accent/10 text-accent`;

// Category pills
const PILL_BASE =
    "shrink-0 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200";
const PILL_ACTIVE =
    "border-accent bg-accent text-inverse shadow-[0_6px_20px_rgba(111,167,163,0.25)]";
const PILL_IDLE =
    "border-border-soft bg-surface/70 text-muted hover:border-accent/40 hover:text-foreground";

// Product grid column (5 per row on xl)
const CARD_COL = `
    w-full
    sm:w-[calc(50%-0.75rem)]
    md:w-[calc(33.333%-1rem)]
    lg:w-[calc(25%-1.125rem)]
    xl:w-[calc(20%-1.2rem)]
`;

const SKELETON_COUNT = 10;

// Products per page (sent to the API as "limit")
const PAGE_SIZE = 10;

// Pagination: plain text, no background or border
const PAGE_NUM =
    "relative inline-flex h-10 min-w-10 items-center justify-center px-2 text-sm font-medium transition-colors duration-200";
const PAGE_NUM_IDLE = "text-subtle hover:text-foreground";
const PAGE_NUM_ACTIVE = "text-accent font-bold";
const PAGE_ARROW =
    "inline-flex h-10 items-center gap-1 px-2 text-sm font-medium text-muted transition-colors duration-200 hover:text-accent disabled:pointer-events-none disabled:opacity-30";

// 1 … 4 5 6 … 12
function getPageNumbers(current, total) {
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages = [1];
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    if (start > 2) pages.push("start-ellipsis");

    for (let i = start; i <= end; i++) pages.push(i);

    if (end < total - 1) pages.push("end-ellipsis");

    pages.push(total);

    return pages;
}

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
    // Pagination
    // ==========================================

    const [page, setPage] = useState(1);

    // Go back to page 1 whenever a filter changes
    useEffect(() => {
        setPage(1);
    }, [categoryId, brandId, minPrice, maxPrice, rating, search, promotion]);

    // ==========================================
    // Fetch Products
    // ==========================================

    const getProducts = async () => {
        const params = new URLSearchParams();

        params.set("page", String(page));
        params.set("limit", String(PAGE_SIZE));

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
        const response = await fetch(`${BASE_URL}/categories`, {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error("Failed to fetch categories");
        }

        return await response.json();
    };

    // ==========================================
    // Fetch Brands
    // ==========================================

    const getBrands = async () => {
        const response = await fetch(`${BASE_URL}/brands`, {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error("Failed to fetch brands");
        }

        return await response.json();
    };

    // ==========================================
    // Products Query
    // ==========================================

    const {
        data: productsData,
        isFetching: productsFetching,
        isLoading: productsLoading,
        isError: productsError,
    } = useQuery({
        queryKey: [
            "products",
            page,
            categoryId,
            brandId,
            minPrice,
            maxPrice,
            rating,
            search,
            promotion,
        ],
        queryFn: getProducts,
        placeholderData: (previousData) => previousData,
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

    const products = productsData?.items ?? [];
    const total = productsData?.total ?? 0;
    const totalPages = Math.max(1, productsData?.total_pages ?? 1);
    const currentPage = Math.min(page, totalPages);

    const goToPage = (nextPage) => {
        setPage(Math.min(Math.max(nextPage, 1), totalPages));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const hasFilters =
        categoryId ||
        brandId ||
        minPrice ||
        maxPrice ||
        rating ||
        search ||
        promotion;

    return (
        <main className="relative min-h-screen bg-background text-foreground">

            {/* ==========================================
                Navbar
            ========================================== */}

            <header className="fixed top-0 left-0 w-full z-50">
                <Navbar />
            </header>

            {/* ==========================================
                Background (dots + ambient glow)
            ========================================== */}

            <div
                className="
                    fixed
                    inset-0
                    w-full
                    h-full
                    z-0
                    overflow-hidden
                    pointer-events-none
                "
                aria-hidden="true"
            >
                <div className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full bg-accent/10 blur-[120px]" />
                <div className="absolute top-1/3 -right-48 h-[480px] w-[480px] rounded-full bg-secondary/10 blur-[140px]" />

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
                    gradientFrom="#A8AEC040"
                    gradientTo="#6FA7A330"
                    glowColor="#6FA7A320"
                />
            </div>

            {/* ==========================================
                Page Content
            ========================================== */}

            <section className="relative z-10 pt-20 pb-16">

                <div className="px-6 sm:px-8 lg:px-12 xl:px-16 max-w-[1800px] mx-auto">

                    {/* Heading */}

                    <div className="text-center mb-8">
                        <h2 className="text-5xl font-cormorant text-foreground">
                            Discover our premium collection of electronics.
                        </h2>

                        <p className="mt-3 mx-auto max-w-xl text-muted">
                            Filter by brand, price or rating to find the right
                            fit for the way you work and play.
                        </p>

                        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                    </div>

                    {/* ==================================
                        Search
                    ================================== */}

                    <div className="flex justify-center mb-8">
                        <div className="relative w-full max-w-2xl">
                            <Search
                                size={18}
                                strokeWidth={1.8}
                                className="absolute left-5 top-1/2 -translate-y-1/2 text-subtle pointer-events-none"
                            />

                            <input
                                type="search"
                                placeholder="Search products..."
                                aria-label="Search products"
                                value={search}
                                onChange={(e) => updateSearch(e.target.value)}
                                className="
                                    w-full
                                    pl-12 pr-6 py-4
                                    text-base
                                    font-medium
                                    text-foreground
                                    rounded-2xl
                                    border
                                    border-border
                                    bg-surface/80
                                    backdrop-blur-xl
                                    shadow-elevated
                                    transition-all
                                    duration-200
                                    placeholder:text-subtle
                                    hover:border-accent/40
                                    focus:outline-none
                                    focus:border-accent
                                    focus:ring-2
                                    focus:ring-accent/30
                                "
                            />
                        </div>
                    </div>

                    {/* ==================================
                        Categories
                    ================================== */}

                    <div className="py-3 mb-5 overflow-hidden">
                        <div
                            className="
                                flex
                                items-center
                                justify-center
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
                                className={`${PILL_BASE} ${
                                    categoryId === "" ? PILL_ACTIVE : PILL_IDLE
                                }`}
                            >
                                All
                            </button>

                            {/* Loading */}

                            {categoriesLoading && (
                                <span className="shrink-0 px-4 py-2 text-sm text-muted">
                                    Loading...
                                </span>
                            )}

                            {/* Categories */}

                            {!categoriesLoading &&
                                categories.map((category) => {
                                    const isActive =
                                        categoryId === String(category.id);

                                    return (
                                        <button
                                            key={category.id}
                                            type="button"
                                            onClick={() =>
                                                updateCategory(
                                                    String(category.id)
                                                )
                                            }
                                            className={`${PILL_BASE} ${
                                                isActive
                                                    ? PILL_ACTIVE
                                                    : PILL_IDLE
                                            }`}
                                        >
                                            {category.name}
                                        </button>
                                    );
                                })}
                        </div>
                    </div>

                    {/* ==================================
                        Filters panel
                    ================================== */}

                    <div
                        className="
                            flex
                            flex-wrap
                            items-center
                            justify-center
                            gap-3
                            mb-4
                            p-4
                            rounded-2xl
                            border
                            border-border-soft
                            bg-card-dark/70
                            backdrop-blur-xl
                            shadow-inner
                        "
                    >
                        {/* Category */}

                        <select
                            value={categoryId}
                            onChange={(e) => updateCategory(e.target.value)}
                            className={`${FIELD} min-w-36`}
                        >
                            <option
                                value=""
                                className="bg-background-dark text-foreground"
                            >
                                All Categories
                            </option>

                            {categoriesLoading && (
                                <option
                                    disabled
                                    className="bg-background-dark text-subtle"
                                >
                                    Loading categories...
                                </option>
                            )}

                            {!categoriesLoading &&
                                categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                        className="bg-background-dark text-foreground"
                                    >
                                        {category.name}
                                    </option>
                                ))}
                        </select>

                        {/* Brand */}

                        <select
                            value={brandId}
                            onChange={(e) => updateBrand(e.target.value)}
                            className={`${FIELD} min-w-36`}
                        >
                            <option
                                value=""
                                className="bg-background-dark text-foreground"
                            >
                                All Brands
                            </option>

                            {brandsLoading && (
                                <option
                                    disabled
                                    className="bg-background-dark text-subtle"
                                >
                                    Loading brands...
                                </option>
                            )}

                            {!brandsLoading &&
                                brands.map((brand) => (
                                    <option
                                        key={brand.id}
                                        value={brand.id}
                                        className="bg-background-dark text-foreground"
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
                                onChange={(e) => setMinPrice(e.target.value)}
                                className={`${FIELD} w-32`}
                            />

                            <span className="text-subtle">—</span>

                            <input
                                type="number"
                                min="0"
                                placeholder="Max price"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                                className={`${FIELD} w-32`}
                            />
                        </div>

                        {/* Rating */}

                        <select
                            value={rating}
                            onChange={(e) => setRating(e.target.value)}
                            className={`${FIELD} min-w-36`}
                        >
                            <option
                                value=""
                                className="bg-background-dark text-foreground"
                            >
                                Any Rating
                            </option>

                            <option
                                value="5"
                                className="bg-background-dark text-foreground"
                            >
                                ★★★★★
                            </option>

                            <option
                                value="4"
                                className="bg-background-dark text-foreground"
                            >
                                ★★★★☆ & up
                            </option>

                            <option
                                value="3"
                                className="bg-background-dark text-foreground"
                            >
                                ★★★☆☆ & up
                            </option>

                            <option
                                value="2"
                                className="bg-background-dark text-foreground"
                            >
                                ★★☆☆☆ & up
                            </option>

                            <option
                                value="1"
                                className="bg-background-dark text-foreground"
                            >
                                ★☆☆☆☆ & up
                            </option>
                        </select>

                        {/* Promotion (lights up when active) */}

                        <label
                            className={`${
                                promotion ? FIELD_ON : FIELD
                            } flex items-center gap-2 font-medium cursor-pointer select-none`}
                        >
                            <input
                                type="checkbox"
                                checked={promotion}
                                onChange={(e) =>
                                    updatePromotion(e.target.checked)
                                }
                                className="
                                    h-4
                                    w-4
                                    accent-accent
                                    cursor-pointer
                                "
                            />

                            On promotion
                        </label>

                        {/* Clear */}

                        {hasFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="
                                    px-4
                                    py-2
                                    rounded-xl
                                    text-sm
                                    font-medium
                                    text-muted
                                    border
                                    border-border
                                    hover:border-accent/40
                                    hover:text-foreground
                                    transition-colors
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
                        <p className="text-sm text-danger mb-4">
                            Failed to load categories or brands.
                        </p>
                    )}

                    {/* Result count */}

                    {!productsLoading && !productsError && (
                        <p className="mb-5 text-sm text-muted">
                            {total}{" "}
                            {total === 1 ? "product" : "products"}
                            {totalPages > 1 &&
                                ` · Page ${currentPage} of ${totalPages}`}
                        </p>
                    )}

                    {/* ==================================
                        Products
                    ================================== */}

                    <section
                        className={`flex flex-wrap gap-6 transition-opacity duration-200 ${
                            productsFetching && !productsLoading
                                ? "opacity-60"
                                : "opacity-100"
                        }`}
                    >
                        {/* Loading skeletons */}

                        {productsLoading &&
                            Array.from({ length: SKELETON_COUNT }).map(
                                (_, index) => (
                                    <div key={index} className={CARD_COL}>
                                        <div
                                            className="
                                                h-[390px]
                                                rounded-3xl
                                                border
                                                border-border-soft
                                                bg-card/60
                                                overflow-hidden
                                                animate-pulse
                                            "
                                        >
                                            <div className="h-[230px] bg-card-dark/70" />

                                            <div className="p-4 space-y-3">
                                                <div className="h-4 w-3/4 rounded bg-card-hover" />
                                                <div className="h-3 w-1/3 rounded bg-card-hover" />
                                                <div className="h-9 rounded-full bg-card-hover" />
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}

                        {/* Error */}

                        {productsError && (
                            <div
                                className="
                                    w-full
                                    py-10
                                    text-center
                                    rounded-2xl
                                    border
                                    border-danger/30
                                    bg-danger/10
                                    text-danger
                                "
                            >
                                Failed to load products. Please try again.
                            </div>
                        )}

                        {/* Empty */}

                        {!productsLoading &&
                            !productsError &&
                            products.length === 0 && (
                                <div
                                    className="
                                        w-full
                                        py-16
                                        text-center
                                        rounded-2xl
                                        border
                                        border-dashed
                                        border-border
                                        bg-card-dark/40
                                    "
                                >
                                    <p className="text-lg font-semibold text-foreground">
                                        No products found.
                                    </p>

                                    <p className="mt-1 text-sm text-muted">
                                        Try a different search or adjust your
                                        filters.
                                    </p>

                                    {hasFilters && (
                                        <button
                                            type="button"
                                            onClick={clearFilters}
                                            className="
                                                mt-5
                                                px-5
                                                py-2
                                                rounded-full
                                                text-sm
                                                font-bold
                                                bg-accent
                                                hover:bg-accent-hover
                                                text-inverse
                                                transition-colors
                                            "
                                        >
                                            Clear filters
                                        </button>
                                    )}
                                </div>
                            )}

                        {/* Products */}

                        {!productsLoading &&
                            !productsError &&
                            products.map((product) => (
                                <div key={product.id} className={CARD_COL}>
                                    <ProductCard product={product} />
                                </div>
                            ))}
                    </section>

                    {/* ==================================
                        Pagination
                    ================================== */}

                    {!productsLoading && !productsError && totalPages > 1 && (
                        <nav
                            aria-label="Pagination"
                            className="mt-12 flex flex-wrap items-center justify-center gap-1 sm:gap-3"
                        >
                            <button
                                type="button"
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                aria-label="Previous page"
                                className={PAGE_ARROW}
                            >
                                <ChevronLeft size={16} strokeWidth={2} />
                            </button>

                            {getPageNumbers(currentPage, totalPages).map(
                                (item) =>
                                    typeof item === "string" ? (
                                        <span
                                            key={item}
                                            className="px-1 text-subtle"
                                            aria-hidden="true"
                                        >
                                            …
                                        </span>
                                    ) : (
                                        <button
                                            key={item}
                                            type="button"
                                            onClick={() => goToPage(item)}
                                            aria-label={`Page ${item}`}
                                            aria-current={
                                                item === currentPage
                                                    ? "page"
                                                    : undefined
                                            }
                                            className={`${PAGE_NUM} ${
                                                item === currentPage
                                                    ? PAGE_NUM_ACTIVE
                                                    : PAGE_NUM_IDLE
                                            }`}
                                        >
                                            {item}

                                            {item === currentPage && (
                                                <span
                                                    className="absolute bottom-1 left-1/2 h-px w-5 -translate-x-1/2 bg-accent"
                                                    aria-hidden="true"
                                                />
                                            )}
                                        </button>
                                    )
                            )}

                            <button
                                type="button"
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                aria-label="Next page"
                                className={PAGE_ARROW}
                            >
                                <ChevronRight size={16} strokeWidth={2} />
                            </button>
                        </nav>
                    )}

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
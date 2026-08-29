import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useState } from "react";

import DotField from "../components/animation/DotField";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";

function Explore() {
    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [rating, setRating] = useState("");

    const [searchParams, setSearchParams] = useSearchParams();

    // ==========================================
    // Filters stored in URL
    // ==========================================

    const categoryId = searchParams.get("category_id") || "";
    const brandId = searchParams.get("brand_id") || "";

    // Search can come from the Navbar
    const urlSearch = searchParams.get("search") || "";

    const [search, setSearch] = useState(urlSearch);


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
        <main className="relative min-h-screen">

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
                Main Content
            ========================================== */}

            <section
                className="
                    relative
                    z-10
                    pt-20
                    px-6
                    pb-10
                "
            >

                {/* ==========================================
                    Heading
                ========================================== */}

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


                {/* ==========================================
                    Search
                ========================================== */}

                <div
                    className="
                        flex
                        flex-col
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        gap-3
                        mb-5
                    "
                >
                    <input
                        type="search"
                        placeholder="Search products"
                        aria-label="Search products"
                        value={search}
                        onChange={(e) =>
                            updateSearch(e.target.value)
                        }
                        className="
                            w-full
                            sm:w-80
                            px-4
                            py-2
                            text-sm
                            font-semibold
                            backdrop-blur-xl
                            rounded-2xl
                            border
                            border-border-soft
                            bg-white/30
                            focus:outline-none
                            focus:border-border
                            placeholder:text-subtle
                        "
                    />
                </div>


                {/* ==========================================
                    Categories
                ========================================== */}

                <div
                    className="
                        border-y
                        border-border-soft
                        py-3
                        mb-5
                    "
                >

                    <div
                        className="
                            flex
                            flex-wrap
                            items-center
                            justify-center
                            gap-2
                        "
                    >

                        {/* All Categories */}

                        <button
                            type="button"
                            onClick={() => updateCategory("")}
                            className={`
                                px-4
                                py-2
                                rounded-xl
                                text-sm
                                font-medium
                                transition
                                ${
                                    categoryId === ""
                                        ? "bg-black text-white"
                                        : "hover:bg-black/5"
                                }
                            `}
                        >
                            All Categories
                        </button>


                        {/* Loading */}

                        {categoriesLoading && (
                            <span
                                className="
                                    px-4
                                    py-2
                                    text-sm
                                    text-muted
                                "
                            >
                                Loading categories...
                            </span>
                        )}


                        {/* Categories */}

                        {!categoriesLoading &&
                            categories.map((category) => (
                                <button
                                    key={category.id}
                                    type="button"
                                    onClick={() =>
                                        updateCategory(
                                            String(category.id)
                                        )
                                    }
                                    className={`
                                        px-4
                                        py-2
                                        rounded-xl
                                        text-sm
                                        font-medium
                                        transition
                                        ${
                                            categoryId ===
                                            String(category.id)
                                                ? "bg-black text-white"
                                                : "hover:bg-black/5"
                                        }
                                    `}
                                >
                                    {category.name}
                                </button>
                            ))
                        }

                    </div>

                </div>


                {/* ==========================================
                    Filters
                ========================================== */}

                <div
                    className="
                        flex
                        flex-wrap
                        items-center
                        gap-3
                        mb-6
                    "
                >

                    {/* ======================================
                        Brand
                    ====================================== */}

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
                            ))
                        }

                    </select>


                    {/* ======================================
                        Price
                    ====================================== */}

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


                    {/* ======================================
                        Rating
                    ====================================== */}

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


                    {/* ======================================
                        Clear Filters
                    ====================================== */}

                    {(categoryId ||
                        brandId ||
                        minPrice ||
                        maxPrice ||
                        rating ||
                        search) && (

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


                {/* ==========================================
                    Error: Categories / Brands
                ========================================== */}

                {(categoriesError || brandsError) && (
                    <p className="text-sm text-red-500 mb-4">
                        Failed to load categories or brands.
                    </p>
                )}


                {/* ==========================================
                    Products
                ========================================== */}

                <section
                    className="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        md:grid-cols-3
                        lg:grid-cols-5
                        gap-4
                    "
                >

                    {/* Loading */}

                    {productsLoading && (
                        <p
                            className="
                                col-span-full
                                text-center
                                py-10
                            "
                        >
                            Loading products...
                        </p>
                    )}


                    {/* Error */}

                    {productsError && (
                        <p
                            className="
                                col-span-full
                                text-center
                                py-10
                                text-red-500
                            "
                        >
                            Failed to load products.
                        </p>
                    )}


                    {/* Empty */}

                    {!productsLoading &&
                        !productsError &&
                        products.length === 0 && (

                            <p
                                className="
                                    col-span-full
                                    text-center
                                    py-10
                                    text-muted
                                "
                            >
                                No products found.
                            </p>
                        )
                    }


                    {/* Products */}

                    {!productsLoading &&
                        !productsError &&
                        products.map((product) => (
                            <ProductCard
                                product={product}
                                key={product.id}
                            />
                        ))
                    }

                </section>

            </section>

        </main>
    );
}

export default Explore;
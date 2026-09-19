import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";

import getCurrentUser from "../hooks/CurrentUser";

function Navbar() {
    const navigate = useNavigate();

    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const [showCategories, setShowCategories] = useState(false);
    const [showBrands, setShowBrands] = useState(false);

    useEffect(() => {
        if (showCategories) {
            setShowBrands(false);
        }
    }, [showCategories]);

    useEffect(() => {
        if (showBrands) {
            setShowCategories(false);
        }
    }, [showBrands]);

    const {
        data: currentUser,
    } = useQuery({
        queryKey: ["user"],
        queryFn: getCurrentUser,
        enabled: !!localStorage.getItem("access_token"),
    });

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

    const {
        data: categories = [],
        isLoading: categoriesLoading,
    } = useQuery({
        queryKey: ["categories"],
        queryFn: getCategories,
        staleTime: 5 * 60 * 1000,
    });

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

    const {
        data: brands = [],
        isLoading: brandsLoading,
    } = useQuery({
        queryKey: ["brands"],
        queryFn: getBrands,
        staleTime: 5 * 60 * 1000,
    });


    const getCart = async () => {
        const response = await fetch(
            `${BASE_URL}/cart`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        )

        const data = await response.json()

        if (!response.ok) throw new Error("Failed too Retrive Cart")

        return data
    }


    const {
        data: cart,
        isLoading: isLoadingCart,
        isError: isErrorCart,
        error: cartError,
    } = useQuery({
        queryKey: ["cart"],
        queryFn: getCart,
        enabled: !!localStorage.getItem("access_token"),
    });

    const cartItems = cart?.items ?? [];

    const totalCartItems = cartItems.length;



    const handleCategoryClick = (categoryId) => {
        setShowCategories(false);

        navigate(
            `/products?category_id=${categoryId}`
        );
    };

    const handleBrandClick = (brandId) => {
        setShowBrands(false);

        navigate(
            `/products?brand_id=${brandId}`
        );
    };

    return (
        <nav
            className="
                relative
                z-50
                w-full
                bg-card/70
                backdrop-blur-xl
                shadow-product
                border-b
                border-border-soft
                text-foreground
                px-6
                py-3
                font-sans
            "
        >
            <div className="flex items-center justify-between gap-6">

                <Link
                    to="/"
                    className="
                        shrink-0
                        text-xl
                        font-semibold
                        tracking-tight
                        text-foreground
                        hover:opacity-70
                        duration-300
                    "
                >
                    ByteStore
                </Link>

                <ul
                    className="
                        hidden
                        lg:flex
                        items-center
                        gap-8
                        text-muted
                    "
                >
                    <li className="hover:text-foreground duration-300">
                        <Link to="/products">
                            Store
                        </Link>
                    </li>

                    <li
                        className="relative"
                        onMouseEnter={() => setShowCategories(true)}
                        onMouseLeave={() => setShowCategories(false)}
                    >
                        <button
                            type="button"
                            className="
                                flex
                                items-center
                                gap-1
                                hover:text-foreground
                                duration-300
                                cursor-pointer
                            "
                        >
                            Categories

                            <svg
                                className={`
                                    w-4
                                    h-4
                                    duration-200
                                    ${showCategories
                                        ? "rotate-180"
                                        : ""
                                    }
                                `}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m6 9 6 6 6-6"
                                />
                            </svg>
                        </button>

                        {showCategories && (
                            <div
                                className="
                                    absolute
                                    top-full
                                    left-1/2
                                    -translate-x-1/2
                                    pt-4
                                    w-56
                                "
                            >
                                <div
                                    className="
                                        rounded-2xl
                                        border
                                        border-border
                                        bg-card/95
                                        backdrop-blur-xl
                                        shadow-product
                                        p-2
                                    "
                                >
                                    {categoriesLoading ? (
                                        <div
                                            className="
                                                px-4
                                                py-3
                                                text-sm
                                                text-muted
                                            "
                                        >
                                            Loading categories...
                                        </div>
                                    ) : categories.length > 0 ? (
                                        categories
                                            .slice(0, 8)
                                            .map((category) => (
                                                <button
                                                    key={category.id}
                                                    type="button"
                                                    onClick={() =>
                                                        handleCategoryClick(
                                                            category.id
                                                        )
                                                    }
                                                    className="
                                                        w-full
                                                        text-left
                                                        px-4
                                                        py-2.5
                                                        rounded-xl
                                                        text-muted
                                                        hover:text-foreground
                                                        hover:bg-foreground/5
                                                        duration-200
                                                        cursor-pointer
                                                    "
                                                >
                                                    {category.name}
                                                </button>
                                            ))
                                    ) : (
                                        <div
                                            className="
                                                px-4
                                                py-3
                                                text-sm
                                                text-muted
                                            "
                                        >
                                            No categories available
                                        </div>
                                    )}

                                    <div
                                        className="
                                            border-t
                                            border-border
                                            my-2
                                        "
                                    />

                                    <Link
                                        to="/products"
                                        onClick={() =>
                                            setShowCategories(false)
                                        }
                                        className="
                                            block
                                            px-4
                                            py-2.5
                                            rounded-xl
                                            text-foreground
                                            font-semibold
                                            hover:bg-foreground/5
                                            duration-200
                                        "
                                    >
                                        View all categories
                                    </Link>
                                </div>
                            </div>
                        )}
                    </li>

                    <li
                        className="relative"
                        onMouseEnter={() => setShowBrands(true)}
                        onMouseLeave={() => setShowBrands(false)}
                    >
                        <button
                            type="button"
                            className="
                                flex
                                items-center
                                gap-1
                                hover:text-foreground
                                duration-300
                                cursor-pointer
                            "
                        >
                            Brands

                            <svg
                                className={`
                                    w-4
                                    h-4
                                    duration-200
                                    ${showBrands
                                        ? "rotate-180"
                                        : ""
                                    }
                                `}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m6 9 6 6 6-6"
                                />
                            </svg>
                        </button>

                        {showBrands && (
                            <div
                                className="
                                    absolute
                                    top-full
                                    left-1/2
                                    -translate-x-1/2
                                    pt-4
                                    w-48
                                "
                            >
                                <div
                                    className="
                                        rounded-2xl
                                        border
                                        border-border
                                        bg-card/95
                                        backdrop-blur-xl
                                        shadow-product
                                        p-2
                                    "
                                >
                                    {brandsLoading ? (
                                        <div
                                            className="
                                                px-4
                                                py-3
                                                text-sm
                                                text-muted
                                            "
                                        >
                                            Loading brands...
                                        </div>
                                    ) : brands.length > 0 ? (
                                        brands
                                            .slice(0, 8)
                                            .map((brand) => (
                                                <button
                                                    key={brand.id}
                                                    type="button"
                                                    onClick={() =>
                                                        handleBrandClick(
                                                            brand.id
                                                        )
                                                    }
                                                    className="
                                                        w-full
                                                        text-left
                                                        px-4
                                                        py-2.5
                                                        rounded-xl
                                                        text-muted
                                                        hover:text-foreground
                                                        hover:bg-foreground/5
                                                        duration-200
                                                        cursor-pointer
                                                    "
                                                >
                                                    {brand.name}
                                                </button>
                                            ))
                                    ) : (
                                        <div
                                            className="
                                                px-4
                                                py-3
                                                text-sm
                                                text-muted
                                            "
                                        >
                                            No brands available
                                        </div>
                                    )}

                                    <div
                                        className="
                                            border-t
                                            border-border
                                            my-2
                                        "
                                    />

                                    <Link
                                        to="/products"
                                        onClick={() =>
                                            setShowBrands(false)
                                        }
                                        className="
                                            block
                                            px-4
                                            py-2.5
                                            rounded-xl
                                            text-foreground
                                            font-semibold
                                            hover:bg-foreground/5
                                            duration-200
                                        "
                                    >
                                        View all brands
                                    </Link>
                                </div>
                            </div>
                        )}
                    </li>

                    <li className="hover:text-foreground duration-300">
                        <Link to="/products?promotion=true">
                            Promotions
                        </Link>
                    </li>
                </ul>

                <div className="flex items-center gap-2">

                    <Link
                        to="/cart"
                        className="
        relative
        bg-background-secondary
        p-2
        rounded-full
        border
        border-border-soft
        hover:border-border
        hover:bg-foreground/5
        transition-colors
        duration-300
    "
                        aria-label={`Shopping cart${totalCartItems > 0 ? `, ${totalCartItems} items` : ""}`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-5 h-5"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974a1.125 1.125 0 0 1 1.119 1.007Z"
                            />
                        </svg>

                        {totalCartItems > 0 && (
                            <span
                                className="
                                    absolute
                                    -top-2
                                    -right-2
                                    min-w-5
                                    h-5
                                    px-1
                                    flex
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-primary
                                    text-white
                                    text-[11px]
                                    font-semibold
                                    leading-none
                                    border-2
                                    border-background
                                "
                            >
                                {totalCartItems > 99 ? "99+" : totalCartItems}
                            </span>
                        )}
                    </Link>

                    {currentUser ? (
                        <Link
                            to="/profile"
                            className="
                                bg-background-secondary
                                w-10
                                h-10
                                rounded-full
                                border
                                border-border-soft
                                hover:border-border
                                hover:bg-foreground/5
                                duration-300
                            "
                            aria-label="Account"
                        >
                            <div
                                className="
                                    h-full
                                    w-full
                                    rounded-full
                                    overflow-hidden
                                "
                            >
                                <img
                                    src={
                                        currentUser?.profile_pic_path
                                    }
                                    alt="Profile"
                                    className="
                                        w-full
                                        h-full
                                        object-cover
                                    "
                                />
                            </div>
                        </Link>
                    ) : (
                        <Link
                            to="/login"
                            className="
                                bg-background-secondary
                                p-2
                                rounded-full
                                border
                                border-border-soft
                                hover:border-border
                                hover:bg-foreground/5
                                duration-300
                            "
                            aria-label="Account"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="w-5 h-5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0A3.75 3.75 0 0 1 15.75 6ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                                />
                            </svg>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import getCurrentUser from "../hooks/CurrentUser";
import { useQuery } from "@tanstack/react-query";

function Navbar() {
    const navigate = useNavigate();

    const [toggleSearch, setToggleSearch] = useState(false);
    const [search, setSearch] = useState("");
    const [showCategories, setShowCategories] = useState(false);


    const searchRef = useRef(null);

    useEffect(() => {
        if (toggleSearch) {
            searchRef.current?.focus();
        }
    }, [toggleSearch]);

    const handleSearch = (e) => {
        e.preventDefault();

        const value = search.trim();

        if (!value) {
            return;
        }

        navigate(`/products?search=${encodeURIComponent(value)}`);
        setToggleSearch(false);
    };

    const {
        data: currentUser,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["user"],
        queryFn: getCurrentUser,
        enabled: !!localStorage.getItem("access_token"),
    });

    const categories = [
        {
            name: "Laptops",
            value: "Laptops",
        },
        {
            name: "Smartphones",
            value: "Smartphones",
        },
        {
            name: "Tablets",
            value: "Tablets",
        },
        {
            name: "Monitors",
            value: "Monitors",
        },
        {
            name: "Keyboards",
            value: "Keyboards",
        },
        {
            name: "Mice",
            value: "Mice",
        },
        {
            name: "Headphones",
            value: "Headphones",
        },
    ];

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


                <ul className="hidden lg:flex items-center gap-8 text-muted">

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
                                className={`w-4 h-4 duration-200 ${showCategories
                                    ? "rotate-180"
                                    : ""
                                    }`}
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
                                    {categories.map((category) => (
                                        <button
                                            key={category.value}
                                            type="button"
                                            onClick={() =>
                                                navigate(
                                                    `/products?category=${encodeURIComponent(
                                                        category.value
                                                    )}`
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
                                    ))}

                                    <div className="border-t border-border my-2" />

                                    <Link
                                        to="/products"
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
                                        View all products
                                    </Link>
                                </div>
                            </div>
                        )}
                    </li>

                    <li className="hover:text-foreground duration-300">
                        <Link to="/products?sort=deals">
                            Deals
                        </Link>
                    </li>

                    <li className="hover:text-foreground duration-300">
                        <Link to="/products?sort=newest">
                            New Arrivals
                        </Link>
                    </li>

                    <li className="hover:text-foreground duration-300">
                        <Link to="/support">
                            Support
                        </Link>
                    </li>
                </ul>


                <div className="flex items-center gap-2">


                    <div className="flex items-center">

                        {toggleSearch ? (
                            <form
                                onSubmit={handleSearch}
                                className="
                                    flex
                                    items-center
                                    bg-background-secondary
                                    rounded-full
                                    border
                                    border-border-soft
                                    focus-within:border-border
                                    overflow-hidden
                                    duration-300
                                "
                            >
                                <svg
                                    className="w-5 h-5 ml-3 text-muted shrink-0"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                                    />
                                </svg>

                                <input
                                    ref={searchRef}
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                    placeholder="Search products..."
                                    className="
                                        w-40
                                        xl:w-56
                                        px-3
                                        py-2
                                        bg-transparent
                                        outline-none
                                        text-sm
                                        text-foreground
                                        placeholder:text-muted
                                    "
                                />

                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch("");
                                        setToggleSearch(false);
                                    }}
                                    className="
                                        mr-2
                                        text-muted
                                        hover:text-foreground
                                        duration-200
                                        cursor-pointer
                                    "
                                    aria-label="Close search"
                                >
                                    <svg
                                        className="w-5 h-5"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            d="M6 6l12 12M18 6 6 18"
                                        />
                                    </svg>
                                </button>
                            </form>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setToggleSearch(true)}
                                className="
                                    bg-background-secondary
                                    p-2
                                    rounded-full
                                    border
                                    border-border-soft
                                    hover:border-border
                                    hover:bg-foreground/5
                                    duration-300
                                    cursor-pointer
                                "
                                aria-label="Search products"
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
                                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>

                    <Link
                        to="/cart"
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
                        aria-label="Shopping cart"
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
                                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974a1.125 1.125 0 0 1 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1-.75 0Z"
                            />
                        </svg>
                    </Link>


                    {currentUser ? (
                        <Link
                            to="/profile"
                            className="
                                bg-background-secondary
                                w-10 h-10
                                rounded-full
                                border
                                border-border-soft
                                hover:border-border
                                hover:bg-foreground/5
                                duration-300
                            "
                            aria-label="Account"
                        >
                            <div className="h-full w-full rounded-full overflow-hidden">
                                <img
                                    src={currentUser?.profile_pic_path}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
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
                                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
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

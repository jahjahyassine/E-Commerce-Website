import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import {
    Phone,
    Mail,
    MapPin,
} from "lucide-react";

function Footer() {
    const BASE_URL =
        import.meta.env.VITE_BASE_URL || "http://localhost:8000";

    const navigate = useNavigate();

    const fetchCategories = async () => {
        const response = await fetch(`${BASE_URL}/categories`, {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error("Failed to retrieve categories");
        }

        return await response.json();
    };

    const fetchBrands = async () => {
        const response = await fetch(`${BASE_URL}/brands`, {
            method: "GET",
        });

        if (!response.ok) {
            throw new Error("Failed to retrieve brands");
        }

        return await response.json();
    };

    const { data: categories = [] } = useQuery({
        queryKey: ["categories"],
        queryFn: fetchCategories,
    });

    const { data: brands = [] } = useQuery({
        queryKey: ["brands"],
        queryFn: fetchBrands,
    });

    const activeCategories = categories
        .filter((category) => category.is_active !== false)
        .slice(0, 10);

    const activeBrands = brands
        .filter((brand) => brand.is_active !== false)
        .slice(0, 10);

    const columns = [
        {
            title: "Shop & Brands",
            links: [
                ...activeBrands.map((brand) => ({
                    label: brand.name,
                    action: () =>
                        navigate(`/products?brand_id=${brand.id}`),
                })),
                {
                    label: "All Brands",
                    action: () => navigate("/products"),
                },
            ],
        },

        {
            title: "Categories",
            links: activeCategories.map((category) => ({
                label: category.name,
                action: () =>
                    navigate(`/products?category_id=${category.id}`),
            })),
        },

        {
            title: "Account",
            links: [
                {
                    label: "My Account",
                    action: () => navigate("/profile"),
                },
                {
                    label: "Orders",
                    action: () => navigate("/profile/orders"),
                },
                {
                    label: "Cart",
                    action: () => navigate("/cart"),
                },
            ],
        },
    ];

    return (
        <footer className="w-full bg-background-dark text-inverse px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="text-center mb-10">
                    <p className="text-3xl sm:text-4xl lg:text-5xl font-cormorant font-bold">
                        Technology, chosen smarter.
                    </p>

                    <p className="mt-4 max-w-3xl mx-auto text-inverse/70 text-base sm:text-lg">
                        Discover premium technology from the world's leading
                        brands, get personalized recommendations, and find the
                        perfect products for your needs.
                    </p>
                </div>

                {/* Divider */}
                <div className="border-t border-inverse/15 mb-10" />

                {/* Columns */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 lg:gap-12">

                    {/* Shop / Categories / Account */}
                    {columns.map((column) => (
                        <div key={column.title}>
                            <h3 className="text-inverse text-base sm:text-lg font-semibold mb-4">
                                {column.title}
                            </h3>

                            <ul className="space-y-3">
                                {column.links.map((link) => (
                                    <li key={link.label}>
                                        <button
                                            type="button"
                                            onClick={link.action}
                                            className="
                                                text-inverse/65
                                                hover:text-inverse
                                                text-md
                                                sm:text-base
                                                transition-colors
                                                duration-200
                                                text-left
                                            "
                                        >
                                            {link.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Contact */}
                    <div>
                        <h3 className="text-inverse text-base sm:text-lg font-semibold mb-4">
                            Contact Us
                        </h3>

                        <div className="space-y-4">

                            {/* Phone */}
                            <a
                                href="tel:+212600000000"
                                className="flex items-start gap-3 text-inverse/65 hover:text-inverse transition-colors"
                            >
                                <Phone
                                    size={19}
                                    className="mt-0.5 shrink-0"
                                />

                                <div>
                                    <p className="text-xs text-inverse/40 mb-0.5">
                                        Phone
                                    </p>

                                    <p className="text-sm sm:text-base">
                                        +212 6 00 00 00 00
                                    </p>
                                </div>
                            </a>

                            {/* Email */}
                            <a
                                href="mailto:contact@bytestore.ma"
                                className="flex items-start gap-3 text-inverse/65 hover:text-inverse transition-colors"
                            >
                                <Mail
                                    size={19}
                                    className="mt-0.5 shrink-0"
                                />

                                <div>
                                    <p className="text-xs text-inverse/40 mb-0.5">
                                        Email
                                    </p>

                                    <p className="text-sm sm:text-base">
                                        contact@bytestore.ma
                                    </p>
                                </div>
                            </a>

                            {/* Address */}
                            <div className="flex items-start gap-3 text-inverse/65">
                                <MapPin
                                    size={19}
                                    className="mt-0.5 shrink-0"
                                />

                                <div>
                                    <p className="text-xs text-inverse/40 mb-0.5">
                                        Address
                                    </p>

                                    <p className="text-sm sm:text-base">
                                        Casablanca, Morocco
                                    </p>
                                </div>
                            </div>

                            {/* Social */}
                            <div className="pt-2">
                                <p className="text-xs text-inverse/40 mb-3">
                                    Follow us
                                </p>

                                <div className="flex items-center gap-3">

                                    {/* Instagram */}
                                    <a
                                        href="#"
                                        aria-label="Instagram"
                                        className="
                                            w-10 h-10
                                            rounded-full
                                            border border-inverse/15
                                            flex items-center justify-center
                                            text-inverse/60
                                            hover:text-inverse
                                            hover:border-inverse/40
                                            transition-all
                                        "
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            className="w-[18px] h-[18px]"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                        >
                                            <rect
                                                x="3"
                                                y="3"
                                                width="18"
                                                height="18"
                                                rx="5"
                                            />
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="4"
                                            />
                                            <circle
                                                cx="17.5"
                                                cy="6.5"
                                                r="1"
                                                fill="currentColor"
                                                stroke="none"
                                            />
                                        </svg>
                                    </a>

                                    {/* Facebook */}
                                    <a
                                        href="#"
                                        aria-label="Facebook"
                                        className="
                                            w-10 h-10
                                            rounded-full
                                            border border-inverse/15
                                            flex items-center justify-center
                                            text-inverse/60
                                            hover:text-inverse
                                            hover:border-inverse/40
                                            transition-all
                                        "
                                    >
                                        <svg
                                            viewBox="0 0 24 24"
                                            className="w-[18px] h-[18px]"
                                            fill="currentColor"
                                        >
                                            <path d="M14 8h3V4h-3c-2.76 0-5 2.24-5 5v3H6v4h3v4h4v-4h3l1-4h-4V9c0-.55.45-1 1-1z" />
                                        </svg>
                                    </a>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-12 pt-6 border-t border-inverse/15 flex flex-col sm:flex-row justify-between gap-3 text-sm text-inverse/50">
                    <p>
                        © {new Date().getFullYear()} ByteStore. All rights
                        reserved.
                    </p>

                    <p>
                        Designed for a smarter shopping experience.
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
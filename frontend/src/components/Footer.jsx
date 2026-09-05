import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

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

    const activeCategories = categories.filter(
        (category) => category.is_active !== false
    );

    const activeBrands = brands.filter(
        (brand) => brand.is_active !== false
    );

    const columns = [
        {
            title: "Shop & Brands",
            links: [
                ...activeBrands.map((brand) => ({
                    label: brand.name,
                    action: () => navigate(`/products?brand_id=${brand.id}`),
                })),
                {
                    label: "All Brands",
                    action: () => navigate("/products"),
                },
            ],
        },
        {
            title: "Categories",
            links: [
                ...activeCategories.map((category) => ({
                    label: category.name,
                    action: () =>
                        navigate(`/products?category_id=${category.id}`),
                })),
            ],
        },
        {
            title: "AI Assistant",
            links: [
                {
                    label: "Ask AI",
                    action: () => navigate("/assistant"),
                },
                {
                    label: "Product Recommendations",
                    action: () => navigate("/assistant"),
                },
            ],
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
                    {columns.map((column) => (
                        <div key={column.title}>
                            <h3 className="text-inverse text-base font-semibold mb-3">
                                {column.title}
                            </h3>

                            <ul className="space-y-2">
                                {column.links.map((link) => (
                                    <li key={link.label}>
                                        <button
                                            type="button"
                                            onClick={link.action}
                                            className="text-inverse/65 hover:text-inverse text-sm transition-colors duration-200 text-left"
                                        >
                                            {link.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom */}
                <div className="mt-12 pt-6 border-t border-inverse/15 flex flex-col sm:flex-row justify-between gap-3 text-sm text-inverse/50">
                    <p>
                        © {new Date().getFullYear()} ByteStore. All rights
                        reserved.
                    </p>

                    <p>Designed for a smarter shopping experience.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
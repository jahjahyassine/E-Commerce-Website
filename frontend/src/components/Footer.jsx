function Footer() {
    const columns = [
        {
            title: "Shop & Brands",
            links: ["Apple", "Samsung", "ASUS", "Dell", "Lenovo", "All Brands"],
        },
        {
            title: "Categories",
            links: ["Laptops", "Smartphones", "Gaming", "Audio", "Accessories", "Components"],
        },
        {
            title: "AI Assistant",
            links: ["Ask AI", "Product Recommendations"],
        },
        {
            title: "Support",
            links: ["Contact Us", "Shipping & Returns", "FAQ"],
        },
        {
            title: "Account",
            links: ["My Account", "Orders", "Wishlist"],
        },
    ];

    return (
        <footer className="w-full bg-background-dark text-inverse px-4 sm:px-6 lg:px-10 py-12 sm:py-16">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <p className="text-3xl sm:text-4xl lg:text-5xl font-cormorant font-bold">
                        Technology, chosen smarter.
                    </p>
                    <p className="mt-4 max-w-3xl mx-auto text-inverse/70 text-base sm:text-lg">
                        Discover premium technology from the world&apos;s leading brands,
                        get personalized recommendations, and find the perfect products
                        for your needs.
                    </p>
                </div>

                <div className="border-t border-inverse/15 mb-10" />

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
                    {columns.map((column) => (
                        <div key={column.title}>
                            <h3 className="text-inverse text-base font-semibold mb-3">
                                {column.title}
                            </h3>
                            <ul className="space-y-2">
                                {column.links.map((link) => (
                                    <li key={link}>
                                        <a
                                            href="#hero"
                                            className="text-inverse/65 hover:text-inverse text-sm transition-colors duration-200"
                                        >
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-12 pt-6 border-t border-inverse/15 flex flex-col sm:flex-row justify-between gap-3 text-sm text-inverse/50">
                    <p>© {new Date().getFullYear()} ByteStore. All rights reserved.</p>
                    <p>Designed for a smarter shopping experience.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;

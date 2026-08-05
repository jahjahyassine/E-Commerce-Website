import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const NAV_LINKS = [
    { label: "Store", href: "#hero" },
    { label: "Categories", href: "#categories" },
    { label: "Best Sellers", href: "#bestsellers" },
    { label: "Brands", href: "#brands" },
    { label: "AI Assistant", href: "#assistant" },
];

const CATEGORY_GROUPS = [
    {
        title: "Computers",
        items: ["Laptops", "Desktop PCs", "Monitors"],
    },
    {
        title: "Mobile",
        items: ["Smartphones", "Tablets", "Smartwatches"],
    },
    {
        title: "Audio",
        items: ["Headphones", "Earbuds", "Speakers"],
    },
    {
        title: "Gaming",
        items: ["Gaming Laptops", "Consoles", "Accessories"],
    },
];

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [categoriesOpen, setCategoriesOpen] = useState(false);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [menuOpen]);

    return (
        <nav
            className="
                bg-glass/90 backdrop-blur-md border-b border-border-soft/60
                text-foreground font-sans font-medium
            "
            aria-label="Primary"
        >
            <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3">
                <Link
                    to="/"
                    className="text-xl font-semibold tracking-tight text-foreground shrink-0"
                >
                    ByteStore
                </Link>

                <ul className="hidden lg:flex items-center gap-7 text-[15px] text-muted">
                    {NAV_LINKS.map((link) =>
                        link.label === "Categories" ? (
                            <li
                                key={link.label}
                                className="relative group"
                                onMouseEnter={() => setCategoriesOpen(true)}
                                onMouseLeave={() => setCategoriesOpen(false)}
                            >
                                <a
                                    href={link.href}
                                    className="hover:text-foreground transition-colors duration-200"
                                    aria-expanded={categoriesOpen}
                                    aria-haspopup="true"
                                >
                                    {link.label}
                                </a>
                                <div
                                    className={`
                                        absolute top-full left-0 pt-3
                                        transition-all duration-200
                                        ${categoriesOpen
                                            ? "opacity-100 visible translate-y-0"
                                            : "opacity-0 invisible translate-y-1"}
                                    `}
                                >
                                    <div className="w-64 rounded-md bg-card border border-border-soft shadow-elevated p-5">
                                        <ul className="space-y-4 text-sm">
                                            {CATEGORY_GROUPS.map((group) => (
                                                <li key={group.title}>
                                                    <p className="font-semibold text-foreground">
                                                        {group.title}
                                                    </p>
                                                    <ul className="mt-2 space-y-1.5 pl-3">
                                                        {group.items.map((item) => (
                                                            <li key={item}>
                                                                <a
                                                                    href="#categories"
                                                                    className="text-muted hover:text-foreground transition-colors"
                                                                >
                                                                    {item}
                                                                </a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </li>
                        ) : (
                            <li key={link.label}>
                                <a
                                    href={link.href}
                                    className="hover:text-foreground transition-colors duration-200"
                                >
                                    {link.label}
                                </a>
                            </li>
                        )
                    )}
                </ul>

                <div className="flex items-center gap-2 sm:gap-3">
                    {searchOpen ? (
                        <input
                            autoFocus
                            type="search"
                            placeholder="Search products"
                            aria-label="Search products"
                            className="
                                w-36 sm:w-48 px-3 py-1.5 text-sm
                                bg-background-secondary rounded-sm
                                border border-border-soft
                                focus:outline-none focus:border-border
                                transition-colors
                            "
                            onBlur={() => setSearchOpen(false)}
                        />
                    ) : (
                        <button
                            type="button"
                            aria-label="Open search"
                            onClick={() => setSearchOpen(true)}
                            className="
                                p-2 rounded-full bg-background-secondary
                                border border-border-soft hover:border-border
                                transition-colors
                            "
                        >
                            <SearchIcon />
                        </button>
                    )}

                    <button
                        type="button"
                        aria-label="Shopping bag"
                        className="
                            hidden sm:inline-flex p-2 rounded-full bg-background-secondary
                            border border-border-soft hover:border-border transition-colors
                        "
                    >
                        <BagIcon />
                    </button>

                    <button
                        type="button"
                        aria-label="Account"
                        className="
                            hidden sm:inline-flex p-2 rounded-full bg-background-secondary
                            border border-border-soft hover:border-border transition-colors
                        "
                    >
                        <UserIcon />
                    </button>

                    <button
                        type="button"
                        className="lg:hidden p-2 rounded-full border border-border-soft"
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen((open) => !open)}
                    >
                        {menuOpen ? <CloseIcon /> : <MenuIcon />}
                    </button>
                </div>
            </div>

            {menuOpen && (
                <div className="lg:hidden border-t border-border-soft bg-card/95 backdrop-blur-md">
                    <ul className="flex flex-col px-4 py-4 gap-1 text-base">
                        {NAV_LINKS.map((link) => (
                            <li key={link.label}>
                                <a
                                    href={link.href}
                                    className="block py-3 text-muted hover:text-foreground transition-colors"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </nav>
    );
}

function SearchIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
    );
}

function BagIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
    );
}

function UserIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
    );
}

function MenuIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
    );
}

export default Navbar;

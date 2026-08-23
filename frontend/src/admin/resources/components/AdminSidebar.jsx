import { NavLink, Link } from "react-router-dom";
import { useState } from "react";
import {
    LayoutDashboard,
    Package,
    Tags,
    BriefcaseBusiness,
    Warehouse,
    ShoppingCart,
    Users,
    Star,
    BadgePercent,
    BarChart3,
    Truck,
    History,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import getCurrentUser from "../../../hooks/CurrentUser";
import { useQuery } from "@tanstack/react-query";

function AdminSidebar() {
    const [toggle, setToggle] = useState(
        sessionStorage.getItem("toggle") === "true"
    );

    const handleToggle = () => {
        setToggle((prev) => {
            const newValue = !prev;
            sessionStorage.setItem("toggle", String(newValue));
            return newValue;
        });
    };

    const {
        data: user,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["user"],
        queryFn: getCurrentUser,
        enabled: !!localStorage.getItem("access_token"),
    });

    const menuSections = [
        {
            title: "MAIN",
            items: [
                {
                    label: "Dashboard",
                    to: "/admin/dashboard",
                    icon: LayoutDashboard,
                },
            ],
        },

        {
            title: "CATALOG",
            items: [
                {
                    label: "Products",
                    to: "/admin/products",
                    icon: Package,
                },
                {
                    label: "Categories",
                    to: "/admin/categories",
                    icon: Tags,
                },
                {
                    label: "Brands",
                    to: "/admin/brands",
                    icon: BriefcaseBusiness,
                },
                {
                    label: "Inventory",
                    to: "/admin/inventory",
                    icon: Warehouse,
                },
            ],
        },

        {
            title: "SALES",
            items: [
                {
                    label: "Orders",
                    to: "/admin/orders",
                    icon: ShoppingCart,
                },
                {
                    label: "Customers",
                    to: "/admin/customers",
                    icon: Users,
                },
            ],
        },

        {
            title: "OPERATIONS",
            items: [
                {
                    label: "Suppliers",
                    to: "/admin/suppliers",
                    icon: Truck,
                },
                {
                    label: "Stock History",
                    to: "/admin/inventory/history",
                    icon: History,
                },
            ],
        },

        {
            title: "ENGAGEMENT",
            items: [
                {
                    label: "Reviews",
                    to: "/admin/reviews",
                    icon: Star,
                },
                {
                    label: "Discounts",
                    to: "/admin/discounts",
                    icon: BadgePercent,
                },
            ],
        },

        {
            title: "INSIGHTS",
            items: [
                {
                    label: "Analytics",
                    to: "/admin/analytics",
                    icon: BarChart3,
                },
            ],
        },
    ];

    return (
        <main
            className={`
                h-full
                bg-admin-surface
                py-4
                px-3
                text-admin-muted
                flex
                flex-col
                transition-all
                duration-300
                ease-in-out
                ${toggle
                    ? "w-[70px] lg:w-[80px]"
                    : "w-[70px] lg:w-[240px]"
                }
            `}
        >
            <div>
                <div
                    className={`
                        flex
                        mb-4
                        ${toggle
                            ? "justify-center"
                            : "justify-end"
                        }
                    `}
                >
                    <button
                        onClick={handleToggle}
                        className="
                            p-2
                            rounded-lg
                            hover:bg-admin-surface-hover
                            hover:text-admin-text
                            transition-all
                            duration-300
                            cursor-pointer
                        "
                    >
                        {toggle ? (
                            <ChevronRight className="w-5 h-5" />
                        ) : (
                            <ChevronLeft className="w-5 h-5" />
                        )}
                    </button>
                </div>

                <Link to="/admin"
                    className={`
                        flex
                        items-center
                        border-b
                        border-border
                        pb-4
                        transition-all
                        duration-300
                        ${toggle
                            ? "justify-center"
                            : "gap-4"
                        }
                    `}
                >
                    <div
                        className="
                            h-[40px]
                            w-[40px]
                            shrink-0
                            rounded-full
                            overflow-hidden
                        "
                    >
                        <img
                            src={user?.profile_pic_path}
                            alt="Profile"
                            className="h-full w-full object-cover"
                        />
                    </div>

                    <h2
                        className={`
                            text-lg
                            font-bold
                            overflow-hidden
                            whitespace-nowrap
                            transition-all
                            duration-300
                            ${toggle
                                ? "max-w-0 opacity-0"
                                : "max-w-[200px] opacity-100"
                            }
                        `}
                    >
                        {user?.full_name}
                    </h2>
                </Link>

                <nav className="mt-6 flex flex-col gap-5">
                    {menuSections.map((section) => (
                        <div key={section.title}>
                            <p
                                className={`
                                    font-semibold
                                    text-xs
                                    mb-2
                                    overflow-hidden
                                    whitespace-nowrap
                                    transition-all
                                    duration-300
                                    ${toggle
                                        ? "max-h-0 opacity-0 mb-0"
                                        : "max-h-10 opacity-100"
                                    }
                                `}
                            >
                                {section.title}
                            </p>

                            <div className="flex flex-col gap-1">
                                {section.items.map(
                                    ({ label, to, icon: Icon }) => (
                                        <NavLink
                                            key={label}
                                            to={to}
                                            end={to === "/admin/dashboard"}
                                            className={({ isActive }) => `
                                                flex
                                                items-center
                                                gap-3
                                                rounded-xl
                                                px-3
                                                py-2
                                                text-md
                                                font-bold
                                                transition-all
                                                duration-300
                                                ease-in-out
                                                hover:bg-admin-surface-hover
                                                hover:text-admin-text
                                                ${isActive
                                                    ? "bg-admin-surface-hover text-admin-text"
                                                    : ""
                                                }
                                                ${toggle
                                                    ? "justify-center"
                                                    : ""
                                                }
                                            `}
                                        >
                                            <Icon
                                                className="
                                                    w-6
                                                    h-6
                                                    shrink-0
                                                "
                                                strokeWidth={1.8}
                                            />

                                            <span
                                                className={`
                                                    overflow-hidden
                                                    whitespace-nowrap
                                                    transition-all
                                                    duration-300
                                                    ${toggle
                                                        ? "max-w-0 opacity-0"
                                                        : "max-w-[150px] opacity-100"
                                                    }
                                                `}
                                            >
                                                {label}
                                            </span>
                                        </NavLink>
                                    )
                                )}
                            </div>
                        </div>
                    ))}
                </nav>
            </div>
        </main>
    );
}

export default AdminSidebar;
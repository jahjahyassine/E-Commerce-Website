import { NavLink, useNavigate } from "react-router-dom";

import {
    CircleUserRound,
    Package,
    Star,
    MapPin,
    Shield,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ShoppingCart
} from "lucide-react";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

function ProfileSidebar({ user }) {

    const navigate = useNavigate()
    const queryClient = useQueryClient();

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

    const menuItems = [
        {
            label: "Profile",
            icon: CircleUserRound,
            to: "/profile",
        },
        {
            label: "Orders",
            icon: Package,
            to: "/profile/orders",
        },
        {
            label: "Cart",
            icon: ShoppingCart,
            to: "/profile/cart",
        },
        {
            label: "Reviews",
            icon: Star,
            to: "/profile/reviews",
        },
    ];

    const handleLogout = () => {
        localStorage.removeItem("access_token");

        queryClient.removeQueries({
            queryKey: ["user"],
        });

        navigate("/login")
    }

    // ==========================================
    // Shared classes
    // ==========================================

    // Sidebar link: muted by default, teal tint when active
    const itemClass = ({ isActive }) => `
        flex
        items-center
        gap-3
        rounded-xl
        px-2.5
        py-2
        transition-all
        duration-200
        cursor-pointer
        ${isActive
            ? "bg-accent/10 text-accent"
            : "text-muted hover:bg-card-hover hover:text-foreground"
        }
        ${toggle ? "justify-center" : ""}
    `;

    // Text next to an icon, collapses when the sidebar is closed
    const labelClass = `
        text-base
        tracking-wide
        overflow-hidden
        whitespace-nowrap
        transition-all
        duration-300
        ${toggle
            ? "max-w-0 opacity-0"
            : "max-w-[150px] opacity-100"
        }
    `;

    return (
        <main
            className={`
                h-full
                bg-card
                pt-20
                px-4
                text-foreground
                flex
                flex-col
                justify-between
                shadow-product
                transition-all
                duration-300
                ease-in-out
                ${toggle
                    ? "lg:w-[5vw] md:w-[10vw] sm:w-[10vw]"
                    : "lg:w-[17vw] md:w-[35vw] sm:w-[30vw]"
                }
            `}
        >
            {/* TOP */}
            <div
                className={`
                    flex flex-col
                    ${toggle ? "items-center" : ""}
                `}
            >
                {/* Toggle */}
                <div className="flex justify-end mb-4">
                    <button
                        onClick={handleToggle}
                        className="
                            cursor-pointer
                            rounded-lg
                            p-1
                            text-muted
                            hover:bg-card-hover
                            hover:text-foreground
                            transition-colors
                            duration-200
                        "
                    >
                        {toggle ? (
                            <ChevronRight className="w-5 h-5" />
                        ) : (
                            <ChevronLeft className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {/* Profile */}
                <div
                    className={`
                        flex
                        items-center
                        border-b
                        border-border
                        pb-5
                        ${toggle
                            ? "justify-center w-full"
                            : "gap-3"
                        }
                    `}
                >
                    <div className="h-[46px] w-[46px] shrink-0 rounded-full overflow-hidden bg-surface ring-2 ring-accent/30">
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
                            text-foreground
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
                </div>

                {/* Navigation */}
                <div className="mt-5 w-full">
                    <p
                        className={`
                            text-subtle
                            font-semibold
                            text-xs
                            uppercase
                            tracking-wider
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
                        Your account
                    </p>

                    <div className="flex flex-col gap-1">
                        {menuItems.map(({ label, icon: Icon, to }) => (
                            <NavLink
                                key={label}
                                to={to}
                                end={to === "/profile"}
                                className={itemClass}
                            >
                                <Icon
                                    className="w-7 h-7 shrink-0"
                                    strokeWidth={1.5}
                                />

                                <p className={labelClass}>
                                    {label}
                                </p>
                            </NavLink>
                        ))}
                    </div>
                </div>
            </div>

            {/* BOTTOM */}
            <div
                className={`
                    pb-2
                    border-t
                    border-border
                    pt-3
                    ${toggle ? "flex flex-col items-center w-full" : ""}
                `}
            >
                {/* Security */}
                <NavLink
                    key="security"
                    to="/profile/security"
                    className={itemClass}
                >
                    <Shield
                        className="w-7 h-7 shrink-0"
                        strokeWidth={1.5}
                    />

                    <p className={labelClass}>
                        Security
                    </p>
                </NavLink>

                {/* Logout (turns red on hover) */}
                <button
                    className={`
                        flex
                        w-full
                        gap-3
                        items-center
                        px-2.5
                        py-2
                        rounded-xl
                        text-muted
                        hover:bg-danger/10
                        hover:text-danger
                        transition-all
                        duration-200
                        cursor-pointer
                        ${toggle ? "justify-center" : ""}
                    `}
                    onClick={handleLogout}
                >
                    <LogOut
                        className="w-7 h-7 shrink-0"
                        strokeWidth={1.5}
                    />

                    <p className={labelClass}>
                        Logout
                    </p>
                </button>
            </div>
        </main>
    );
}

export default ProfileSidebar;
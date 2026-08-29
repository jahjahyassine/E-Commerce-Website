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
                shadow-[4px_0_18px_rgba(47,65,86,0.08)]
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
                            hover:bg-chip
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
                    <div className="h-[46px] w-[46px] shrink-0 rounded-full overflow-hidden">
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
                </div>

                {/* Navigation */}
                <div className="mt-5 w-full">
                    <p
                        className={`
                            text-muted
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
                                className={({ isActive }) => `
                                    flex
                                    items-center
                                    gap-3
                                    rounded-xl
                                    px-2.5
                                    py-2
                                    hover:bg-chip
                                    transition-all
                                    duration-200
                                    cursor-pointer
                                    ${isActive ? "bg-chip" : ""}
                                    ${toggle ? "justify-center" : ""}
                                `}
                            >
                                <Icon
                                    className="w-7 h-7 shrink-0"
                                    strokeWidth={1.5}
                                />

                                <p
                                    className={`
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
                                    `}
                                >
                                    {label}
                                </p>
                            </NavLink>
                        ))}
                    </div>
                </div>
            </div>

            <div
                className={`
                    pb-2
                    border-t
                    border-border
                    pt-3
                    ${toggle ? "flex flex-col items-center w-full" : ""}
                `}
            >
                {/* Shield */}
                <NavLink
                    key="security"
                    to="/profile/security"
                    className={({ isActive }) => `
                                flex
                                items-center
                                gap-3
                                rounded-xl
                                px-2.5
                                py-2
                                hover:bg-chip
                                transition-all
                                duration-200
                                cursor-pointer
                                ${isActive ? "bg-chip" : ""}
                                ${toggle ? "justify-center" : ""}
                            `}
                >
                    <Shield
                        className="w-7 h-7 shrink-0"
                        strokeWidth={1.5}
                    />

                    <p
                        className={`
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
                        `}
                    >
                        Security
                    </p>
            </NavLink>

            {/* Logout */}
            <button
                className={`
                        flex
                        w-full
                        gap-3
                        items-center
                        px-2.5
                        py-2
                        rounded-xl
                        hover:bg-chip
                        transition-all
                        duration-200
                        cursor-pointer
                        ${toggle ? "justify-center" : ""}
                    `}
                onClick={() => {
                    localStorage.removeItem("access_token")
                    navigate("/login")
                }}
            >
                <LogOut
                    className="w-7 h-7 shrink-0"
                    strokeWidth={1.5}
                />

                <p
                    className={`
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
                        `}
                >
                    Logout
                </p>
            </button>
        </div>
        </main >
    );
}

export default ProfileSidebar;

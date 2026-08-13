import { NavLink, useLocation } from "react-router-dom";
import {
    CircleUserRound,
    Package,
    Heart,
    Star,
    MapPin,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ShoppingCart
} from "lucide-react";
import { useState } from "react";

function ProfileSidebar({ user }) {
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
            to: "/cart"
        },
        {
            label: "Wishlist",
            icon: Heart,
            to: "/profile/wishlist",
        },
        {
            label: "Reviews",
            icon: Star,
            to: "/profile/reviews",
        },
        {
            label: "Addresses",
            icon: MapPin,
            to: "/profile/addresses",
        }
    ];

    return (
        <main
            className={`
                h-full
                bg-card
                pt-20
                px-6
                text-foreground
                flex
                flex-col
                justify-between
                transition-all
                duration-300
                ease-in-out
                
                ${toggle
                    ? "lg:w-[5vw] md:w-[10vw] sm:w-[10vw]"
                    : "lg:w-[17vw] md:w-[35vw] sm:w-[30vw]"
                }
            `}
        >
            <div className={`${toggle ? " items-center justify-center" : ""} flex flex-col`}>
                <div className="self-end">
                    <button onClick={handleToggle}
                        className="cursor-pointer"
                    >
                        {toggle ?
                            <ChevronRight className="w-5 h-5" />
                            :
                            <ChevronLeft className="w-5 h-5" />
                        }
                    </button>
                </div>
                <div
                    className={`
                        flex
                        items-center
                        border-b
                        border-border
                        pb-4
                        ${toggle ? "justify-center" : "gap-4"}
                    `}
                >
                    <div className="h-[50px] w-[50px] shrink-0 rounded-full overflow-hidden">
                        <img
                            src={user?.profile_pic_path}
                            alt="Profile"
                            className="h-full w-full object-cover"
                        />
                    </div>

                    <h2
                        className={`
                            text-xl
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

                <div className="mt-6">
                    <p
                        className={`
                            text-muted
                            font-bold
                            text-sm
                            mb-3
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
                                    gap-3
                                    items-center
                                    rounded-xl
                                    p-2
                                    hover:bg-chip
                                    duration-300
                                    ease-in-out
                                    cursor-pointer
                                    ${isActive ? "bg-chip" : ""}
                                    ${toggle ? "justify-center" : ""}
                                `}
                            >
                                <Icon
                                    className="w-8 h-8 shrink-0"
                                    strokeWidth={1.5}
                                />

                                <p
                                    className={`
                                        text-lg
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

            <div className=
                {`pb-2 border-t border-border pt-4 ${toggle ? "flex flex-col items-center" : ""}`}>

                <div
                    className={`
                        flex
                        gap-3
                        items-center
                        p-2
                        rounded-xl
                        hover:bg-chip
                        duration-300
                        ease-in-out
                        cursor-pointer
                        ${toggle ? "justify-center" : ""}
                    `}
                >
                    <Settings
                        className="w-7 h-7 shrink-0"
                        strokeWidth={1.5}
                    />

                    <p
                        className={`
                            text-lg
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
                        Settings
                    </p>
                </div>

                <div
                    className={`
                        flex
                        gap-3
                        items-center
                        p-2
                        rounded-xl
                        hover:bg-chip
                        duration-300
                        ease-in-out
                        cursor-pointer
                        ${toggle ? "justify-center" : ""}
                    `}
                >
                    <LogOut
                        className="w-7 h-7 shrink-0"
                        strokeWidth={1.5}
                    />

                    <p
                        className={`
                            text-lg
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
                </div>
            </div>
        </main >
    );
}

export default ProfileSidebar;
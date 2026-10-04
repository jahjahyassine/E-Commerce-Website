import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "../../components/Navbar";
import ProfileSidebar from "../../components/ProfileSidebar";
import DotField from "../../components/animation/DotField";
import getCurrentUser from "../../hooks/CurrentUser";
import { useEffect } from "react";

function OrdersHistory() {
    const BASE_URL = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem("access_token");
    const navigate = useNavigate();

    const {
        data: currentUser,
        isLoading: userLoading,
        isError: userError,
    } = useQuery({
        queryKey: ["user"],
        queryFn: getCurrentUser,
        enabled: !!token,
    });

    useEffect(() => {
        if (!token || userError) {
            navigate("/login");
        }
    }, [token, userError, navigate]);

    const fetchOrders = async () => {
        const response = await fetch(`${BASE_URL}/orders`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to retrieve Orders!"
            );
        }

        return data;
    };

    const {
        data: orders = [],
        isLoading: ordersLoading,
        isError: ordersError,
    } = useQuery({
        queryKey: ["orders"],
        queryFn: fetchOrders,
        enabled: !!token,
    });

    // Compares the variant's current price to what was actually paid on the
    // order line. Since OrderItem only stores the final (already-discounted)
    // price, this reflects the variant's current discount, not necessarily
    // the one applied at the time of purchase.
    const getOriginalItemPrice = (item) =>
        Number(item.product_variant?.price ?? item.price ?? 0);

    const getPaidItemPrice = (item) => Number(item.price ?? 0);

    const shippingStatusStyles = {
        NOT_SHIPPED:
            "text-warning bg-warning/10 border-warning/40",

        SHIPPED:
            "text-accent bg-accent/10 border-accent/40",

        DELIVERED:
            "text-success bg-success/10 border-success/40",
    };

    if (userLoading || ordersLoading) {
        return (
            <main className="min-h-screen w-full flex items-center justify-center font-sans bg-background">
                <p className="text-muted text-lg">
                    Loading your Orders...
                </p>
            </main>
        );
    }

    if (ordersError) {
        return (
            <main className="min-h-screen w-full flex items-center justify-center font-sans bg-background">
                <div className="text-center">
                    <p className="text-danger text-lg mb-4">
                        Failed to load your orders.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            window.location.reload()
                        }
                        className="
                            px-5 py-2
                            rounded-xl
                            bg-accent
                            text-inverse
                            font-semibold
                            cursor-pointer
                            hover:bg-accent-hover
                            transition-colors
                        "
                    >
                        Try Again
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="relative min-h-screen bg-background">
            <header className="fixed top-0 left-0 w-full z-50">
                <Navbar />
            </header>

            <div
                className="
                    fixed
                    inset-0
                    w-full
                    h-full
                    z-0
                    pointer-events-none
                "
                aria-hidden="true"
            >
                <DotField
                    dotRadius={1.2}
                    dotSpacing={18}
                    bulgeStrength={40}
                    glowRadius={140}
                    sparkle={false}
                    waveAmplitude={0}
                    cursorRadius={420}
                    cursorForce={0.08}
                    bulgeOnly
                    gradientFrom="#6e6e7380"
                    gradientTo="#d2d2d760"
                    glowColor="#1d1d1f20"
                />
            </div>

            <section
                className="
                    relative
                    z-10
                    h-screen
                    bg-card/20
                    backdrop-blur-xl
                    flex
                "
            >
                <ProfileSidebar user={currentUser} />

                <section
                    className="
                        w-[70vw]
                        mx-auto
                        flex
                        flex-col
                        pt-20
                        p-8
                        overflow-y-auto
                        scrollbar-none
                        scroll-smooth
                    "
                >
                    <h2 className="text-3xl border-b border-border pb-2 text-foreground">
                        Your Orders
                    </h2>

                    {orders.length === 0 ? (
                        <div
                            className="
                                mt-6
                                p-10
                                bg-surface
                                rounded-xl
                                border
                                border-border
                                text-center
                            "
                        >
                            <p className="text-muted">
                                You haven't placed any orders yet.
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/products")
                                }
                                className="
                                    mt-4
                                    px-5
                                    py-2
                                    rounded-xl
                                    bg-accent
                                    text-inverse
                                    font-semibold
                                    cursor-pointer
                                    hover:bg-accent-hover
                                    transition-colors
                                "
                            >
                                Browse Products
                            </button>
                        </div>
                    ) : (
                        <div
                            className="
                                mt-6
                                flex
                                flex-col
                                gap-5
                                bg-surface
                                p-2
                                rounded-xl
                            "
                        >
                            {orders.map((order) => (
                                <Link
                                    key={order.id}
                                    className="
                                        p-3
                                        bg-card
                                        flex
                                        flex-col
                                        gap-3
                                        rounded-lg
                                        border
                                        border-border-soft
                                    "
                                    to={`/profile/orders/${order.id}`}
                                >
                                    {/* Order Header */}
                                    <div className="flex gap-2 justify-between">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex gap-4">
                                                <div className="flex gap-1 items-center">
                                                    <p className="text-muted text-sm font-semibold">
                                                        Order ID:
                                                    </p>

                                                    <p className="font-bold text-foreground">
                                                        #{order.id}
                                                    </p>
                                                </div>

                                                <p>
                                                    {order.created_at && (
                                                        <span className="text-xs text-muted">
                                                            {new Date(
                                                                order.created_at
                                                            ).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>

                                            {/* Shipping Status + Tracking */}
                                            <div className="flex gap-2">
                                                <p
                                                    className={`
                                                        px-3
                                                        py-1
                                                        rounded-full
                                                        text-sm
                                                        font-semibold
                                                        border
                                                        transition-all
                                                        duration-300
                                                        ${
                                                            shippingStatusStyles[
                                                                order.shipping_status
                                                            ] ??
                                                            "text-muted bg-muted/10 border-border"
                                                        }
                                                    `}
                                                >
                                                    {order.shipping_status}
                                                </p>

                                                <button
                                                    type="button"
                                                    className="
                                                        px-3
                                                        py-1
                                                        rounded-full
                                                        cursor-pointer
                                                        text-sm
                                                        font-semibold
                                                        text-success
                                                        duration-300
                                                        ease-in-out
                                                        border
                                                        border-success/40
                                                        bg-success/10
                                                        transition-all
                                                        hover:bg-success/20
                                                        hover:scale-[1.02]
                                                        active:scale-95
                                                    "
                                                >
                                                    Track Order
                                                </button>
                                            </div>
                                        </div>

                                        {/* Order Total */}
                                        <p className="font-bold text-foreground">
                                            {Number(
                                                order.total_amount
                                            ).toFixed(2)}{" "}
                                            DH
                                        </p>
                                    </div>

                                    {/* Order Items */}
                                    <div className="flex flex-col gap-1 pl-4">
                                        {order.items?.map((item) => {
                                            const variant =
                                                item.product_variant;

                                            const image =
                                                variant?.media?.[0]
                                                    ?.media_url;

                                            const originalItemPrice =
                                                getOriginalItemPrice(item);

                                            const paidItemPrice =
                                                getPaidItemPrice(item);

                                            const hasDiscount =
                                                originalItemPrice >
                                                paidItemPrice;

                                            return (
                                                <div
                                                    key={
                                                        item.product_variant_id
                                                    }
                                                    className="
                                                        w-full
                                                        flex
                                                        items-center
                                                        rounded-xl
                                                        overflow-hidden
                                                        p-3
                                                        gap-3
                                                        bg-surface
                                                        border
                                                        border-border-soft
                                                        hover:border-border
                                                        duration-300
                                                        ease-in-out
                                                    "
                                                >
                                                    {/* Product Image */}
                                                    <div
                                                        className="
                                                            w-16
                                                            h-16
                                                            shrink-0
                                                            rounded-lg
                                                            overflow-hidden
                                                            bg-surface-dark
                                                        "
                                                    >
                                                        {image ? (
                                                            <img
                                                                src={image}
                                                                alt={
                                                                    item.product_name ||
                                                                    "Product"
                                                                }
                                                                className="
                                                                    w-full
                                                                    h-full
                                                                    object-cover
                                                                    hover:scale-[1.05]
                                                                    duration-300
                                                                "
                                                            />
                                                        ) : (
                                                            <div
                                                                className="
                                                                    w-full
                                                                    h-full
                                                                    flex
                                                                    items-center
                                                                    justify-center
                                                                    text-xs
                                                                    text-muted
                                                                "
                                                            >
                                                                No image
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Product Information */}
                                                    <div className="flex flex-col min-w-0">
                                                        <h3 className="text-sm font-bold truncate text-foreground">
                                                            {
                                                                item.product_name
                                                            }
                                                        </h3>

                                                        {variant?.sku && (
                                                            <div className="flex items-center gap-1">
                                                                <p className="text-xs text-muted font-semibold">
                                                                    SKU:
                                                                </p>

                                                                <p className="text-xs font-semibold text-foreground">
                                                                    {
                                                                        variant.sku
                                                                    }
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Variant Attributes */}
                                                        <div className="flex flex-wrap gap-x-3">
                                                            {Object.entries(
                                                                item.variant_attributes_snapshot ||
                                                                    {}
                                                            ).map(
                                                                ([
                                                                    key,
                                                                    value,
                                                                ]) => (
                                                                    <div
                                                                        key={
                                                                            key
                                                                        }
                                                                        className="
                                                                            text-xs
                                                                            flex
                                                                            gap-1
                                                                            items-center
                                                                        "
                                                                    >
                                                                        <p className="font-bold text-foreground">
                                                                            {
                                                                                key
                                                                            }
                                                                            :
                                                                        </p>

                                                                        <p className="text-muted font-semibold">
                                                                            {String(
                                                                                value
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>

                                                        {/* Quantity */}
                                                        <div
                                                            className="
                                                                text-xs
                                                                text-muted
                                                                font-semibold
                                                                mt-1
                                                                flex
                                                                gap-1
                                                            "
                                                        >
                                                            <span>
                                                                Quantity:
                                                            </span>

                                                            <span>
                                                                {
                                                                    item.quantity
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Item Total */}
                                                    <div className="ml-auto shrink-0 flex flex-col items-end gap-0.5">
                                                        {hasDiscount && (
                                                            <p className="text-xs text-muted line-through">
                                                                {(
                                                                    originalItemPrice *
                                                                    item.quantity
                                                                ).toFixed(
                                                                    2
                                                                )}{" "}
                                                                DH
                                                            </p>
                                                        )}

                                                        <p className="text-base font-bold text-success">
                                                            {(
                                                                paidItemPrice *
                                                                item.quantity
                                                            ).toFixed(
                                                                2
                                                            )}{" "}
                                                            DH
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </section>
        </main>
    );
}

export default OrdersHistory;
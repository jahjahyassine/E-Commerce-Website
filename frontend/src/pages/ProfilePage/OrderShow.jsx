import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import Navbar from "../../components/Navbar";
import ProfileSidebar from "../../components/ProfileSidebar";
import DotField from "../../components/animation/DotField";
import getCurrentUser from "../../hooks/CurrentUser";

import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo } from "react";

const shippingStatusStyles = {
    NOT_SHIPPED:
        "text-warning bg-warning/10 border-warning/40",
    SHIPPED:
        "text-primary bg-primary/10 border-primary/40",
    DELIVERED:
        "text-success bg-success/10 border-success/40",
};

const orderStatusStyles = {
    PENDING:
        "text-warning bg-warning/10 border-warning/40",
    CONFIRMED:
        "text-primary bg-primary/10 border-primary/40",
    COMPLETED:
        "text-success bg-success/10 border-success/40",
    CANCELLED:
        "text-danger bg-danger/10 border-danger/40",
};

const paymentStatusStyles = {
    PENDING:
        "text-warning bg-warning/10 border-warning/40",
    PAID:
        "text-success bg-success/10 border-success/40",
    REFUNDED:
        "text-primary bg-primary/10 border-primary/40",
};

const shippingStatusOptions = [
    {
        value: "NOT_SHIPPED",
        label: "Not Shipped",
    },
    {
        value: "SHIPPED",
        label: "Shipped",
    },
    {
        value: "DELIVERED",
        label: "Delivered",
    },
];

const orderStatusOptions = [
    {
        value: "PENDING",
        label: "Pending",
    },
    {
        value: "CONFIRMED",
        label: "Confirmed",
    },
    {
        value: "COMPLETED",
        label: "Completed",
    },
    {
        value: "CANCELLED",
        label: "Cancelled",
    },
];

const paymentStatusOptions = [
    {
        value: "PENDING",
        label: "Pending",
    },
    {
        value: "PAID",
        label: "Paid",
    },
    {
        value: "REFUNDED",
        label: "Refunded",
    },
];

function OrderShow() {
    const BASE_URL = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem("access_token");

    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { id } = useParams();

    const {
        data: currentUser,
        isLoading: isLoadingUser,
        isError: isErrorUser,
    } = useQuery({
        queryKey: ["user"],
        queryFn: getCurrentUser,
        enabled: !!token,
    });

    useEffect(() => {
        if (!token) {
            navigate("/login");
        }
    }, [token, navigate]);

    useEffect(() => {
        if (isErrorUser) {
            navigate("/login");
        }
    }, [isErrorUser, navigate]);

    const getOrderItems = async () => {
        const response = await fetch(`${BASE_URL}/orders/${id}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Failed to retrieve order"
            );
        }

        return data;
    };

    const {
        data: order,
        isLoading: isLoadingOrder,
        isError: isErrorOrder,
        error: errorOrder,
    } = useQuery({
        queryKey: ["order", id],
        queryFn: getOrderItems,
        enabled: !!token && !!id,
    });

    const orderItems = order?.items ?? [];

    
    const cancelOrderFunction = async () => {
        const response = await fetch(
            `${BASE_URL}/orders/${id}/cancel`,
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Failed to cancel order"
            );
        }

        return data;
    };

    const {
        mutate: cancelOrder,
        isPending: isCancelingOrder,
    } = useMutation({
        mutationFn: cancelOrderFunction,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["order", id],
            });
        },
    });

    const subtotalAmount = useMemo(() => {
        return orderItems.reduce(
            (total, item) =>
                total +
                item.quantity * Number(item.price),
            0
        );
    }, [orderItems]);

    const deliveryFee = subtotalAmount > 0 ? 10 : 0;
    const totalAmount = subtotalAmount + deliveryFee;
    const hasItems = orderItems.length > 0;

    const canCancel =
        (order?.order_status === "PENDING" ||
            order?.order_status === "CONFIRMED") &&
        order?.shipping_status !== "DELIVERED" &&
        order?.shipping_status !== "SHIPPED" &&
        order?.order_status !== "COMPLETED" &&
        order?.order_status !== "CANCELLED" &&
        order?.payment_status !== "PAID" &&
        order?.payment_status !== "REFUNDED";

    if (isLoadingOrder || isLoadingUser) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-lg font-bold text-foreground">
                    Loading order...
                </p>
            </main>
        );
    }

    if (isErrorOrder) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-danger font-bold">
                    {errorOrder?.message ||
                        "Failed to load order"}
                </p>
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
                        flex-1
                        flex
                        flex-col
                        pt-20
                        p-8
                        overflow-y-auto
                        scrollbar-none
                        scroll-smooth
                    "
                >
                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            border-b
                            border-border
                            pb-4
                        "
                    >
                        <h2 className="text-3xl font-bold text-foreground">
                            Your Order #{id}
                        </h2>

                        {hasItems && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted">
                                    Total
                                </span>

                                <span className="text-success font-bold text-xl">
                                    ${totalAmount.toFixed(2)}
                                </span>
                            </div>
                        )}
                    </div>

                    <div
                        className="
                            mt-6
                            bg-card
                            border
                            border-border
                            rounded-3xl
                            p-6
                        "
                    >
                        <p className="text-sm font-semibold text-muted mb-2">
                            Shipping Address
                        </p>

                        <p className="text-lg font-bold text-foreground">
                            {order.shipping_address}
                        </p>

                        <p className="text-sm text-muted mt-1">
                            {order.shipping_city},{" "}
                            {order.shipping_region}

                            {order.shipping_postal_code &&
                                `, ${order.shipping_postal_code}`}
                        </p>
                    </div>

                    <div
                        className="
                            flex
                            justify-around
                            mt-4
                            border-b
                            border-border
                            pb-4
                        "
                    >
                        <div className="flex gap-2 items-center">
                            <p className="text-muted font-semibold text-sm">
                                Shipping Status:
                            </p>

                            <p
                                className={`
                                    px-4
                                    py-1
                                    rounded-lg
                                    border
                                    ${shippingStatusStyles[order.shipping_status]}
                                `}
                            >
                                {
                                    shippingStatusOptions.find(
                                        (option) =>
                                            option.value ===
                                            order.shipping_status
                                    )?.label
                                }
                            </p>
                        </div>

                        <div className="flex gap-2 items-center">
                            <p className="text-muted font-semibold text-sm">
                                Order Status:
                            </p>

                            <p
                                className={`
                                    px-4
                                    py-1
                                    rounded-lg
                                    border
                                    ${orderStatusStyles[order.order_status]}
                                `}
                            >
                                {
                                    orderStatusOptions.find(
                                        (option) =>
                                            option.value ===
                                            order.order_status
                                    )?.label
                                }
                            </p>
                        </div>

                        <div className="flex gap-2 items-center">
                            <p className="text-muted font-semibold text-sm">
                                Payment Status:
                            </p>

                            <p
                                className={`
                                    px-4
                                    py-1
                                    rounded-lg
                                    border
                                    ${paymentStatusStyles[order.payment_status]}
                                `}
                            >
                                {
                                    paymentStatusOptions.find(
                                        (option) =>
                                            option.value ===
                                            order.payment_status
                                    )?.label
                                }
                            </p>
                        </div>
                    </div>

                    {canCancel && (
                        <div className="flex justify-end mt-5">
                            <button
                                type="button"
                                onClick={() => cancelOrder()}
                                disabled={isCancelingOrder}
                                className="
                                    px-5
                                    py-2.5
                                    rounded-xl
                                    border
                                    border-danger/40
                                    bg-danger/10
                                    text-danger
                                    font-semibold
                                    text-sm
                                    transition-all
                                    duration-300
                                    ease-in-out
                                    cursor-pointer
                                    hover:bg-danger
                                    hover:text-inverse
                                    disabled:opacity-50
                                    disabled:cursor-not-allowed
                                "
                            >
                                {isCancelingOrder
                                    ? "Cancelling..."
                                    : "Cancel Order"}
                            </button>
                        </div>
                    )}

                    {!hasItems ? (
                        <section
                            className="
                                mt-10
                                flex-1
                                flex
                                items-center
                                justify-center
                                rounded-3xl
                                bg-chip
                            "
                        >
                            <p className="text-muted">
                                Your order is empty.
                            </p>
                        </section>
                    ) : (
                        <section
                            className="
                                mt-5
                                flex
                                w-full
                                gap-4
                                items-start
                            "
                        >
                            <div
                                className="
                                    flex-1
                                    min-w-0
                                    max-h-[600px]
                                    flex
                                    flex-col
                                    bg-chip
                                    gap-4
                                    p-2
                                    rounded-3xl
                                    overflow-y-auto
                                    scrollbar-none
                                "
                            >
                                {orderItems.map((orderItem) => {
                                    const variant =
                                        orderItem.product_variant;

                                    const product =
                                        variant?.product;

                                    const media =
                                        variant?.media?.[0];

                                    const variantId =
                                        variant?.id;

                                    return (
                                        <div
                                            key={variantId}
                                            className="
                                                w-full
                                                min-h-[150px]
                                                shrink-0
                                                flex
                                                rounded-2xl
                                                overflow-hidden
                                                p-4
                                                gap-4
                                                transition-all
                                                duration-300
                                                ease-in-out
                                                hover:shadow-sm
                                                bg-card
                                                border
                                                border-border-soft
                                            "
                                        >
                                            <div
                                                className="
                                                    aspect-square
                                                    rounded-xl
                                                    overflow-hidden
                                                    h-[118px]
                                                    shrink-0
                                                    bg-chip
                                                "
                                            >
                                                {media?.media_url ? (
                                                    <img
                                                        src={
                                                            media.media_url
                                                        }
                                                        alt={
                                                            product?.name ||
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
                                                            text-muted
                                                            text-xs
                                                        "
                                                    >
                                                        No image
                                                    </div>
                                                )}
                                            </div>

                                            <div
                                                className="
                                                    flex
                                                    flex-col
                                                    min-w-0
                                                "
                                            >
                                                <h3
                                                    className="
                                                        text-xl
                                                        font-bold
                                                        text-foreground
                                                        truncate
                                                    "
                                                >
                                                    {product?.name}
                                                </h3>

                                                <div className="mt-1">
                                                    {variant?.attributes &&
                                                        Object.entries(
                                                            variant.attributes
                                                        ).map(
                                                            ([
                                                                key,
                                                                value,
                                                            ]) => (
                                                                <div
                                                                    key={key}
                                                                    className="
                                                                        text-sm
                                                                        flex
                                                                        gap-1
                                                                        items-center
                                                                    "
                                                                >
                                                                    <p className="font-bold text-foreground">
                                                                        {key.toUpperCase()}:
                                                                    </p>

                                                                    <p className="text-muted font-bold">
                                                                        {String(
                                                                            value
                                                                        )}
                                                                    </p>
                                                                </div>
                                                            )
                                                        )}
                                                </div>

                                                <div
                                                    className="
                                                        text-sm
                                                        flex
                                                        gap-1
                                                        items-center
                                                        mt-auto
                                                    "
                                                >
                                                    <p className="font-bold text-foreground">
                                                        QUANTITY:
                                                    </p>

                                                    <p className="text-muted font-bold">
                                                        {
                                                            orderItem.quantity
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            <div
                                                className="
                                                    ml-auto
                                                    flex
                                                    flex-col
                                                    justify-between
                                                    gap-4
                                                    items-end
                                                "
                                            >
                                                <p className="text-success font-bold text-xl">
                                                    $
                                                    {(
                                                        orderItem.quantity *
                                                        Number(
                                                            orderItem.price
                                                        )
                                                    ).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                </section>
            </section>
        </main>
    );
}

export default OrderShow;
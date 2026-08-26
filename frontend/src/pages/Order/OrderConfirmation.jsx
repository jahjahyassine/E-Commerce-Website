import { useEffect, useMemo, useState } from "react";
import DotField from "../../components/animation/DotField";
import Navbar from "../../components/Navbar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { PackageCheck, MailCheck, PackageSearch, ShoppingBag } from "lucide-react";
import getCurrentUser from "../../hooks/CurrentUser";

function OrderConfirmation() {
    const token = localStorage.getItem("access_token");
    const { orderId } = useParams()
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const [selectedItems, setSelectedItems] = useState([]);



    const {
        data: currentUser,
        isLoading: isLoadingUser,
        isError: isErrorUser,
    } = useQuery({
        queryKey: ["user"],
        queryFn: getCurrentUser,
        enabled: !!localStorage.getItem("access_token"),
    });


    useEffect(() => {
        if (!token || isErrorUser) {
            navigate("/login");
        }
    }, [token, isErrorUser, navigate]);


    const fetchOrder = async () => {
        const response = await fetch(
            `${BASE_URL}/orders/${orderId}`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )

        const data = await response.json()

        if (!response.ok) throw new Error(data.detail || "Failed to load Order")

        return data
    }


    const {
        data,
        isLoading,
        isError,
        error
    } = useQuery({
        queryKey: ["order", orderId],
        queryFn: fetchOrder
    })


    const order = data ?? {}
    const items = order.items ?? []

    const shippingCost = 10;
    const subtotal = Number(order.total_amount ?? 0) - shippingCost;


    if (isLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <p className="text-lg font-bold">
                    Loading order details...
                </p>
            </main>
        );
    }

    if (isError) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <p className="text-minimal-red font-bold">
                    {error?.message || "Failed to load order details"}
                </p>
            </main>
        );
    }

    return (
        <main className="relative min-h-screen">
            <header className="fixed top-0 left-0 w-full z-50">
                <Navbar />
            </header>

            <div
                className="fixed inset-0 w-full h-full z-0 pointer-events-none"
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

            <section className="relative z-10 pt-20 px-6 flex flex-col gap-5">
                <section className="w-full flex flex-col items-center">
                    <h2 className="text-4xl font-bold tracking-wider mb-5">
                        Order Complete
                    </h2>

                    <div className="flex gap-15 mb-10">
                        <div className="flex items-center gap-2 border-b border-foreground pb-4 md:w-[25vw] lg:w-[15vw] opacity-40 cursor-pointer">
                            <p className="bg-background-dark text-inverse px-4 rounded-xl py-1">
                                1
                            </p>
                            Shopping Cart
                        </div>

                        <div className="flex items-center gap-2 border-b border-foreground pb-4 md:w-[25vw] lg:w-[15vw] opacity-40 cursor-pointer">
                            <p className="bg-background-dark text-inverse px-4 rounded-xl py-1">
                                2
                            </p>
                            Checkout details
                        </div>

                        <div className="flex items-center gap-2 border-b border-foreground pb-4 md:w-[25vw] lg:w-[15vw] cursor-pointer">
                            <p className="bg-background-dark text-inverse px-4 rounded-xl py-1">
                                3
                            </p>
                            Order complete
                        </div>
                    </div>
                </section>

                <section className="flex-1 flex flex-col gap-2 flex-1">

                    <section className="flex flex-col items-center w-full">
                        <PackageCheck className="text-success h-20 w-20" />

                        <h3 className="text-xl font-bold">
                            Order Confirmed
                        </h3>

                        <p className="text-lg">
                            Thank you for your order! your product is on its way.
                        </p>

                        <div className="flex bg-card/10 backdrop-blur-xl p-2 w-1/4 justify-around items-center rounded-xl border border-border-soft hover:border-border duration-300 ease-in-out shadow-inner cursor-pointer">
                            <p className="text-muted text-sm">
                                Order ID:
                            </p>

                            <p className="text-lg font-semibold">
                                #{order.id}
                            </p>
                        </div>

                        <p className="flex gap-1 text-muted font-semibold items-center">
                            <MailCheck className="h-5 w-5" />
                            Order Confirmation sent to
                            <span className="text-foreground font-bold"> {currentUser?.email}</span>
                        </p>
                    </section>

                    <section className="border border-border bg-card p-2 rounded-3xl gap-4 flex flex-col">


                        <h3 className="text-center text-xl font-semibold mb-2">
                            Order Summary
                        </h3>

                        <section className="max-h-[600px] flex flex-col bg-chip gap-4 p-4 rounded-3xl overflow-y-auto">
                            <h3 className="text-lg font-semibold">
                                Order Items
                            </h3>
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <p className="text-xl font-bold">
                                        Your cart is empty
                                    </p>

                                    <button
                                        onClick={() =>
                                            navigate("/products")
                                        }
                                        className="mt-4 bg-primary text-inverse px-5 py-2 rounded-lg hover:bg-primary-hover duration-300"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            ) : (
                                items.map((item) => {
                                    const variant =
                                        item.product_variant;

                                    const image =
                                        variant.media?.[0]
                                            ?.media_url;

                                    return (
                                        <div
                                            key={item.product_variant_id}
                                            className="
                                                w-full
                                                flex
                                                items-center
                                                rounded-xl
                                                overflow-hidden
                                                p-3
                                                gap-3
                                                bg-card
                                                border border-border-soft
                                                hover:border-border
                                                duration-300
                                                ease-in-out
                                            "
                                        >
                                            <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-chip">
                                                {image ? (
                                                    <img
                                                        src={image}
                                                        alt={item.product_name || "Product"}
                                                        className="w-full h-full object-cover hover:scale-[1.05] duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs text-muted">
                                                        No image
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-col min-w-0">
                                                <h3 className="text-sm font-bold truncate">
                                                    {item.product_name}
                                                </h3>

                                                {item.product_variant.sku && (
                                                    <div className="flex items-center gap-1">
                                                        <p className="text-xs text-muted font-semibold">
                                                            SKU:
                                                        </p>
                                                        <p className="text-xs font-semibold">
                                                            {item.product_variant.sku}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="flex flex-wrap gap-x-3">
                                                    {Object.entries(
                                                        item.variant_attributes_snapshot || {}
                                                    ).map(([key, value]) => (
                                                        <div
                                                            key={key}
                                                            className="text-xs flex gap-1 items-center"
                                                        >
                                                            <p className="font-bold">
                                                                {key}:
                                                            </p>

                                                            <p className="text-muted font-semibold">
                                                                {String(value)}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="text-xs text-muted font-semibold mt-1 flex gap-1">
                                                    <span>Quantity:</span>
                                                    <span>{item.quantity}</span>
                                                </div>
                                            </div>

                                            <div className="ml-auto shrink-0">
                                                <p className="text-base font-bold text-emerald">
                                                    ${(item.quantity * Number(item.price)).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}

                        </section>

                        <section className="max-h-[600px] flex flex-col bg-chip gap-4 p-4 rounded-3xl">

                            <h3 className="text-lg font-semibold">
                                Order Information
                            </h3>



                            {order.shipping_address && (
                                <div className="bg-card border border-border-soft rounded-xl p-3">
                                    <p className="text-xs text-muted font-semibold mb-2">
                                        Shipping Address
                                    </p>

                                    <div className="text-sm font-semibold space-y-1">
                                        {order.shipping_address && (
                                            <p>{order.shipping_address}</p>
                                        )}

                                        {order.shipping_address.address && (
                                            <p>{order.shipping_address.address}</p>
                                        )}

                                        {(order.shipping_city ||
                                            order.shipping_region) && (
                                                <p>
                                                    {[
                                                        order.shipping_city,
                                                        order.shipping_region,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(", ")}
                                                </p>
                                            )}

                                        {order.shipping_postal_code && (
                                            <p>
                                                {order.shipping_postal_code}
                                            </p>
                                        )}

                                        {currentUser?.phone && (
                                            <p className="text-muted">
                                                {currentUser?.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Price Breakdown */}
                            <div className="bg-card border border-border-soft rounded-xl p-3">

                                <div className="flex justify-between text-sm">
                                    <span className="text-muted">
                                        Subtotal
                                    </span>
                                    <span className="font-semibold">
                                        ${Number(subtotal ?? 0).toFixed(2)}
                                    </span>
                                </div>

                                <div className="flex justify-between text-sm mt-2">
                                    <span className="text-muted">
                                        Shipping
                                    </span>
                                    <span className="font-semibold">
                                        ${Number(shippingCost).toFixed(2)}
                                    </span>
                                </div>

                                <div className="h-px bg-border my-3" />

                                <div className="flex justify-between">
                                    <span className="font-bold">
                                        Total
                                    </span>
                                    <span className="text-lg font-bold text-emerald">
                                        ${Number(order.total_amount ?? 0).toFixed(2)}
                                    </span>
                                </div>

                            </div>

                        </section>

                        <section className="flex justify-end gap-2">
                            <button
                                className="flex bg-primary text-inverse p-2 justify-center rounded-lg items-center gap-2 hover:bg-primary-hover duration-300 ease-in-out cursor-pointer"
                                onClick={() => navigate(`/track-order/${order.id}`)}
                            >
                                <p>Track Order</p>
                                <PackageSearch className="h-4 w-4" />
                            </button>

                            <button
                                className="flex bg-premium text-foreground p-2 justify-center rounded-lg items-center gap-2 hover:bg-premium-hover duration-300 ease-in-out cursor-pointer border border-muted hover:border-foreground"
                                onClick={() => navigate("/products")}
                            >
                                <ShoppingBag className="h-4 w-4" />
                                <p>Continue Shopping</p>
                            </button>
                        </section>

                    </section>
                </section>
            </section>
        </main>
    );
}

export default OrderConfirmation;
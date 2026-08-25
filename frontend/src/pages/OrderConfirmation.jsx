import { useEffect, useMemo, useState } from "react";
import DotField from "../components/animation/DotField";
import Navbar from "../components/Navbar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { PackageCheck } from "lucide-react";
import getCurrentUser from "../hooks/CurrentUser";

function OrderConfirmation() {
    const token = localStorage.getItem("access_token");
    const { orderId } = useParams()
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const [selectedItems, setSelectedItems] = useState([]);

    useEffect(() => {
        if (!token) {
            navigate("/login");
        }
    }, [token, navigate]);

    const {
        data: currentUser,
        isLoading: isLoadingUser,
        isError: isErrorUser,
    } = useQuery({
        queryKey: ["user"],
        queryFn: getCurrentUser,
        enabled: !!localStorage.getItem("access_token"),
    });

    if (isErrorUser) {
        navigate("/login")
    }

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

            <section className="relative z-10 pt-20 px-6 flex flex-col gap-10">
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

                    <section>
                        <PackageCheck />

                        <h3>
                            Order Confirmed
                        </h3>

                        <p>
                            Thank you for your order! your product is on its way.
                        </p>

                        <div className="bg-card p-2 rounded-2xl">
                            <p>
                                Order ID
                            </p>

                            <p>
                                #{order.id}
                            </p>
                        </div>

                        <p>
                            Order Confirmation sent to
                            <span> {currentUser.email}</span>
                        </p>
                    </section>

                    <section className="bg-chip p-2 rounded-3xl">


                        <h3 className="text-center">
                            Order Summary
                        </h3>

                        <section className="max-h-[600px] flex flex-col bg-chip gap-4 p-2 rounded-3xl overflow-y-auto">
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

                                                <p className="text-xs text-muted font-semibold mt-1 flex gap-1">
                                                    <p>
                                                        Quantity: 
                                                    </p>

                                                    <p>{
                                                        item.quantity}
                                                    </p>
                                                </p>
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


                        <button
                            className="flex bg-primary text-inverse p-2 justify-center rounded-lg items-center gap-2 hover:bg-primary-hover duration-300 ease-in-out cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            onClick={() => {
                                navigate("/track-order");
                            }}
                        >
                            <p>Track Order</p>

                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                viewBox="0 0 16 16"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"
                                />
                            </svg>
                        </button>

                        <button
                            className="flex bg-primary text-inverse p-2 justify-center rounded-lg items-center gap-2 hover:bg-primary-hover duration-300 ease-in-out cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            onClick={() => {
                                navigate("/products");
                            }}
                        >
                            <p>Continue Shopping</p>

                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                viewBox="0 0 16 16"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"
                                />
                            </svg>
                        </button>

                    </section>
                </section>
            </section>
        </main>
    );
}

export default OrderConfirmation;
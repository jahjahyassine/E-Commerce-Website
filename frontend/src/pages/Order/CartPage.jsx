import { useEffect, useMemo, useState } from "react";
import DotField from "../../components/animation/DotField";
import Navbar from "../../components/Navbar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

function CartPage() {
    const token = localStorage.getItem("access_token");
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const [selectedItems, setSelectedItems] = useState([]);

    useEffect(() => {
        if (!token) {
            navigate("/login");
        }
    }, [token, navigate]);

    const getCartItems = async () => {
        const response = await fetch(`${BASE_URL}/cart`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Failed to retrieve cart");
        }

        return data;
    };

    const {
        data: cart,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["cart"],
        queryFn: getCartItems,
        enabled: !!token,
    });

    const cartItems = cart?.items ?? [];

    const allSelected =
        cartItems.length > 0 &&
        selectedItems.length === cartItems.length;

    const hasSelectedItems = selectedItems.length > 0;

    const toggleItem = (variantId) => {
        setSelectedItems((prev) =>
            prev.includes(variantId)
                ? prev.filter((id) => id !== variantId)
                : [...prev, variantId]
        );
    };

    const toggleSelectAll = () => {
        if (allSelected) {
            setSelectedItems([]);
        } else {
            setSelectedItems(
                cartItems.map((item) => item.product_variant.id)
            );
        }
    };

    const clearCartFunction = async () => {
        const response = await fetch(`${BASE_URL}/cart`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Failed to clear cart");
        }

        return data;
    };

    const { mutate: clearCart, isPending: isClearingCart } = useMutation({
        mutationFn: clearCartFunction,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["cart"],
            });

            setSelectedItems([]);
        },
    });

    const deleteItemFunction = async (variantId) => {
        const response = await fetch(
            `${BASE_URL}/cart/items/${variantId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Failed to delete item"
            );
        }

        return data;
    };

    const { mutate: deleteItem } = useMutation({
        mutationFn: deleteItemFunction,

        onSuccess: (_, variantId) => {
            queryClient.invalidateQueries({
                queryKey: ["cart"],
            });

            setSelectedItems((prev) =>
                prev.filter((id) => id !== variantId)
            );
        },
    });

    const deleteSelectedItems = async () => {
        if (!hasSelectedItems) return;

        if (allSelected) {
            clearCart();
            return;
        }

        await Promise.all(
            selectedItems.map((variantId) =>
                deleteItemFunction(variantId)
            )
        );

        queryClient.invalidateQueries({
            queryKey: ["cart"],
        });

        setSelectedItems([]);
    };

    const getDiscountedPrice = (variant) => {
        const price = Number(variant?.price ?? 0);
        const discount = Number(
            variant?.discount_percentage ?? 0
        );

        return price * (1 - discount / 100);
    };

    const subtotalAmount = useMemo(() => {
        return cartItems.reduce((total, item) => {
            const variant = item.product_variant;
            const discountedPrice = getDiscountedPrice(variant);

            return total + item.quantity * discountedPrice;
        }, 0);
    }, [cartItems]);

    const deliveryFee = subtotalAmount > 0 ? 10 : 0;
    const totalAmount = subtotalAmount + deliveryFee;

    const hasItems = cartItems.length > 0;

    if (isLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <p className="text-lg font-bold">
                    Loading cart...
                </p>
            </main>
        );
    }

    if (isError) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <p className="text-danger font-bold">
                    {error?.message || "Failed to load cart"}
                </p>
            </main>
        );
    }

    return (
        <main className="relative min-h-screen">
            {/* Navbar */}
            <header className="fixed top-0 left-0 w-full z-50">
                <Navbar />
            </header>

            {/* Background */}
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
                    gradientFrom="#A8AEC040"
                    gradientTo="#6FA7A330"
                    glowColor="#6FA7A320"
                />
            </div>

            {/* Main Content */}
            <section className="relative z-10 pt-20 px-6 flex flex-col w-[80vw] mx-auto gap-10">
                {/* Header */}
                <section className="w-full flex flex-col items-center">
                    <h2 className="text-4xl font-bold tracking-wider mb-5">
                        Your Shopping Cart
                    </h2>

                    <div className="flex gap-15 mb-10">
                        <div className="flex items-center gap-2 border-b border-foreground pb-4 md:w-[25vw] lg:w-[15vw] cursor-pointer">
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

                        <div className="flex items-center gap-2 border-b border-foreground pb-4 md:w-[25vw] lg:w-[15vw] opacity-40 cursor-pointer">
                            <p className="bg-background-dark text-inverse px-4 rounded-xl py-1">
                                3
                            </p>
                            Order complete
                        </div>
                    </div>
                </section>

                {/* Cart + Summary */}
                <section className="flex gap-5 w-full items-start">
                    {/* Cart Section */}
                    <section className="flex-1 min-w-0 flex flex-col gap-2">
                        {/* Select All */}
                        <section className="bg-card-dark p-2 rounded-3xl">
                            <div className="flex gap-2 bg-card rounded-2xl overflow-hidden px-4 py-3 items-center">
                                <input
                                    type="checkbox"
                                    id="selectAll"
                                    checked={allSelected}
                                    onChange={toggleSelectAll}
                                    disabled={!hasItems}
                                    className="w-4 h-4 cursor-pointer"
                                />

                                <label
                                    htmlFor="selectAll"
                                    className="cursor-pointer"
                                >
                                    Select All
                                </label>

                                <button
                                    className="bg-danger-solid text-inverse px-5 py-2 rounded-lg ml-auto hover:bg-danger-solid-hover cursor-pointer duration-300 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed"
                                    disabled={
                                        !hasSelectedItems ||
                                        isClearingCart
                                    }
                                    onClick={deleteSelectedItems}
                                >
                                    {isClearingCart
                                        ? "Deleting..."
                                        : "Delete"}
                                </button>
                            </div>
                        </section>

                        {/* Cart Items */}
                        <section className="max-h-[600px] flex flex-col bg-card-dark gap-4 p-2 rounded-3xl overflow-y-auto">
                            {cartItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <p className="text-xl font-bold">
                                        Your cart is empty
                                    </p>

                                    <button
                                        onClick={() =>
                                            navigate("/products")
                                        }
                                        className="mt-4 bg-accent text-inverse px-5 py-2 rounded-lg hover:bg-accent-hover duration-300"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            ) : (
                                cartItems.map((cartItem) => {
                                    const variant =
                                        cartItem.product_variant;

                                    const variantId = variant.id;

                                    const isSelected =
                                        selectedItems.includes(
                                            variantId
                                        );

                                    const image =
                                        variant.media?.[0]
                                            ?.media_url;

                                    const originalPrice =
                                        Number(
                                            variant.price ?? 0
                                        );

                                    const discount =
                                        Number(
                                            variant.discount_percentage ??
                                                0
                                        );

                                    const discountedPrice =
                                        getDiscountedPrice(
                                            variant
                                        );

                                    const itemTotal =
                                        cartItem.quantity *
                                        discountedPrice;

                                    return (
                                        <div
                                            key={variantId}
                                            className={`w-full min-h-[150px] shrink-0 flex rounded-2xl overflow-hidden p-4 gap-4 ${
                                                isSelected
                                                    ? "bg-card-dark"
                                                    : "bg-card"
                                            }`}
                                        >
                                            {/* Checkbox */}
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() =>
                                                        toggleItem(
                                                            variantId
                                                        )
                                                    }
                                                    className="w-4 h-4 cursor-pointer"
                                                />
                                            </div>

                                            {/* Image */}
                                            <div className="aspect-square rounded-xl overflow-hidden h-[120px] w-[120px] shrink-0 bg-card-dark">
                                                {image ? (
                                                    <img
                                                        src={image}
                                                        alt={
                                                            variant
                                                                .product
                                                                ?.name ||
                                                            "Product"
                                                        }
                                                        className="w-full h-full object-cover hover:scale-[1.05] duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-muted">
                                                        No image
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex flex-col min-w-0">
                                                <h3 className="text-xl font-bold text-foreground truncate">
                                                    {
                                                        variant
                                                            .product
                                                            ?.name
                                                    }
                                                </h3>

                                                <div>
                                                    {Object.entries(
                                                        variant.attributes ||
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
                                                                className="text-sm flex gap-1 items-center"
                                                            >
                                                                <p className="font-bold">
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

                                                <div className="text-sm flex gap-1 items-center mt-auto">
                                                    <p className="font-bold">
                                                        QUANTITY:
                                                    </p>

                                                    <p className="text-muted font-bold">
                                                        {
                                                            cartItem.quantity
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Price / Delete */}
                                            <div className="ml-auto shrink-0 flex flex-col justify-between gap-4 items-end">
                                                <button
                                                    className="text-danger font-bold hover:scale-[1.1] duration-300 ease-linear cursor-pointer"
                                                    onClick={() =>
                                                        deleteItem(
                                                            variantId
                                                        )
                                                    }
                                                    aria-label={`Remove ${
                                                        variant.product
                                                            ?.name ||
                                                        "item"
                                                    }`}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        width="20"
                                                        height="20"
                                                        fill="currentColor"
                                                        viewBox="0 0 16 16"
                                                    >
                                                        <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
                                                    </svg>
                                                </button>

                                                <div className="flex flex-col items-end">
                                                    {discount > 0 && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-muted line-through">
                                                                $
                                                                {(
                                                                    originalPrice *
                                                                    cartItem.quantity
                                                                ).toFixed(
                                                                    2
                                                                )}
                                                            </span>

                                                            <span className="text-xs font-bold text-danger">
                                                                -
                                                                {
                                                                    discount
                                                                }
                                                                %
                                                            </span>
                                                        </div>
                                                    )}

                                                    <p className="text-highlight font-bold text-xl">
                                                        $
                                                        {itemTotal.toFixed(
                                                            2
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </section>
                    </section>

                    {/* Summary */}
                    <section className="w-[320px] lg:w-[360px] shrink-0 bg-card-dark p-2 h-fit rounded-3xl">
                        <div className="bg-card p-4 flex gap-7 flex-col rounded-2xl">
                            <h3 className="text-xl font-bold">
                                Cart Summary
                            </h3>

                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between">
                                    <p className="text-muted font-bold">
                                        Subtotal
                                    </p>

                                    <p className="font-bold">
                                        ${" "}
                                        {subtotalAmount.toFixed(
                                            2
                                        )}
                                    </p>
                                </div>

                                <div className="flex justify-between">
                                    <p className="text-muted font-bold">
                                        Delivery Fee
                                    </p>

                                    <p className="font-bold">
                                        ${" "}
                                        {deliveryFee.toFixed(
                                            2
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-between border-t border-border pt-3">
                                <p className="text-lg font-bold">
                                    Total
                                </p>

                                <p className="text-lg font-bold">
                                    {totalAmount.toFixed(2)} DH
                                </p>
                            </div>

                            <button
                                className="flex bg-accent text-inverse p-2 justify-center rounded-lg items-center gap-2 hover:bg-accent-hover duration-300 ease-in-out cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                disabled={!hasItems}
                                onClick={() => {
                                    if (!hasItems) return;

                                    navigate("/checkout");
                                }}
                            >
                                <p>Go to Checkout</p>

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
                        </div>
                    </section>
                </section>
            </section>
        </main>
    );
}

export default CartPage;
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import Navbar from "../../components/Navbar";
import ProfileSidebar from "../../components/ProfileSidebar";
import DotField from "../../components/animation/DotField";
import getCurrentUser from "../../hooks/CurrentUser";

import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";

function ProfileCart() {
    const BASE_URL = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem("access_token");

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [selectedItems, setSelectedItems] = useState([]);

    /*
     * ---------------------------------------------------------
     * CURRENT USER
     * ---------------------------------------------------------
     */

    const {
        data: currentUser,
        isLoading: isLoadingUser,
        isError: isErrorUser,
    } = useQuery({
        queryKey: ["user"],
        queryFn: getCurrentUser,
        enabled: !!token,
    });

    /*
     * ---------------------------------------------------------
     * AUTH REDIRECT
     * ---------------------------------------------------------
     */

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

    /*
     * ---------------------------------------------------------
     * GET CART
     * ---------------------------------------------------------
     */

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
            throw new Error(
                data.detail || "Failed to retrieve cart"
            );
        }

        return data;
    };

    const {
        data: cart,
        isLoading: isLoadingCart,
        isError: isErrorCart,
        error: cartError,
    } = useQuery({
        queryKey: ["cart"],
        queryFn: getCartItems,
        enabled: !!token,
    });

    const cartItems = cart?.items ?? [];

    /*
     * ---------------------------------------------------------
     * SELECTION
     * ---------------------------------------------------------
     */

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
                cartItems.map(
                    (item) => item.product_variant.id
                )
            );
        }
    };

    /*
     * ---------------------------------------------------------
     * CLEAR CART
     * ---------------------------------------------------------
     */

    const clearCartFunction = async () => {
        const response = await fetch(`${BASE_URL}/cart`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Failed to clear cart"
            );
        }

        return data;
    };

    const {
        mutate: clearCart,
        isPending: isClearingCart,
    } = useMutation({
        mutationFn: clearCartFunction,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["cart"],
            });

            setSelectedItems([]);
        },
    });

    /*
     * ---------------------------------------------------------
     * DELETE SINGLE ITEM
     * ---------------------------------------------------------
     */

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

    /*
     * ---------------------------------------------------------
     * DELETE SELECTED ITEMS
     * ---------------------------------------------------------
     */

    const deleteSelectedItems = async () => {
        if (!hasSelectedItems) {
            return;
        }

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

    /*
     * ---------------------------------------------------------
     * CART TOTAL
     * ---------------------------------------------------------
     */

    const subtotalAmount = useMemo(() => {
        return cartItems.reduce(
            (total, item) =>
                total +
                item.quantity * Number(item.price),
            0
        );
    }, [cartItems]);

    const deliveryFee = subtotalAmount > 0 ? 10 : 0;
    const totalAmount = subtotalAmount + deliveryFee;

    const hasItems = cartItems.length > 0;

    /*
     * ---------------------------------------------------------
     * LOADING
     * ---------------------------------------------------------
     */

    if (isLoadingCart || isLoadingUser) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <p className="text-lg font-bold">
                    Loading cart...
                </p>
            </main>
        );
    }

    /*
     * ---------------------------------------------------------
     * ERROR
     * ---------------------------------------------------------
     */

    if (isErrorCart) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <p className="text-minimal-red font-bold">
                    {cartError?.message ||
                        "Failed to load cart"}
                </p>
            </main>
        );
    }

    /*
     * ---------------------------------------------------------
     * PAGE
     * ---------------------------------------------------------
     */

    return (
        <main className="relative min-h-screen">
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

                    {/* Header */}

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            border-b
                            border-border
                            pb-2
                        "
                    >
                        <h2 className="text-3xl">
                            Your Cart
                        </h2>

                        <div className="flex items-center gap-6">

                            {/* Total */}

                            {hasItems && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted">
                                        Total
                                    </span>

                                    <span className="text-emerald font-bold text-xl">
                                        $
                                        {totalAmount.toFixed(2)}
                                    </span>
                                </div>
                            )}

                            {/* Select all */}

                            {hasItems && (
                                <button
                                    type="button"
                                    onClick={toggleSelectAll}
                                    className="
                                        text-sm
                                        font-semibold
                                        text-foreground
                                        hover:opacity-70
                                        transition
                                        cursor-pointer
                                    "
                                >
                                    {allSelected
                                        ? "Deselect All"
                                        : "Select All"}
                                </button>
                            )}

                        </div>
                    </div>

                    {/* Cart */}

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
                                Your cart is empty.
                            </p>
                        </section>

                    ) : (

                        <section
                            className="
                                mt-10
                                flex
                                w-full
                                gap-4
                                items-start
                            "
                        >

                            {/* Cart items */}

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

                                {cartItems.map((cartItem) => {

                                    const variant =
                                        cartItem.product_variant;

                                    const product =
                                        variant?.product;

                                    const media =
                                        variant?.media?.[0];

                                    const variantId =
                                        variant?.id;

                                    const isSelected =
                                        selectedItems.includes(
                                            variantId
                                        );

                                    return (
                                        <div
                                            key={variantId}
                                            className={`
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
                                                ${isSelected
                                                    ? "bg-card border border-primary"
                                                    : "bg-card"
                                                }
                                            `}
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
                                                    className="
                                                        w-4
                                                        h-4
                                                        cursor-pointer
                                                        accent-primary
                                                    "
                                                />

                                            </div>

                                            {/* Image */}

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

                                            {/* Product information */}

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
                                                        text-black
                                                        truncate
                                                    "
                                                >
                                                    {product?.name}
                                                </h3>

                                                {/* Variant attributes */}

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

                                                {/* Quantity */}

                                                <div
                                                    className="
                                                        text-sm
                                                        flex
                                                        gap-1
                                                        items-center
                                                        mt-auto
                                                    "
                                                >
                                                    <p className="font-bold">
                                                        QUANTITY:
                                                    </p>

                                                    <p className="text-muted font-bold">
                                                        {cartItem.quantity}
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

                                                <button
                                                    type="button"
                                                    className="
                                                        text-minimal-red
                                                        font-bold
                                                        hover:scale-[1.1]
                                                        duration-300
                                                        ease-linear
                                                        cursor-pointer
                                                    "
                                                    onClick={() =>
                                                        deleteItem(
                                                            variantId
                                                        )
                                                    }
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

                                                <p className="text-emerald font-bold text-xl">
                                                    $
                                                    {(
                                                        cartItem.quantity *
                                                        Number(
                                                            cartItem.price
                                                        )
                                                    ).toFixed(2)}
                                                </p>

                                            </div>

                                        </div>
                                    );
                                })}

                            </div>

                            {/* Actions only — no totals panel */}

                            {hasSelectedItems && (

                                <div
                                    className="
                                        shrink-0
                                        rounded-3xl
                                        bg-chip
                                        p-4
                                    "
                                >

                                    <button
                                        type="button"
                                        onClick={
                                            deleteSelectedItems
                                        }
                                        disabled={
                                            isClearingCart
                                        }
                                        className="
                                            px-5
                                            py-2
                                            rounded-full
                                            bg-danger
                                            text-white
                                            font-bold
                                            text-sm
                                            hover:opacity-80
                                            transition
                                            cursor-pointer
                                            disabled:opacity-50
                                            disabled:cursor-not-allowed
                                        "
                                    >
                                        {isClearingCart
                                            ? "Removing..."
                                            : allSelected
                                                ? "Clear Cart"
                                                : "Remove Selected"}
                                    </button>

                                </div>

                            )}

                        </section>

                    )}

                </section>

            </section>

        </main>
    );
}

export default ProfileCart;
import { useEffect, useState } from "react";
import DotField from "../components/animation/DotField";
import Navbar from "../components/Navbar";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";


function CartPage() {

    const token = localStorage.getItem("access_token")
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const BASE_URL = import.meta.env.VITE_BASE_URL

    useEffect(() => {
        const token = localStorage.getItem("access_token")
        if (!token) {
            navigate("/login")
        }
    }, [token, navigate])


    const [selectAll, setSelectAll] = useState(false)

    const getCartItems = async () => {
        const response = await fetch(
            `${BASE_URL}/cart`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        )

        const data = await response.json()

        if (!response.ok) throw new Error(data.detail || "Failed to Retrieve Cart")
        return data
    }

    const {
        data: cart,
        isLoading
    } = useQuery({
        queryKey: ["cart"],
        queryFn: getCartItems
    })


    const clearCartFunction = async () => {
        const response = await fetch(
            `${BASE_URL}/cart`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        )
        const data = await response.json()

        if (!response.ok) throw new Error(data.detail || "Failed to Clear Cart")

        return data
    }


    const {
        mutate: clearCart,
    } = useMutation({
        mutationFn: clearCartFunction,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["cart"]
            });

            setSelectAll(false);
        }
    })


    const deleteItemFunction = async (variant_id) => {
        const response = await fetch(
            `${BASE_URL}/cart/items/${variant_id}`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        )
        const data = await response.json()

        if (!response.ok) throw new Error(data.detail || "Failed to Delete Item")

        return data
    }

    const {
        mutate: deleteItem,
    } = useMutation({
        mutationFn: deleteItemFunction,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["cart"]
            })

            setSelectAll(false)
        }
    })


    const subtotalAmount = cart?.items?.reduce(
        (total, item) => total + item.quantity * item.price,
        0
    ) ?? 0;

    const deliveryFee = subtotalAmount > 0 ? 10 : 0;

    const totalAmount = subtotalAmount + deliveryFee;


    const hasItems = (cart?.items?.length ?? 0) > 0;


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

            <section className="relative z-10 pt-20 px-6 flex-col max-h-screen gap-10">

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
                <section className="flex gap-5">
                    <section className="h-full flex flex-col gap-2 flex-1">
                        <section className=" bg-chip p-2 rounded-3xl">
                            <div className="flex gap-2 bg-card rounded-2xl overflow-hidden px-4 py-3 items-center">
                                <input
                                    type="checkbox"
                                    id="selectAll"
                                    checked={selectAll}
                                    onChange={(e) => setSelectAll(e.target.checked)}
                                />
                                <label htmlFor="selectAll">
                                    Select All
                                </label>

                                <button className="bg-minimal-red text-inverse px-5 py-2 rounded-lg ml-auto hover:bg-minimal-red-hover cursor-pointer duration-300 ease-in-out"
                                    disabled={!selectAll}
                                    onClick={clearCart}
                                >
                                    Delete
                                </button>
                            </div>
                        </section>

                        <section className="w-full h-full flex flex-col bg-chip gap-4 p-2 rounded-3xl">
                            {
                                cart?.items?.map((cartItem) => (

                                    <div key={cartItem.product_variant.id}
                                        className={`w-full h-[150px] flex rounded-2xl overflow-hidden p-4 gap-4 ${selectAll ? "bg-chip" : "bg-card"}`}
                                    >
                                        <div className="aspect-square rounded-xl overflow-hidden h-full bg-chip">
                                            <img src={cartItem.product_variant.media[0].media_url}
                                                className="w-full h-full object-cover
                                        hover:scale-[1.05] duration-300"
                                            />
                                        </div>

                                        <div className="flex flex-col">
                                            <h3 className="text-xl font-bold text-black">
                                                {cartItem.product_variant.product.name}
                                            </h3>
                                            <div>
                                                {
                                                    Object.entries(cartItem.product_variant.attributes).map(([key, value]) => (
                                                        <div className="text-sm flex gap-1 items-center">
                                                            <p
                                                                className="font-bold"
                                                            >
                                                                {key.toUpperCase()}:
                                                            </p>
                                                            <p
                                                                className="text-muted text-bold"
                                                            >
                                                                {value}
                                                            </p>
                                                        </div>
                                                    ))
                                                }
                                            </div>

                                            <div className="text-sm flex gap-1 items-center mt-auto">
                                                <p
                                                    className="font-bold"
                                                >
                                                    QUANTITY:
                                                </p>
                                                <p
                                                    className="text-muted text-bold"
                                                >
                                                    {cartItem.quantity}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="ml-auto flex flex-col justify-between gap-4 items-end">
                                            <button className="text-minimal-red font-bold hover:scale-[1.1] duration-300 ease-linear cursor-pointer"
                                                onClick={() => deleteItem(cartItem.product_variant.id)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-trash3-fill" viewBox="0 0 16 16">
                                                    <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
                                                </svg>
                                            </button>

                                            <p className="text-emerald font-bold text-xl">
                                                ${(cartItem.quantity * cartItem.price).toFixed(2)}
                                            </p>

                                        </div>

                                    </div>
                                ))
                            }
                        </section>
                    </section>
                    <section className="bg-chip p-2 h-fit md:w-[25vw] lg:w-[30vw] rounded-3xl">
                        <div className="bg-card p-4 flex gap-7 flex-col rounded-2xl">
                            <h3 className="text-xl font-bold">
                                Cart Summary
                            </h3>

                            <div className="flex flex-col">
                                <div className="flex justify-between">
                                    <p className="text-muted font-bold">
                                        Subtotal
                                    </p>
                                    <p className="font-bold">
                                        $ {subtotalAmount.toFixed(2)}
                                    </p>
                                </div>

                                <div className="flex justify-between ">
                                    <p className="text-muted font-bold">
                                        Delivery Fee
                                    </p>
                                    <p className="font-bold">
                                        $ {deliveryFee.toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-between border-t border-border pt-3">
                                <p className="text-lg font-bold">
                                    Total
                                </p>

                                <p className="text-lg font-bold">
                                    $ {totalAmount.toFixed(2)}
                                </p>



                            </div>

                            <button className="flex bg-primary text-inverse p-2 justify-center rounded-lg items-center gap-2 hover:bg-primary-hover duration-300 ease-in-out cursor-pointer"
                            disabled={!hasItems}
                            onClick={() => {
                                if (!hasItems) return;
                                navigate("/checkout")
                            }}
                            >
                                <p>
                                    Go to Checkout
                                </p>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right" viewBox="0 0 16 16">
                                    <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8" />
                                </svg>
                            </button>
                        </div>
                    </section>
                </section>
            </section>
        </main>
    )
}

export default CartPage;
import { useMutation, useQuery } from "@tanstack/react-query";
import Navbar from "../../components/Navbar";
import ProfileSidebar from "../../components/ProfileSidebar";
import DotField from "../../components/animation/DotField";
import getCurrentUser from "../../hooks/CurrentUser";
import { data, useNavigate } from "react-router-dom";
import { Upload, Edit3Icon } from "lucide-react";
import { useState, useEffect } from "react";
import ProfilePictureModal from "../../modals/ProfilePictureModal";

function ProfileCart() {

    const BASE_URL = import.meta.env.VITE_BASE_URL
    const token = localStorage.getItem("access_token")
    const navigate = useNavigate()

    const {
        data: currentUser,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["user"],
        queryFn: getCurrentUser,
        enabled: !!localStorage.getItem("access_token"),
    });

    if (isError) {
        navigate("/login")
    }


    const fetchCart = async () => {
        const response = await fetch(
            `${BASE_URL}/cart`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        )

        const data = await response.json()

        if (!response.ok) throw new Error(data.message || "Failed to retrieve Orders!")

        return data
    }


    const {
        data: cart
    } = useQuery({
        queryFn: fetchCart,
        queryKey: ["cart"]
    })





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

            <section className="relative z-10 h-screen bg-card/20 backdrop-blur-xl flex">
                <ProfileSidebar user={currentUser} />

                <section className="flex-1 flex flex-col pt-20 p-8">
                    <h2 className="text-3xl border-b border-border pb-2">
                        Your Cart
                    </h2>

                    <section className="mt-10 max-h-[600px] flex flex-col bg-chip gap-4 p-2 rounded-3xl overflow-y-auto">
                        {
                            cart?.items?.map((cartItem) => (

                                <div key={cartItem.product_variant.id}
                                    className={`w-full h-[150px] shrink-0 flex rounded-2xl overflow-hidden p-4 gap-4 ${selectAll ? "bg-chip" : "bg-card"}`}
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
            </section>
        </main>
    )
}


export default ProfileCart;
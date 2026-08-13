import { useMutation, useQuery } from "@tanstack/react-query";
import Navbar from "../../components/Navbar";
import ProfileSidebar from "../../components/ProfileSidebar";
import DotField from "../../components/animation/DotField";
import getCurrentUser from "../../hooks/CurrentUser";
import { data, useNavigate } from "react-router-dom";
import { Upload, Edit3Icon } from "lucide-react";
import { useState, useEffect } from "react";
import ProfilePictureModal from "../../modals/ProfilePictureModal";

function OrdersHistory() {

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


    const fetchOrders = async () => {
        const response = await fetch(
            `${BASE_URL}/orders`,
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
        data: orders
    } = useQuery({
        queryFn: fetchOrders,
        queryKey: ["orders"]
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
                <ProfileSidebar user={currentUser}  />

                <section className="flex-1 flex flex-col pt-20 p-8">
                    <h2 className="text-3xl border-b border-border pb-2">
                        Your Orders
                    </h2>

                    <div className="mt-6 flex gap-5">
                        {
                            orders?.map((order) => (
                                <div>
                                    {order.id}
                                </div>
                            ))
                        }
                    </div>

                </section>
            </section>
        </main>
    )
}


export default OrdersHistory;
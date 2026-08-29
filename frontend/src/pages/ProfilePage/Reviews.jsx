import {
    useQuery,
} from "@tanstack/react-query";

import Navbar from "../../components/Navbar";
import ProfileSidebar from "../../components/ProfileSidebar";
import DotField from "../../components/animation/DotField";
import getCurrentUser from "../../hooks/CurrentUser";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

function Reviews() {
    const BASE_URL = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem("access_token");

    const navigate = useNavigate();


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

 

    const getUserReviews = async () => {
        const response = await fetch(`${BASE_URL}/user/reviews`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Failed to retrieve reviews"
            );
        }

        return data;
    };

    const {
        data: reviews,
        isLoading: isLoadingReviews,
        isError: isErrorReviews,
        error: reviewError,
    } = useQuery({
        queryKey: ["reviews"],
        queryFn: getUserReviews,
        enabled: !!token,
    });


    if (isLoadingReviews || isLoadingUser) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <p className="text-lg font-bold">
                    Loading reviews...
                </p>
            </main>
        );
    }


    if (isErrorReviews) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <p className="text-minimal-red font-bold">
                    {reviewError?.message || "Failed to load reviews"}
                </p>
            </main>
        );
    }



    const reviewItems = reviews ?? [];



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


                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            border-b
                            border-border
                            pb-3
                        "
                    >
                        <div>
                            <h2 className="text-3xl font-semibold">
                                Your Reviews
                            </h2>
                        </div>

                        {reviewItems.length > 0 && (
                            <span
                                className="
                                    px-3
                                    py-1
                                    rounded-full
                                    bg-chip
                                    text-sm
                                    font-semibold
                                "
                            >
                                {reviewItems.length}{" "}
                                {reviewItems.length === 1
                                    ? "Review"
                                    : "Reviews"}
                            </span>
                        )}
                    </div>


                    {reviewItems.length === 0 ? (
                        <section
                            className="
                                mt-8
                                flex-1
                                min-h-[500px]
                                flex
                                flex-col
                                items-center
                                justify-center
                                rounded-3xl
                                bg-chip
                                text-center
                                px-6
                            "
                        >
                            <div
                                className="
                                    w-14
                                    h-14
                                    rounded-2xl
                                    bg-card
                                    flex
                                    items-center
                                    justify-center
                                    mb-4
                                "
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="25"
                                    height="25"
                                    fill="currentColor"
                                    viewBox="0 0 16 16"
                                >
                                    <path d="M14 1a1 1 0 0 1 1 1v8.5a1 1 0 0 1-1 1H5.414L2 14.914V11.5H1a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM1 2v8.5h2v2.086L5.086 10.5H14V2z" />
                                    <path d="M3 3.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0 2a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5" />
                                </svg>
                            </div>

                            <h3 className="text-xl font-bold">
                                No reviews yet
                            </h3>

                            <p className="text-muted text-sm mt-2 max-w-sm">
                                You haven't submitted any reviews yet.
                                Your reviews will appear here.
                            </p>
                        </section>
                    ) : (
                        <section
                            className="
                                mt-8
                                flex-1
                                min-h-0
                                rounded-3xl
                                bg-chip
                                p-3
                                overflow-y-auto
                                scrollbar-none
                            "
                        >
                            <div className="flex flex-col gap-3">

                                {reviewItems.map((review, index) => {
                                    const rating =
                                        Number(
                                            review.rating ??
                                            0
                                        );

                                    const product = review.product;
                                    const title = review.product.name ?? "Product";

                                    const comment = review.review ?? "";

                                    const date = review.created_at;

                                    return (
                                        <Link
                                            key={
                                                review.id ??
                                                index
                                            }
                                            className="
                                                rounded-2xl
                                                bg-card
                                                p-5
                                                transition
                                                duration-300
                                                ease-in-out
                                                hover:shadow-sm
                                            "
                                            to={`/products/${product.id}`}
                                        >
                                            <div
                                                className="
                                                    flex
                                                    items-start
                                                    justify-between
                                                    gap-4
                                                "
                                            >
                                                <div className="min-w-0">

                                                    <h3
                                                        className="
                                                            font-bold
                                                            text-lg
                                                            truncate
                                                        "
                                                    >
                                                        {title}
                                                    </h3>

                                                    {date && (
                                                        <p className="text-xs text-muted mt-1">
                                                            {new Date(
                                                                date
                                                            ).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>


                                                {rating > 0 && (
                                                    <div
                                                        className="
                                                            shrink-0
                                                            flex
                                                            items-center
                                                            gap-1
                                                            px-3
                                                            py-1.5
                                                            rounded-full
                                                            bg-chip
                                                        "
                                                    >
                                                        <span className="text-amber-500">
                                                            ★
                                                        </span>

                                                        <span className="text-sm font-bold">
                                                            {rating}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>


                                            {rating > 0 && (
                                                <div className="flex gap-0.5 mt-2">
                                                    {[1, 2, 3, 4, 5].map(
                                                        (star) => (
                                                            <span
                                                                key={star}
                                                                className={
                                                                    star <=
                                                                    rating
                                                                        ? "text-amber-500"
                                                                        : "text-muted opacity-30"
                                                                }
                                                            >
                                                                ★
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                            )}


                                            {comment && (
                                                <p
                                                    className="
                                                        mt-2
                                                        text-sm
                                                        leading-6
                                                        text-muted
                                                        pt-1
                                                        border-t border-border-soft
                                                    "
                                                >
                                                    {comment}
                                                </p>
                                            )}
                                        </Link>
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

export default Reviews;


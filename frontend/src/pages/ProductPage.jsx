import { useNavigate, useParams } from "react-router-dom";
import DotField from "../components/animation/DotField";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import {
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { FaStar } from "react-icons/fa6";

import {
    useMemo,
    useState,
    useEffect,
    useRef,
} from "react";

import {
    Send,
    Trash2,
    Edit2,
    X,
    Truck,
    RotateCcw,
    ShieldCheck,
    Package,
    Check,
    Minus,
    Plus,
} from "lucide-react";

import getCurrentUser from "../hooks/CurrentUser";


function ProductPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const BASE_URL = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem("access_token");

    const [quantity, setQuantity] = useState(1);
    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [review, setReview] = useState("");
    const [rating, setRating] = useState(0);
    const [editingReviewId, setEditingReviewId] = useState(null);

    const inputRef = useRef(null);

    /* =========================================================
       CURRENT USER
    ========================================================= */

    const { data: currentUser } = useQuery({
        queryKey: ["user"],
        queryFn: getCurrentUser,
        enabled: !!token,
    });

    /* =========================================================
       PRODUCT
    ========================================================= */

    const getProductDetails = async () => {
        const response = await fetch(`${BASE_URL}/products/${id}`);

        if (!response.ok) {
            throw new Error("Failed to fetch product");
        }

        return response.json();
    };

    const {
        data: product,
        isLoading: productLoading,
        isError: productError,
    } = useQuery({
        queryKey: ["products", id],
        queryFn: getProductDetails,
        enabled: !!id,
    });

    /* =========================================================
       PRODUCT VARIANTS
    ========================================================= */

    const getProductVariantDetails = async () => {
        const response = await fetch(
            `${BASE_URL}/products/${id}/variants`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch product variants");
        }

        return response.json();
    };

    const {
        data: productVariantsData = [],
        isLoading: variantsLoading,
        isError: variantsError,
    } = useQuery({
        queryKey: ["products", id, "variants"],
        queryFn: getProductVariantDetails,
        enabled: !!id,
    });

    /* =========================================================
       REVIEWS
    ========================================================= */

    const getProductReviews = async () => {
        const response = await fetch(
            `${BASE_URL}/products/${id}/reviews`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch product reviews");
        }

        return response.json();
    };

    const {
        data: reviews = [],
        isLoading: reviewsLoading,
        isError: reviewsError,
    } = useQuery({
        queryKey: ["products", id, "reviews"],
        queryFn: getProductReviews,
        enabled: !!id,
    });

    /* =========================================================
       USER REVIEW
    ========================================================= */

    const getUserRating = async () => {
        if (!currentUser?.id) {
            return null;
        }

        const response = await fetch(
            `${BASE_URL}/reviews/${id}/user/${currentUser.id}`,
            {
                headers: token
                    ? {
                          Authorization: `Bearer ${token}`,
                      }
                    : {},
            }
        );

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            throw new Error("Failed to fetch user review");
        }

        return response.json();
    };

    const { data: userReview } = useQuery({
        queryKey: [
            "products",
            id,
            "reviews",
            currentUser?.id,
        ],
        queryFn: getUserRating,
        enabled: !!id && !!currentUser?.id && !!token,
    });

    useEffect(() => {
        if (
            userReview &&
            editingReviewId === null
        ) {
            setRating(Number(userReview.rating) || 0);
        }
    }, [userReview, editingReviewId]);

    /* =========================================================
       CART
    ========================================================= */

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

    const { data: cart } = useQuery({
        queryKey: ["cart"],
        queryFn: getCartItems,
        enabled: !!token,
    });

    /* =========================================================
       ADD TO CART
    ========================================================= */

    const addToCart = async ({
        variant_id,
        quantity,
    }) => {
        const currentToken =
            localStorage.getItem("access_token");

        if (!currentToken) {
            navigate("/login");
            return;
        }

        const response = await fetch(`${BASE_URL}/cart`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${currentToken}`,
            },
            body: JSON.stringify({
                variant_id,
                quantity,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Failed to add item to cart"
            );
        }

        return data;
    };

    const {
        mutate: addItem,
        isPending: isAddingToCart,
        isError: isCartError,
        error: cartError,
    } = useMutation({
        mutationFn: addToCart,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["cart"],
            });
        },
    });

    /* =========================================================
       VARIANT SELECTION
    ========================================================= */

    const selectedVariant = useMemo(() => {
        if (!productVariantsData?.length) {
            return null;
        }

        const selectedKeys =
            Object.keys(selectedAttributes);

        if (selectedKeys.length === 0) {
            return productVariantsData[0];
        }

        return (
            productVariantsData.find((variant) =>
                selectedKeys.every(
                    (key) =>
                        variant.attributes?.[key] ===
                        selectedAttributes[key]
                )
            ) ?? null
        );
    }, [
        productVariantsData,
        selectedAttributes,
    ]);

    /* =========================================================
       ATTRIBUTE OPTIONS
    ========================================================= */

    const attributeOptions = useMemo(() => {
        const attributes = {};

        productVariantsData?.forEach((variant) => {
            Object.entries(
                variant.attributes || {}
            ).forEach(([key, value]) => {
                if (!attributes[key]) {
                    attributes[key] = [];
                }

                if (!attributes[key].includes(value)) {
                    attributes[key].push(value);
                }
            });
        });

        return attributes;
    }, [productVariantsData]);

    const isAttributeAvailable = (key, value) => {
        if (!productVariantsData?.length) {
            return false;
        }

        const otherAttributes = Object.entries(
            selectedAttributes
        ).filter(
            ([selectedKey]) => selectedKey !== key
        );

        return productVariantsData.some((variant) => {
            if (
                variant.attributes?.[key] !== value
            ) {
                return false;
            }

            return otherAttributes.every(
                ([otherKey, otherValue]) =>
                    variant.attributes?.[otherKey] ===
                    otherValue
            );
        });
    };

    const updateAttribute = (key, value) => {
        setSelectedAttributes((prev) => ({
            ...prev,
            [key]: value,
        }));

        setQuantity(1);
    };

    /* =========================================================
       PRODUCT DATA
    ========================================================= */

    const media =
        selectedVariant?.media?.length
            ? selectedVariant.media
            : product?.media ?? [];

    const isInStock =
        Number(
            selectedVariant?.inventory?.quantity ?? 0
        ) > 0;

    const stockQuantity =
        selectedVariant?.inventory?.quantity ?? 0;

    const isActive =
        selectedVariant?.is_active === true;

    const isInCart =
        cart?.items?.some(
            (item) =>
                item.product_variant?.id ===
                selectedVariant?.id
        ) ?? false;

    const averageRating = Number(
        product?.average_rating ?? 0
    );

    const reviewCount =
        product?.count_reviews ?? reviews.length;

    const originalPrice =
        Number(selectedVariant?.price ?? 0);

    const discountPercentage =
        Number(
            selectedVariant?.discount_percentage ?? 0
        );

    const discountedPrice =
        discountPercentage > 0
            ? originalPrice *
              (1 - discountPercentage / 100)
            : originalPrice;

    /* =========================================================
       REVIEW STATUS
    ========================================================= */

    const hasReviewed = reviews.some(
        (reviewItem) =>
            String(reviewItem?.user?.id) ===
            String(currentUser?.id)
    );

    const isEditing =
        editingReviewId !== null;

    /* =========================================================
       CREATE REVIEW
    ========================================================= */

    const createReviewFunction = async (reviewData) => {
        const response = await fetch(
            `${BASE_URL}/reviews`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(reviewData),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Failed to create review"
            );
        }

        return data;
    };

    const {
        mutate: addReview,
        isPending: isReviewPending,
    } = useMutation({
        mutationFn: createReviewFunction,

        onSuccess: () => {
            setReview("");
            setRating(0);

            queryClient.invalidateQueries({
                queryKey: [
                    "products",
                    id,
                    "reviews",
                ],
            });

            queryClient.invalidateQueries({
                queryKey: [
                    "products",
                    id,
                ],
            });

            queryClient.invalidateQueries({
                queryKey: [
                    "products",
                    id,
                    "reviews",
                    currentUser?.id,
                ],
            });
        },

        onError: (error) => {
            window.alert(
                error?.message ||
                    "Something went wrong while submitting your review."
            );
        },
    });

    /* =========================================================
       UPDATE REVIEW
    ========================================================= */

    const updateReviewFunction = async ({
        reviewId,
        reviewData,
    }) => {
        const response = await fetch(
            `${BASE_URL}/reviews/${reviewId}`,
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(reviewData),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Failed to update review"
            );
        }

        return data;
    };

    const {
        mutate: updateReview,
        isPending: isUpdateReviewPending,
    } = useMutation({
        mutationFn: updateReviewFunction,

        onSuccess: () => {
            setReview("");
            setRating(0);
            setEditingReviewId(null);

            queryClient.invalidateQueries({
                queryKey: [
                    "products",
                    id,
                    "reviews",
                ],
            });

            queryClient.invalidateQueries({
                queryKey: [
                    "products",
                    id,
                ],
            });

            queryClient.invalidateQueries({
                queryKey: [
                    "products",
                    id,
                    "reviews",
                    currentUser?.id,
                ],
            });
        },

        onError: (error) => {
            window.alert(
                error?.message ||
                    "Failed to update review."
            );
        },
    });

    /* =========================================================
       DELETE REVIEW
    ========================================================= */

    const deleteReviewFunction = async (reviewId) => {
        const response = await fetch(
            `${BASE_URL}/reviews/${reviewId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Failed to delete review"
            );
        }

        return data;
    };

    const {
        mutate: deleteReview,
        isPending: isDeleteReviewPending,
    } = useMutation({
        mutationFn: deleteReviewFunction,

        onSuccess: () => {
            setReview("");
            setRating(0);
            setEditingReviewId(null);

            queryClient.invalidateQueries({
                queryKey: [
                    "products",
                    id,
                    "reviews",
                ],
            });

            queryClient.invalidateQueries({
                queryKey: [
                    "products",
                    id,
                ],
            });

            queryClient.invalidateQueries({
                queryKey: [
                    "products",
                    id,
                    "reviews",
                    currentUser?.id,
                ],
            });
        },

        onError: (error) => {
            window.alert(
                error?.message ||
                    "Failed to delete review."
            );
        },
    });

    /* =========================================================
       EDIT REVIEW
    ========================================================= */

    const handleEditReview = (reviewToEdit) => {
        setEditingReviewId(reviewToEdit.id);
        setReview(reviewToEdit.review ?? "");
        setRating(
            Number(reviewToEdit.rating) || 0
        );

        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    };

    const handleCancelEdit = () => {
        setEditingReviewId(null);
        setReview("");
        setRating(0);
    };

    /* =========================================================
       SUBMIT REVIEW
    ========================================================= */

    const handleSubmitReview = () => {
        if (!review.trim() || rating === 0) {
            return;
        }

        if (isEditing) {
            updateReview({
                reviewId: editingReviewId,
                reviewData: {
                    rating,
                    review: review.trim(),
                    product_id: Number(id),
                },
            });

            return;
        }

        addReview({
            product_id: Number(id),
            rating,
            review: review.trim(),
        });
    };

    /* =========================================================
       LOADING
    ========================================================= */

    if (productLoading || variantsLoading) {
        return (
            <main className="min-h-screen w-full flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-full border-2 border-border border-t-accent animate-spin" />
                    <p className="text-muted text-sm font-medium">
                        Loading product...
                    </p>
                </div>
            </main>
        );
    }

    /* =========================================================
       ERROR
    ========================================================= */

    if (productError || variantsError) {
        return (
            <main className="min-h-screen w-full flex flex-col gap-5 items-center justify-center bg-background">
                <div className="w-16 h-16 rounded-2xl bg-danger/10 border border-danger/30 flex items-center justify-center">
                    <Package className="w-7 h-7 text-danger" />
                </div>

                <div className="text-center">
                    <p className="text-danger text-lg font-bold">
                        Failed to load product.
                    </p>

                    <p className="text-muted text-sm mt-1">
                        The product could not be retrieved.
                    </p>
                </div>

                <button
                    onClick={() =>
                        navigate("/products")
                    }
                    className="
                        px-5
                        py-2.5
                        rounded-xl
                        bg-accent
                        text-inverse
                        font-semibold
                        border
                        border-accent-hover
                        cursor-pointer
                        hover:bg-accent-hover
                        transition
                    "
                >
                    Back to Products
                </button>
            </main>
        );
    }

    return (
        <main className="min-h-screen w-full bg-background font-sans">
            {/* NAVBAR */}

            <header className="fixed top-0 left-0 w-full z-50">
                <Navbar />
            </header>

            {/* BACKGROUND */}

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

            <section className="relative z-10 w-full pt-24">
                {/* =====================================================
                    PRODUCT HERO
                ===================================================== */}

                <section
                    className="
                        w-full
                        max-w-7xl
                        mx-auto
                        px-6
                        lg:px-8
                        grid
                        grid-cols-1
                        lg:grid-cols-2
                        gap-10
                        xl:gap-16
                        items-start
                    "
                >
                    {/* PRODUCT MEDIA */}

                    <div className="w-full min-w-0 lg:sticky lg:top-24">
                        <div
                            className="
                                relative
                                w-full
                                aspect-square
                                overflow-x-auto
                                flex
                                snap-x
                                snap-mandatory
                                border
                                border-border
                                bg-surface-dark/70
                                rounded-[2rem]
                                backdrop-blur-xl
                                scrollbar-none
                                scroll-smooth
                                shadow-product
                            "
                        >
                            {/* subtle inner frame */}

                            <div className="absolute inset-3 rounded-[1.6rem] border border-border-soft pointer-events-none z-10" />

                            {media.length > 0 ? (
                                media.map(
                                    (
                                        image,
                                        index
                                    ) => (
                                        <div
                                            key={index}
                                            className="
                                                relative
                                                min-w-full
                                                aspect-square
                                                snap-center
                                                flex
                                                items-center
                                                justify-center
                                                p-8
                                                md:p-12
                                            "
                                        >
                                            <img
                                                src={
                                                    image.media_url
                                                }
                                                alt={`${product?.name} image ${
                                                    index + 1
                                                }`}
                                                className="
                                                    relative
                                                    z-0
                                                    w-full
                                                    h-full
                                                    object-contain
                                                    select-none
                                                    drop-shadow-[0_20px_35px_rgba(13,17,32,0.35)]
                                                "
                                            />

                                            <div
                                                className="
                                                    absolute
                                                    top-6
                                                    left-6
                                                    px-3
                                                    py-1.5
                                                    rounded-full
                                                    bg-background/70
                                                    border
                                                    border-border-soft
                                                    backdrop-blur-xl
                                                    text-xs
                                                    text-muted
                                                    font-semibold
                                                    z-20
                                                "
                                            >
                                                {index + 1}
                                                {" / "}
                                                {media.length}
                                            </div>
                                        </div>
                                    )
                                )
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="text-center">
                                        <Package className="w-10 h-10 mx-auto text-muted mb-3" />
                                        <p className="text-muted">
                                            No image available
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* MEDIA META */}

                        <div className="flex items-center justify-between mt-4 px-1">
                            <span className="text-xs text-subtle">
                                Product preview
                            </span>

                            <span className="text-xs text-subtle">
                                Swipe to explore
                            </span>
                        </div>
                    </div>

                    {/* PRODUCT INFORMATION */}

                    <div className="w-full min-w-0 flex flex-col">
                        {/* BRAND */}

                        <div className="flex items-center gap-3">
    <span className="h-px w-8 bg-coral" />

    <p className="text-coral font-semibold tracking-[0.2em] uppercase text-xs">
        {product?.brand?.name}
    </p>
</div>

                        {/* NAME */}

                        <h1
                            className="
                                mt-3
                                text-4xl
                                md:text-5xl
                                xl:text-6xl
                                font-bold
                                text-foreground
                                leading-[1.02]
                                tracking-tight
                            "
                        >
                            {product?.name}
                        </h1>

                        {/* RATING */}

                        <div
                            className="
                                flex
                                flex-wrap
                                items-center
                                gap-3
                                mt-5
                            "
                        >
                            <div
                                className="
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    px-3
                                    py-1.5
                                    rounded-full
                                    bg-surface
                                    border
                                    border-border-soft
                                "
                            >
                                <div className="flex">
                                    {Array.from({
                                        length: 5,
                                    }).map(
                                        (_, index) => (
                                            <FaStar
                                                key={
                                                    index
                                                }
                                                className={`
                                                    text-sm
                                                    ${
                                                        index <
                                                        Math.round(
                                                            averageRating
                                                        )
                                                            ? "text-highlight"
                                                            : "text-muted/20"
                                                    }
                                                `}
                                            />
                                        )
                                    )}
                                </div>

                                <span className="text-sm font-bold text-foreground">
                                    {averageRating.toFixed(
                                        1
                                    )}
                                </span>
                            </div>

                            <span className="text-sm text-muted">
                                {reviewCount}{" "}
                                {reviewCount === 1
                                    ? "review"
                                    : "reviews"}
                            </span>
                        </div>

                        {/* PRICE BLOCK */}

                        <div
                            className="
                                mt-7
                                rounded-2xl
                                border
                                border-border-soft
                                bg-card/60
                                backdrop-blur-xl
                                p-5
                            "
                        >
                            <div className="flex flex-wrap items-end gap-4">
                                <p
                                    className="
                                        text-4xl
                                        font-bold
                                        tracking-tight
                                        text-success
                                    "
                                >
                                    {selectedVariant?.price != null
                                        ? `${discountedPrice.toFixed(
                                              2
                                          )} DH`
                                        : "Price unavailable"}
                                </p>

                                {discountPercentage > 0 && (
                                    <>
                                        <p
                                            className="
                                                text-lg
                                                font-semibold
                                                text-muted
                                                line-through
                                                mb-1
                                            "
                                        >
                                            {originalPrice.toFixed(
                                                2
                                            )} DH
                                        </p>

                                        <span
                                            className="
                                                bg-danger/10
                                                text-danger
                                                border
                                                border-danger/30
                                                px-2.5
                                                py-1
                                                rounded-lg
                                                text-xs
                                                font-bold
                                                mb-1
                                            "
                                        >
                                            -
                                            {
                                                discountPercentage
                                            }
                                            %
                                        </span>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-2 mt-3">
                                <span
                                    className={`
                                        w-2
                                        h-2
                                        rounded-full
                                        ${
                                            selectedVariant &&
                                            isInStock &&
                                            isActive
                                                ? "bg-success"
                                                : "bg-danger"
                                        }
                                    `}
                                />

                                {!selectedVariant ? (
                                    <span className="text-danger text-sm font-semibold">
                                        Combination unavailable
                                    </span>
                                ) : isInStock &&
                                  isActive ? (
                                    <span className="text-success text-sm font-semibold">
                                        Available
                                        <span className="text-muted font-normal">
                                            {" "}
                                            · {stockQuantity} in
                                            stock
                                        </span>
                                    </span>
                                ) : (
                                    <span className="text-danger text-sm font-semibold">
                                        Out of stock
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* DESCRIPTION */}

                        <div
                            className="
                                mt-7
                                pb-7
                                border-b
                                border-border
                            "
                        >
                            <p className="text-sm font-semibold text-muted mb-2">
                                About this product
                            </p>

                            <p className="text-foreground/75 leading-7">
                                {product?.description}
                            </p>
                        </div>

                        {/* ATTRIBUTES */}

                        {Object.keys(attributeOptions)
                            .length > 0 && (
                            <div className="flex flex-col gap-6 mt-7">
                                {Object.entries(
                                    attributeOptions
                                ).map(
                                    ([
                                        key,
                                        values,
                                    ]) => (
                                        <div
                                            key={key}
                                            className="flex flex-col gap-3"
                                        >
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-bold text-muted tracking-[0.12em] uppercase">
                                                    {key}
                                                </p>

                                                {selectedAttributes[
                                                    key
                                                ] && (
                                                    <span className="text-xs text-accent font-semibold">
                                                        {
                                                            selectedAttributes[
                                                                key
                                                            ]
                                                        }
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {values.map(
                                                    (
                                                        value
                                                    ) => {
                                                        const available =
                                                            isAttributeAvailable(
                                                                key,
                                                                value
                                                            );

                                                        const selected =
                                                            selectedAttributes[
                                                                key
                                                            ] ===
                                                            value;

                                                        return (
                                                            <button
                                                                key={
                                                                    value
                                                                }
                                                                type="button"
                                                                disabled={
                                                                    !available
                                                                }
                                                                onClick={() =>
                                                                    updateAttribute(
                                                                        key,
                                                                        value
                                                                    )
                                                                }
                                                                className={`
                                                                    min-w-16
                                                                    px-4
                                                                    py-2.5
                                                                    rounded-xl
                                                                    border
                                                                    font-semibold
                                                                    text-sm
                                                                    transition-all
                                                                    duration-200

                                                                    ${
                                                                        selected
                                                                            ? "bg-accent text-inverse border-accent-hover shadow-[0_0_0_3px_rgba(111,167,163,0.12)]"
                                                                            : "bg-card/60 text-foreground border-border-soft hover:border-border hover:bg-surface-hover"
                                                                    }

                                                                    ${
                                                                        !available
                                                                            ? "opacity-25 cursor-not-allowed line-through"
                                                                            : "cursor-pointer hover:-translate-y-0.5"
                                                                    }
                                                                `}
                                                            >
                                                                {value}
                                                            </button>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        )}

                        {/* SERVICE FEATURES */}

                        <div
                            className="
                                grid
                                grid-cols-1
                                sm:grid-cols-3
                                gap-3
                                mt-7
                            "
                        >
                            {[
                                {
                                    icon: Truck,
                                    title: "Delivery",
                                    text: "Fast shipping",
                                },
                                {
                                    icon: RotateCcw,
                                    title: "Returns",
                                    text: "30 days",
                                },
                                {
                                    icon: ShieldCheck,
                                    title: "Warranty",
                                    text: "Official warranty",
                                },
                            ].map(
                                ({
                                    icon: Icon,
                                    title,
                                    text,
                                }) => (
                                    <div
                                        key={title}
                                        className="
                                            group
                                            bg-card/60
                                            border
                                            border-border-soft
                                            hover:border-border
                                            rounded-2xl
                                            p-4
                                            transition-all
                                            duration-300
                                        "
                                    >
                                        <div
                                            className="
                                                w-9
                                                h-9
                                                rounded-xl
                                                bg-accent/10
                                                border
                                                border-accent/20
                                                flex
                                                items-center
                                                justify-center
                                                mb-3
                                                transition
                                                group-hover:bg-accent/15
                                            "
                                        >
                                            <Icon className="w-4 h-4 text-accent" />
                                        </div>

                                        <p className="font-semibold text-sm text-foreground">
                                            {title}
                                        </p>

                                        <p className="text-xs text-muted mt-1">
                                            {text}
                                        </p>
                                    </div>
                                )
                            )}
                        </div>

                        {/* PURCHASE MODULE */}

                        <div
                            className="
                                mt-7
                                rounded-2xl
                                border
                                border-border
                                bg-surface/70
                                backdrop-blur-xl
                                p-4
                            "
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                                        Quantity
                                    </p>

                                    <div
                                        className="
                                            flex
                                            items-center
                                            mt-2
                                            rounded-xl
                                            border
                                            border-border
                                            bg-surface-dark
                                            overflow-hidden
                                        "
                                    >
                                        <button
                                            type="button"
                                            disabled={
                                                quantity <= 1 ||
                                                !isActive ||
                                                !isInStock
                                            }
                                            onClick={() =>
                                                setQuantity(
                                                    (prev) =>
                                                        Math.max(
                                                            1,
                                                            prev - 1
                                                        )
                                                )
                                            }
                                            className="
                                                h-11
                                                w-11
                                                flex
                                                items-center
                                                justify-center
                                                text-muted
                                                hover:text-foreground
                                                hover:bg-surface-hover
                                                transition
                                                disabled:opacity-30
                                                disabled:cursor-not-allowed
                                            "
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>

                                        <input
                                            type="number"
                                            id="quantity"
                                            min="1"
                                            max={
                                                stockQuantity
                                            }
                                            value={
                                                quantity
                                            }
                                            disabled={
                                                !isActive ||
                                                !isInStock
                                            }
                                            onChange={(
                                                e
                                            ) => {
                                                const value =
                                                    Number(
                                                        e
                                                            .target
                                                            .value
                                                    );

                                                if (
                                                    Number.isNaN(
                                                        value
                                                    )
                                                ) {
                                                    return;
                                                }

                                                setQuantity(
                                                    Math.min(
                                                        Math.max(
                                                            1,
                                                            value
                                                        ),
                                                        stockQuantity
                                                    )
                                                );
                                            }}
                                            className="
                                                w-14
                                                h-11
                                                text-center
                                                bg-transparent
                                                text-sm
                                                font-bold
                                                text-foreground
                                                outline-none
                                                border-x
                                                border-border
                                            "
                                        />

                                        <button
                                            type="button"
                                            disabled={
                                                !isActive ||
                                                !isInStock ||
                                                quantity >=
                                                    stockQuantity
                                            }
                                            onClick={() =>
                                                setQuantity(
                                                    (prev) =>
                                                        Math.min(
                                                            prev +
                                                                1,
                                                            stockQuantity
                                                        )
                                                )
                                            }
                                            className="
                                                h-11
                                                w-11
                                                flex
                                                items-center
                                                justify-center
                                                text-muted
                                                hover:text-foreground
                                                hover:bg-surface-hover
                                                transition
                                                disabled:opacity-30
                                                disabled:cursor-not-allowed
                                            "
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="text-left sm:text-right">
                                    <p className="text-xs text-muted">
                                        Total
                                    </p>

                                    <p className="text-2xl font-bold text-success mt-1">
                                        {selectedVariant?.price !=
                                        null
                                            ? `${(
                                                  discountedPrice *
                                                  quantity
                                              ).toFixed(
                                                  2
                                              )} DH`
                                            : "—"}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                disabled={
                                    !selectedVariant ||
                                    !selectedVariant.is_active ||
                                    !isInStock ||
                                    isAddingToCart
                                }
                                onClick={() =>
                                    addItem({
                                        variant_id:
                                            selectedVariant.id,
                                        quantity,
                                    })
                                }
                                className="
                                    mt-4
                                    w-full
                                    bg-accent
                                    border
                                    border-accent-hover
                                    p-3.5
                                    text-base
                                    text-inverse
                                    font-bold
                                    text-center
                                    rounded-xl
                                    hover:bg-accent-hover
                                    hover:-translate-y-0.5
                                    duration-300
                                    cursor-pointer
                                    shadow-product
                                    disabled:opacity-40
                                    disabled:cursor-not-allowed
                                    disabled:hover:translate-y-0
                                "
                            >
                                {isAddingToCart
                                    ? "Adding..."
                                    : isInCart
                                    ? "Add Quantity"
                                    : "Add to Cart"}
                            </button>

                            {isCartError && (
                                <div className="mt-3 px-3 py-2.5 rounded-xl bg-danger/10 border border-danger/30">
                                    <p className="text-danger text-sm text-center">
                                        {
                                            cartError?.message
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* =====================================================
                    SPECIFICATIONS
                ===================================================== */}

                <section
                    className="
                        w-full
                        max-w-6xl
                        mx-auto
                        px-6
                        lg:px-8
                        py-24
                    "
                >
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="h-px w-8 bg-accent" />

                            <p className="text-accent font-semibold tracking-[0.2em] text-xs">
                                TECHNICAL DETAILS
                            </p>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                            Specifications
                        </h2>

                        <p className="text-muted mt-3">
                            Everything you need to know
                            about {product?.name}.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Object.entries(
                            product?.specifications ?? {}
                        ).length > 0 ? (
                            Object.entries(
                                product.specifications
                            ).map(
                                ([key, value]) => (
                                    <div
                                        key={key}
                                        className="
                                            group
                                            rounded-2xl
                                            border
                                            border-border-soft
                                            bg-card/60
                                            backdrop-blur-xl
                                            p-5
                                            transition-all
                                            duration-300
                                            hover:-translate-y-1
                                            hover:border-border
                                            hover:bg-card
                                            hover:shadow-product
                                        "
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <p
                                                className="
                                                    text-xs
                                                    font-bold
                                                    uppercase
                                                    tracking-wider
                                                    text-muted
                                                "
                                            >
                                                {key.replaceAll(
                                                    "_",
                                                    " "
                                                )}
                                            </p>

                                            <Check className="w-4 h-4 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>

                                        <p
                                            className="
                                                text-base
                                                sm:text-lg
                                                font-semibold
                                                text-foreground
                                                capitalize
                                                mt-3
                                            "
                                        >
                                            {String(value)}
                                        </p>
                                    </div>
                                )
                            )
                        ) : (
                            <div className="col-span-full py-12 text-center rounded-2xl border border-border-soft bg-card/40">
                                <p className="text-muted">
                                    No specifications
                                    available.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* =====================================================
                    REVIEWS
                ===================================================== */}

                <section
                    className="
                        w-full
                        max-w-6xl
                        mx-auto
                        px-6
                        lg:px-8
                        pb-24
                    "
                >
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="h-px w-8 bg-highlight" />

                            <p className="text-highlight font-semibold tracking-[0.2em] text-xs">
                                CUSTOMER FEEDBACK
                            </p>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                            Reviews
                        </h2>

                        <p className="text-muted mt-3">
                            See what customers think
                            about {product?.name}.
                        </p>
                    </div>

                    {/* RATING SUMMARY */}

                    <div
                        className="
                            border
                            border-border
                            rounded-3xl
                            bg-card/70
                            backdrop-blur-xl
                            overflow-hidden
                            mb-8
                        "
                    >
                        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr]">
                            <div className="p-7 md:p-8 bg-surface/50 border-b md:border-b-0 md:border-r border-border">
                                <p className="text-xs font-bold uppercase tracking-wider text-muted">
                                    Overall rating
                                </p>

                                <div className="flex items-end gap-2 mt-4">
                                    <p className="text-5xl font-bold text-foreground">
                                        {averageRating.toFixed(
                                            1
                                        )}
                                    </p>

                                    <span className="text-muted text-sm mb-2">
                                        / 5
                                    </span>
                                </div>

                                <div className="flex mt-3">
                                    {Array.from({
                                        length: 5,
                                    }).map(
                                        (_, index) => (
                                            <FaStar
                                                key={
                                                    index
                                                }
                                                className={`
                                                    text-lg
                                                    ${
                                                        index <
                                                        Math.round(
                                                            averageRating
                                                        )
                                                            ? "text-highlight"
                                                            : "text-muted/20"
                                                    }
                                                `}
                                            />
                                        )
                                    )}
                                </div>
                            </div>

                            <div className="p-7 md:p-8 flex flex-col justify-center">
                                <p className="text-xl font-semibold text-foreground">
                                    {reviewCount}{" "}
                                    {reviewCount === 1
                                        ? "review"
                                        : "reviews"}
                                </p>

                                <p className="text-muted mt-1">
                                    Customer ratings and
                                    feedback
                                </p>

                                <div className="flex items-center gap-2 mt-5">
                                    <div className="w-2 h-2 rounded-full bg-success" />

                                    <span className="text-xs text-muted">
                                        Verified customer
                                        feedback
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* REVIEW LIST */}

                    <div className="flex flex-col gap-3 mb-8">
                        {reviewsLoading && (
                            <div className="border border-border rounded-2xl bg-card/60 p-8 text-center">
                                <p className="text-muted">
                                    Loading reviews...
                                </p>
                            </div>
                        )}

                        {reviewsError && (
                            <div className="border border-danger/30 rounded-2xl bg-danger/10 p-8 text-center">
                                <p className="text-danger">
                                    Failed to load reviews.
                                </p>
                            </div>
                        )}

                        {!reviewsLoading &&
                            !reviewsError &&
                            reviews.length === 0 && (
                                <div className="border border-border rounded-2xl bg-card/60 p-8 text-center">
                                    <div className="w-10 h-10 rounded-xl bg-surface border border-border-soft flex items-center justify-center mx-auto mb-3">
                                        <Package className="w-5 h-5 text-muted" />
                                    </div>

                                    <p className="text-muted">
                                        No reviews yet.
                                    </p>
                                </div>
                            )}

                        {!reviewsLoading &&
                            !reviewsError &&
                            reviews.map(
                                (reviewItem) => (
                                    <article
                                        key={
                                            reviewItem.id
                                        }
                                        className="
                                            group
                                            border
                                            border-border-soft
                                            rounded-2xl
                                            bg-card/60
                                            backdrop-blur-xl
                                            p-6
                                            transition-all
                                            duration-300
                                            hover:bg-card
                                            hover:border-border
                                            hover:shadow-product
                                        "
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-surface border border-border-soft flex items-center justify-center">
                                                        <span className="text-xs font-bold text-accent">
                                                            {(
                                                                reviewItem
                                                                    .user
                                                                    ?.username ??
                                                                "A"
                                                            )
                                                                .charAt(
                                                                    0
                                                                )
                                                                .toUpperCase()}
                                                        </span>
                                                    </div>

                                                    <p className="font-bold text-base text-foreground truncate">
                                                        {
                                                            reviewItem
                                                                .user
                                                                ?.username
                                                        }
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-1.5 mt-3">
                                                    {Array.from(
                                                        {
                                                            length: 5,
                                                        }
                                                    ).map(
                                                        (
                                                            _,
                                                            index
                                                        ) => (
                                                            <FaStar
                                                                key={
                                                                    index
                                                                }
                                                                className={`
                                                                    w-3.5
                                                                    h-3.5
                                                                    ${
                                                                        index <
                                                                        Number(
                                                                            reviewItem.rating
                                                                        )
                                                                            ? "text-highlight"
                                                                            : "text-muted/20"
                                                                    }
                                                                `}
                                                            />
                                                        )
                                                    )}

                                                    <span className="ml-1 text-xs font-semibold text-muted">
                                                        {
                                                            reviewItem.rating
                                                        }
                                                        /5
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2 shrink-0">
                                                {reviewItem.created_at && (
                                                    <span className="text-xs text-muted">
                                                        {new Date(
                                                            reviewItem.created_at
                                                        ).toLocaleDateString()}
                                                    </span>
                                                )}

                                                {currentUser?.id ===
                                                    reviewItem
                                                        .user
                                                        ?.id && (
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            aria-label="Edit review"
                                                            disabled={
                                                                isUpdateReviewPending ||
                                                                isDeleteReviewPending
                                                            }
                                                            onClick={() =>
                                                                handleEditReview(
                                                                    reviewItem
                                                                )
                                                            }
                                                            className="
                                                                w-8
                                                                h-8
                                                                flex
                                                                items-center
                                                                justify-center
                                                                rounded-lg
                                                                text-muted
                                                                border
                                                                border-transparent
                                                                cursor-pointer
                                                                transition-all
                                                                duration-200
                                                                hover:text-accent
                                                                hover:bg-accent/10
                                                                hover:border-accent/20
                                                                disabled:opacity-40
                                                                disabled:cursor-not-allowed
                                                            "
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            aria-label="Delete review"
                                                            disabled={
                                                                isDeleteReviewPending ||
                                                                isUpdateReviewPending
                                                            }
                                                            onClick={() =>
                                                                deleteReview(
                                                                    reviewItem.id
                                                                )
                                                            }
                                                            className="
                                                                w-8
                                                                h-8
                                                                flex
                                                                items-center
                                                                justify-center
                                                                rounded-lg
                                                                text-danger
                                                                border
                                                                border-transparent
                                                                cursor-pointer
                                                                transition-all
                                                                duration-200
                                                                hover:bg-danger/10
                                                                hover:border-danger/20
                                                                disabled:opacity-40
                                                                disabled:cursor-not-allowed
                                                            "
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-5 pt-5 border-t border-border-soft">
                                            <p className="text-foreground/80 leading-7">
                                                {
                                                    reviewItem.review
                                                }
                                            </p>
                                        </div>
                                    </article>
                                )
                            )}
                    </div>

                    {/* REVIEW FORM */}

                    <div
                        className="
                            rounded-2xl
                            border
                            border-border
                            bg-card/60
                            backdrop-blur-xl
                            p-4
                            md:p-5
                        "
                    >
                        {isEditing && (
                            <div className="flex items-center justify-between px-1 mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-accent" />

                                    <p className="text-sm font-semibold text-foreground">
                                        Editing your review
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        handleCancelEdit
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-1.5
                                        text-sm
                                        text-muted
                                        hover:text-foreground
                                        transition-colors
                                        cursor-pointer
                                    "
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </button>
                            </div>
                        )}

                        {/* RATING */}

                        <div
                            className="
                                flex
                                flex-wrap
                                items-center
                                justify-between
                                gap-4
                                bg-surface
                                rounded-xl
                                border
                                border-border-soft
                                px-4
                                py-3
                            "
                        >
                            <div className="flex items-center gap-3">
                                <p className="text-sm font-semibold text-muted">
                                    Your rating
                                </p>

                                <div className="flex items-center gap-1">
                                    {Array.from({
                                        length: 5,
                                    }).map(
                                        (
                                            _,
                                            index
                                        ) => {
                                            const value =
                                                index +
                                                1;

                                            return (
                                                <button
                                                    key={
                                                        value
                                                    }
                                                    type="button"
                                                    disabled={
                                                        hasReviewed &&
                                                        !isEditing
                                                    }
                                                    onClick={() =>
                                                        setRating(
                                                            value
                                                        )
                                                    }
                                                    className={`
                                                        transition-transform
                                                        duration-200
                                                        ${
                                                            hasReviewed &&
                                                            !isEditing
                                                                ? "cursor-not-allowed opacity-50"
                                                                : "cursor-pointer hover:scale-110"
                                                        }
                                                    `}
                                                >
                                                    <FaStar
                                                        className={`
                                                            w-5
                                                            h-5
                                                            ${
                                                                value <=
                                                                rating
                                                                    ? "text-highlight"
                                                                    : "text-muted/30"
                                                            }
                                                        `}
                                                    />
                                                </button>
                                            );
                                        }
                                    )}
                                </div>
                            </div>

                            {rating > 0 && (
                                <span className="text-sm font-bold text-highlight">
                                    {rating}/5
                                </span>
                            )}
                        </div>

                        {/* INPUT */}

                        <div
                            className="
                                relative
                                w-full
                                mt-3
                                bg-surface
                                rounded-xl
                                border
                                border-border-soft
                                hover:border-border
                                focus-within:border-accent/60
                                duration-300
                                ease-in-out
                            "
                        >
                            <input
                                id="review"
                                ref={inputRef}
                                type="text"
                                value={review}
                                onChange={(e) =>
                                    setReview(
                                        e.target.value
                                    )
                                }
                                placeholder={
                                    isEditing
                                        ? "Edit your review..."
                                        : "Write your review..."
                                }
                                disabled={
                                    !currentUser ||
                                    (hasReviewed &&
                                        !isEditing)
                                }
                                className="
                                    w-full
                                    rounded-xl
                                    bg-transparent
                                    py-3.5
                                    pl-4
                                    pr-14
                                    font-semibold
                                    text-foreground
                                    outline-none
                                    placeholder:text-muted
                                "
                            />

                            <button
                                type="button"
                                disabled={
                                    (hasReviewed &&
                                        !isEditing) ||
                                    isReviewPending ||
                                    isUpdateReviewPending ||
                                    !review.trim() ||
                                    rating === 0
                                }
                                className="
                                    absolute
                                    right-2
                                    top-1/2
                                    -translate-y-1/2
                                    w-9
                                    h-9
                                    flex
                                    items-center
                                    justify-center
                                    rounded-lg
                                    bg-accent
                                    border
                                    border-accent-hover
                                    text-inverse
                                    cursor-pointer
                                    transition-all
                                    duration-300
                                    hover:bg-accent-hover
                                    hover:scale-105
                                    active:scale-95
                                    disabled:opacity-40
                                    disabled:cursor-not-allowed
                                    disabled:hover:scale-100
                                "
                                onClick={
                                    handleSubmitReview
                                }
                            >
                                {isReviewPending ||
                                isUpdateReviewPending ? (
                                    <span className="text-xs">
                                        ...
                                    </span>
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                            </button>
                        </div>

                        {/* STATUS */}

                        {!isEditing &&
                            hasReviewed && (
                                <p className="text-xs text-muted px-1 mt-3">
                                    You have already reviewed
                                    this product. Click Edit
                                    on your review to make
                                    changes.
                                </p>
                            )}

                        {isEditing && (
                            <p className="text-xs text-muted px-1 mt-3">
                                Your changes will update your
                                existing review.
                            </p>
                        )}
                    </div>
                </section>

                <Footer />
            </section>
        </main>
    );
}

export default ProductPage;
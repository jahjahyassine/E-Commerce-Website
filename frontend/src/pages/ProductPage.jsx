import { useNavigate, useParams } from "react-router-dom";
import DotField from "../components/animation/DotField";
import Navbar from "../components/Navbar";

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
} from "lucide-react";

import getCurrentUser from "../hooks/CurrentUser";

function ProductPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const token = localStorage.getItem("access_token");
    const queryClient = useQueryClient();

    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const [quantity, setQuantity] = useState(1);
    const [selectedAttributes, setSelectedAttributes] = useState({});
    const [review, setReview] = useState("");
    const [rating, setRating] = useState(0);

    // Review editing state
    const [editingReviewId, setEditingReviewId] = useState(null);

    const inputRef = useRef(null);

    /* =========================================================
       NAVIGATION
    ========================================================= */

    const updateCategory = (category) => {
        navigate(`/products?category=${category}`);
    };

    /* =========================================================
       CURRENT USER
    ========================================================= */

    const {
        data: currentUser,
        isLoading: isLoadingUser,
        isError: isErrorUser,
    } = useQuery({
        queryKey: ["user"],
        queryFn: getCurrentUser,
        enabled: !!token,
    });

    /* =========================================================
       PRODUCT
    ========================================================= */

    const getProductDetails = async () => {
        const response = await fetch(
            `${BASE_URL}/products/${id}`
        );

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
        data: productVariantsData,
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
       USER'S REVIEW
    ========================================================= */

    const getUserRating = async () => {
        const response = await fetch(
            `${BASE_URL}/reviews/${id}/user/${currentUser.id}`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch user review");
        }

        return response.json();
    };

    const {
        data: userReview,
    } = useQuery({
        queryKey: [
            "products",
            id,
            "reviews",
            currentUser?.id,
        ],
        queryFn: getUserRating,
        enabled: !!id && !!currentUser?.id,
    });

    useEffect(() => {
        if (userReview && editingReviewId === null) {
            setRating(userReview.rating ?? 0);
        }
    }, [userReview, editingReviewId]);

    /* =========================================================
       CART
    ========================================================= */

    const getCartItems = async () => {
        const response = await fetch(
            `${BASE_URL}/cart`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

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

    const addToCart = async ({ variant_id, quantity }) => {
        const token = localStorage.getItem("access_token");

        if (!token) {
            navigate("/login");
            return;
        }

        const response = await fetch(
            `${BASE_URL}/cart`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    variant_id,
                    quantity,
                }),
            }
        );

        if (!response.ok) {
            const error = await response.json();

            throw new Error(
                error.detail ||
                "Failed to add item to cart"
            );
        }

        return response.json();
    };

    const {
        mutate: addItem,
        isPending,
        isError,
        error,
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

    const attributeOptions = useMemo(() => {
        const attributes = {};

        productVariantsData?.forEach((variant) => {
            Object.entries(
                variant.attributes || {}
            ).forEach(([key, value]) => {
                if (!attributes[key]) {
                    attributes[key] = [];
                }

                if (
                    !attributes[key].includes(value)
                ) {
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
            ([selectedKey]) =>
                selectedKey !== key
        );

        return productVariantsData.some(
            (variant) => {
                if (
                    variant.attributes?.[key] !==
                    value
                ) {
                    return false;
                }

                return otherAttributes.every(
                    ([otherKey, otherValue]) =>
                        variant.attributes?.[
                        otherKey
                        ] === otherValue
                );
            }
        );
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

    const media = selectedVariant?.media?.length
        ? selectedVariant.media
        : product?.media ?? [];

    const currentCategory = product?.category;

    const isInStock =
        selectedVariant?.inventory?.quantity > 0;

    const stockQuantity =
        selectedVariant?.inventory?.quantity;

    const isActive =
        selectedVariant?.is_active === true;

    const isInCart =
        cart?.items?.some(
            (item) =>
                item.product_variant.id ===
                selectedVariant?.id
        ) ?? false;

    const averageRating = Number(
        product?.average_rating ?? 0
    );

    const reviewCount =
        product?.count_reviews ?? reviews.length;

    const fullStars = Math.floor(averageRating);

    const originalPrice = Number(selectedVariant?.price ?? 0);

    const discountPercentage = Number(
        selectedVariant?.discount_percentage ?? 0
    );

    const discountedPrice =
        discountPercentage > 0
            ? originalPrice * (1 - discountPercentage / 100)
            : originalPrice;

    /* =========================================================
       REVIEW STATUS
    ========================================================= */

    const hasReviewed = reviews.some(
        (review) =>
            String(review?.user?.id) ===
            String(currentUser?.id)
    );

    const isEditing = editingReviewId !== null;

    /* =========================================================
       CREATE REVIEW
    ========================================================= */

    const createReviewFunction = async (
        reviewData
    ) => {
        const response = await fetch(
            `${BASE_URL}/reviews`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify(reviewData),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail ||
                "Failed to create review"
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
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify(reviewData),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail ||
                "Failed to update review"
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

    const deleteReviewFunction = async (
        reviewId
    ) => {
        const response = await fetch(
            `${BASE_URL}/reviews/${reviewId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type":
                        "application/json",
                },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail ||
                "Failed to delete review"
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

    /* =========================================================
       CANCEL EDIT
    ========================================================= */

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
                    product_id: id
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
       LOADING / ERROR
    ========================================================= */

    if (productLoading || variantsLoading) {
        return (
            <main className="min-h-screen w-full flex items-center justify-center font-sans">
                <p className="text-muted text-lg">
                    Loading product...
                </p>
            </main>
        );
    }

    if (productError || variantsError) {
        return (
            <main className="min-h-screen w-full flex flex-col gap-4 items-center justify-center font-sans">
                <p className="text-minimal-red text-lg">
                    Failed to load product.
                </p>

                <button
                    onClick={() =>
                        navigate("/products")
                    }
                    className="px-5 py-2 rounded-xl bg-primary text-inverse"
                >
                    Back to Products
                </button>
            </main>
        );
    }

    /* =========================================================
       RENDER
    ========================================================= */

    return (
        <main className="min-h-screen w-full font-sans">
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

            <section className="relative z-10 pt-20 pb-8 px-6">

                {/* =====================================================
                    CATEGORIES
                ===================================================== */}

                <div className="w-full flex justify-between p-4 border-t border-b mb-6">
                    <button
                        onClick={() =>
                            navigate("/products")
                        }
                        className="cursor-pointer text-muted hover:text-foreground duration-300"
                    >
                        All Categories
                    </button>

                    <button
                        onClick={() =>
                            updateCategory(
                                "laptops"
                            )
                        }
                        className={`
                            cursor-pointer
                            hover:text-foreground
                            duration-300
                            ${currentCategory ===
                                "laptops"
                                ? "text-foreground"
                                : "text-muted"
                            }
                        `}
                    >
                        Laptops
                    </button>

                    <button
                        onClick={() =>
                            updateCategory(
                                "smartphones"
                            )
                        }
                        className={`
                            cursor-pointer
                            hover:text-foreground
                            duration-300
                            ${currentCategory ===
                                "smartphones"
                                ? "text-foreground"
                                : "text-muted"
                            }
                        `}
                    >
                        Smartphones
                    </button>

                    <button
                        onClick={() =>
                            updateCategory(
                                "gaming"
                            )
                        }
                        className={`
                            cursor-pointer
                            hover:text-foreground
                            duration-300
                            ${currentCategory ===
                                "gaming"
                                ? "text-foreground"
                                : "text-muted"
                            }
                        `}
                    >
                        Gaming
                    </button>

                    <button
                        onClick={() =>
                            updateCategory(
                                "audio"
                            )
                        }
                        className={`
                            cursor-pointer
                            hover:text-foreground
                            duration-300
                            ${currentCategory ===
                                "audio"
                                ? "text-foreground"
                                : "text-muted"
                            }
                        `}
                    >
                        Audio
                    </button>

                    <button
                        onClick={() =>
                            updateCategory(
                                "accessories"
                            )
                        }
                        className={`
                            cursor-pointer
                            hover:text-foreground
                            duration-300
                            ${currentCategory ===
                                "accessories"
                                ? "text-foreground"
                                : "text-muted"
                            }
                        `}
                    >
                        Accessories
                    </button>

                    <button
                        onClick={() =>
                            updateCategory(
                                "components"
                            )
                        }
                        className={`
                            cursor-pointer
                            hover:text-foreground
                            duration-300
                            ${currentCategory ===
                                "components"
                                ? "text-foreground"
                                : "text-muted"
                            }
                        `}
                    >
                        Components
                    </button>
                </div>

                {/* =====================================================
                    PRODUCT
                ===================================================== */}

                <section className="w-full flex items-start gap-6">

                    {/* PRODUCT MEDIA */}

                    <div className="w-[40vw] max-w-[650px] min-w-[400px] shrink-0">
                        <div className="w-full aspect-square overflow-x-auto flex border bg-card/70 rounded-3xl backdrop-blur-xl scrollbar-none scroll-smooth">

                            {media.length > 0 ? (
                                media.map(
                                    (
                                        image,
                                        index
                                    ) => (
                                        <div
                                            key={index}
                                            className="relative min-w-full aspect-square"
                                        >
                                            <img
                                                src={
                                                    image.media_url
                                                }
                                                alt={`${product?.name} image ${index +
                                                    1
                                                    }`}
                                                className="w-full h-full object-cover"
                                            />

                                            <p className="absolute top-0 left-1/2 -translate-x-1/2 bg-white/20 border border-border backdrop-blur-xl px-3 py-1 rounded-xl mt-1 text-muted">
                                                {index +
                                                    1}{" "}
                                                /{" "}
                                                {
                                                    media.length
                                                }
                                            </p>
                                        </div>
                                    )
                                )
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <p className="text-muted">
                                        No image
                                        available
                                    </p>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* PRODUCT INFORMATION */}

                    <div className="flex-1 gap-2 flex flex-col min-w-0">

                        <div>
                            <p className="font-cormorant text-muted font-bold tracking-wider">
                                {
                                    product
                                        ?.brand
                                        ?.name
                                }
                            </p>

                            <h2 className="text-5xl font-bold text-foreground">
                                {product?.name}
                            </h2>
                        </div>

                        {/* RATING */}

                        <div className="flex items-center">
                            {Array.from({
                                length: fullStars,
                            }).map(
                                (_, index) => (
                                    <FaStar
                                        key={
                                            index
                                        }
                                        className="text-minimal-yellow text-xl"
                                    />
                                )
                            )}

                            <p className="pl-1 text-minimal-yellow">
                                {averageRating.toFixed(
                                    1
                                )}
                            </p>

                            <p className="pl-2 text-muted">
                                ({reviewCount}{" "}
                                reviews)
                            </p>
                        </div>

                        {/* PRICE */}

                        <div className="mt-5 flex items-end gap-4">
                            <div className="flex items-end gap-3">
                                <p className="text-emerald text-4xl font-bold">
                                    {selectedVariant?.price != null
                                        ? `$${discountedPrice.toFixed(2)}`
                                        : "Price unavailable"}
                                </p>

                                {discountPercentage > 0 && (
                                    <>
                                        <p className="text-muted text-xl font-semibold line-through mb-1">
                                            ${originalPrice.toFixed(2)}
                                        </p>

                                        <span className="bg-minimal-red/10 text-minimal-red px-2 py-1 rounded-lg text-sm font-bold mb-1">
                                            -{discountPercentage}%
                                        </span>
                                    </>
                                )}
                            </div>

                            <div className="text-muted text-md font-bold mb-1">
                                {!selectedVariant ? (
                                    <span className="text-minimal-red">
                                        Combination unavailable
                                    </span>
                                ) : isInStock && isActive ? (
                                    <span>
                                        Available
                                    </span>
                                ) : (
                                    <span className="text-minimal-red">
                                        Out of Stock
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* DESCRIPTION */}

                        <div className="border-t border-b border-border/80 mt-5 text-foreground/80 py-3">
                            {
                                product?.description
                            }
                        </div>

                        {/* ATTRIBUTES */}

                        <div className="flex flex-col gap-4 mt-2">
                            {Object.entries(
                                attributeOptions
                            ).map(
                                ([
                                    key,
                                    values,
                                ]) => (
                                    <div
                                        key={
                                            key
                                        }
                                        className="flex items-center justify-between gap-4"
                                    >
                                        <p className="text-md font-bold text-muted">
                                            {key.toUpperCase()}
                                        </p>

                                        <div className="flex gap-2 flex-wrap justify-end">
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
                                                                py-2 px-3
                                                                rounded-md
                                                                border
                                                                border-border
                                                                transition
                                                                duration-200
                                                                ${selected
                                                                    ? "bg-primary text-inverse"
                                                                    : "bg-card/20 hover:bg-foreground/10"
                                                                }
                                                                ${!available
                                                                    ? "opacity-30 cursor-not-allowed line-through"
                                                                    : "cursor-pointer"
                                                                }
                                                            `}
                                                        >
                                                            {
                                                                value
                                                            }
                                                        </button>
                                                    );
                                                }
                                            )}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>

                        {/* FEATURES */}

                        <div className="grid grid-cols-3 gap-3 mt-5">
                            <div className="bg-card/60 border border-border rounded-2xl p-4">
                                <p className="font-semibold">
                                    🚚 Delivery
                                </p>
                                <p className="text-sm text-muted">
                                    Fast shipping
                                </p>
                            </div>

                            <div className="bg-card/60 border border-border rounded-2xl p-4">
                                <p className="font-semibold">
                                    ↩ Returns
                                </p>
                                <p className="text-sm text-muted">
                                    30 days
                                </p>
                            </div>

                            <div className="bg-card/60 border border-border rounded-2xl p-4">
                                <p className="font-semibold">
                                    🛡 Warranty
                                </p>
                                <p className="text-sm text-muted">
                                    Official
                                    warranty
                                </p>
                            </div>
                        </div>

                        {/* QUANTITY */}

                        <div className="mt-6 flex items-center w-full justify-between">
                            <div className="flex items-center gap-5">
                                <label
                                    htmlFor="quantity"
                                    className="text-lg font-medium text-foreground"
                                >
                                    Quantity:
                                </label>

                                <div className="
                                    flex items-center
                                    rounded-2xl
                                    border border-border/60
                                    bg-card/60
                                    backdrop-blur-xl
                                    shadow-product
                                    overflow-hidden
                                ">

                                    <button
                                        type="button"
                                        disabled={
                                            quantity <=
                                            1 ||
                                            !selectedVariant?.is_active ||
                                            !isInStock
                                        }
                                        onClick={() =>
                                            setQuantity(
                                                (
                                                    prev
                                                ) =>
                                                    Math.max(
                                                        1,
                                                        prev -
                                                        1
                                                    )
                                            )
                                        }
                                        className="
                                            h-11 w-11
                                            flex items-center justify-center
                                            text-foreground
                                            transition
                                            hover:bg-foreground/10
                                            disabled:opacity-30
                                            disabled:cursor-not-allowed
                                        "
                                    >
                                        −
                                    </button>

                                    <input
                                        type="number"
                                        id="quantity"
                                        min="1"
                                        max={
                                            stockQuantity ??
                                            undefined
                                        }
                                        value={
                                            quantity
                                        }
                                        disabled={
                                            !selectedVariant?.is_active ||
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

                                            const maximum =
                                                stockQuantity ??
                                                Infinity;

                                            setQuantity(
                                                Math.min(
                                                    Math.max(
                                                        1,
                                                        value
                                                    ),
                                                    maximum
                                                )
                                            );
                                        }}
                                        className="
                                            w-14 h-11
                                            text-center
                                            bg-transparent
                                            text-lg
                                            font-semibold
                                            text-foreground
                                            outline-none
                                            border-x
                                            border-border/60
                                        "
                                    />

                                    <button
                                        type="button"
                                        disabled={
                                            !selectedVariant?.is_active ||
                                            !isInStock ||
                                            (
                                                stockQuantity !==
                                                null &&
                                                quantity >=
                                                stockQuantity
                                            )
                                        }
                                        onClick={() =>
                                            setQuantity(
                                                (
                                                    prev
                                                ) =>
                                                    stockQuantity !==
                                                        null
                                                        ? Math.min(
                                                            prev +
                                                            1,
                                                            stockQuantity
                                                        )
                                                        : prev +
                                                        1
                                            )
                                        }
                                        className="
                                            h-11 w-11
                                            flex items-center justify-center
                                            text-foreground
                                            transition
                                            hover:bg-foreground/10
                                            disabled:opacity-30
                                            disabled:cursor-not-allowed
                                        "
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <p className="text-2xl text-emerald font-bold">
                                {selectedVariant?.price != null
                                    ? `$${(discountedPrice * quantity).toFixed(2)}`
                                    : "—"}
                            </p>
                        </div>

                        {/* ADD TO CART */}

                        <button
                            type="button"
                            disabled={
                                !selectedVariant ||
                                !selectedVariant.is_active ||
                                !isInStock ||
                                isPending
                            }
                            onClick={() =>
                                addItem({
                                    variant_id:
                                        selectedVariant.id,
                                    quantity,
                                })
                            }
                            className="
                                mt-6
                                bg-primary
                                p-3
                                text-xl
                                text-inverse
                                font-bold
                                text-center
                                rounded-3xl
                                hover:scale-[1.02]
                                duration-300
                                cursor-pointer
                                shadow-product
                                disabled:opacity-40
                                disabled:cursor-not-allowed
                                disabled:hover:scale-100
                            "
                        >
                            {isPending
                                ? "Adding..."
                                : isInCart
                                    ? "In Cart"
                                    : "Add to Cart"}
                        </button>

                        {isError && (
                            <p className="text-minimal-red text-sm text-center mt-2">
                                {error.message}
                            </p>
                        )}
                    </div>
                </section>

                {/* =====================================================
                    SPECIFICATIONS
                ===================================================== */}

                <section className="w-full px-10 py-16">
                    <div className="max-w-5xl mx-auto">

                        <div className="mb-10">
                            <p className="text-muted font-cormorant font-bold tracking-widest">
                                TECHNICAL DETAILS
                            </p>

                            <h2 className="text-5xl font-bold text-foreground">
                                Specifications
                            </h2>

                            <p className="text-muted mt-2">
                                Everything you need to
                                know about{" "}
                                {product?.name}.
                            </p>
                        </div>

                        <div className="border border-border rounded-3xl overflow-hidden bg-card/50 backdrop-blur-xl">
                            {Object.entries(
                                product?.specifications ??
                                {}
                            ).map(
                                (
                                    [
                                        key,
                                        value,
                                    ],
                                    index,
                                    array
                                ) => (
                                    <div
                                        key={
                                            key
                                        }
                                        className={`
                                            flex items-center justify-between
                                            px-6 py-5
                                            ${index !==
                                                array.length -
                                                1
                                                ? "border-b border-border"
                                                : ""
                                            }
                                        `}
                                    >
                                        <p className="text-muted font-bold">
                                            {key
                                                .replaceAll(
                                                    "_",
                                                    " "
                                                )
                                                .toUpperCase()}
                                        </p>

                                        <p className="text-lg font-semibold text-foreground">
                                            {String(
                                                value
                                            )}
                                        </p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </section>

                {/* =====================================================
                    REVIEWS
                ===================================================== */}

                <section className="w-full px-10 py-16">
                    <div className="max-w-6xl mx-auto">

                        <div className="mb-10">
                            <p className="text-muted font-cormorant font-bold tracking-widest">
                                CUSTOMER FEEDBACK
                            </p>

                            <h2 className="text-5xl font-bold text-foreground">
                                Reviews
                            </h2>

                            <p className="text-muted mt-2">
                                See what customers think
                                about{" "}
                                {product?.name}.
                            </p>
                        </div>

                        {/* OVERALL RATING */}

                        <div className="border border-border rounded-3xl bg-card/60 backdrop-blur-xl p-8 mb-8">
                            <div className="flex items-center gap-6">

                                <div>
                                    <p className="text-6xl font-bold text-foreground">
                                        {averageRating.toFixed(
                                            1
                                        )}
                                    </p>

                                    <div className="flex mt-3">
                                        {Array.from({
                                            length: 5,
                                        }).map(
                                            (
                                                _,
                                                index
                                            ) => (
                                                <FaStar
                                                    key={
                                                        index
                                                    }
                                                    className={
                                                        index <
                                                            fullStars
                                                            ? "text-minimal-yellow text-xl"
                                                            : "text-muted/30 text-xl"
                                                    }
                                                />
                                            )
                                        )}
                                    </div>
                                </div>

                                <div className="h-16 w-px bg-border" />

                                <div>
                                    <p className="text-lg font-semibold">
                                        {
                                            reviewCount
                                        }{" "}
                                        reviews
                                    </p>

                                    <p className="text-muted">
                                        Customer ratings
                                        and feedback
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* REVIEW LIST */}

                        <div className="flex flex-col gap-4 mb-8">

                            {reviewsLoading && (
                                <div className="
                                    border border-border
                                    rounded-3xl
                                    bg-card/60
                                    p-8
                                    text-center
                                ">
                                    <p className="text-muted">
                                        Loading reviews...
                                    </p>
                                </div>
                            )}

                            {reviewsError && (
                                <div className="
                                    border border-border
                                    rounded-3xl
                                    bg-card/60
                                    p-8
                                    text-center
                                ">
                                    <p className="text-minimal-red">
                                        Failed to load
                                        reviews.
                                    </p>
                                </div>
                            )}

                            {!reviewsLoading &&
                                !reviewsError &&
                                reviews.length ===
                                0 && (
                                    <div className="
                                        border border-border
                                        rounded-3xl
                                        bg-card/60
                                        p-8
                                        text-center
                                    ">
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
                                                border border-border
                                                rounded-3xl
                                                bg-card/60
                                                backdrop-blur-xl
                                                p-6
                                                transition-all
                                                duration-300
                                                hover:bg-card/80
                                            "
                                        >

                                            {/* REVIEW HEADER */}

                                            <div className="flex items-start justify-between gap-4">

                                                <div className="min-w-0">

                                                    <p className="font-bold text-lg text-foreground truncate">
                                                        {
                                                            reviewItem
                                                                .user
                                                                ?.username ??
                                                            "Anonymous"
                                                        }
                                                    </p>

                                                    <div className="flex items-center gap-1 mt-2">
                                                        {Array.from({
                                                            length: 5,
                                                        }).map(
                                                            (
                                                                _,
                                                                index
                                                            ) => (
                                                                <FaStar
                                                                    key={
                                                                        index
                                                                    }
                                                                    className={`
                                                                        w-4 h-4
                                                                        transition-colors
                                                                        duration-200
                                                                        ${index <
                                                                            Number(
                                                                                reviewItem.rating
                                                                            )
                                                                            ? "text-minimal-yellow"
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

                                                {/* DATE + ACTIONS */}

                                                <div className="flex flex-col items-center gap-2 shrink-0">

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
                                                            <div className="flex">

                                                                {/* EDIT */}

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
                                                                    w-8 h-8
                                                                    flex items-center justify-center
                                                                    rounded-lg
                                                                    text-muted
                                                                    cursor-pointer
                                                                    transition-all
                                                                    duration-200
                                                                    hover:text-foreground
                                                                    hover:scale-105
                                                                    active:scale-95
                                                                    disabled:opacity-40
                                                                    disabled:cursor-not-allowed
                                                                "
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                </button>

                                                                {/* DELETE */}

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
                                                                    w-8 h-8
                                                                    flex items-center justify-center
                                                                    rounded-lg
                                                                    text-danger
                                                                    cursor-pointer
                                                                    transition-all
                                                                    duration-200
                                                                    hover:bg-minimal-red/10
                                                                    hover:text-minimal-red
                                                                    hover:scale-105
                                                                    active:scale-95
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

                                            {/* REVIEW BODY */}

                                            <div className="mt-5 pt-5 border-t border-border/60">
                                                <p className="text-foreground/80 leading-relaxed">
                                                    {
                                                        reviewItem.review
                                                    }
                                                </p>
                                            </div>

                                        </article>
                                    )
                                )}
                        </div>

                        {/* =================================================
                            REVIEW FORM
                        ================================================= */}

                        <div className="flex flex-col gap-3">

                            {/* EDIT MODE HEADER */}

                            {isEditing && (
                                <div className="
                                    flex items-center justify-between
                                    px-4
                                ">
                                    <p className="text-sm font-semibold text-muted">
                                        Editing your review
                                    </p>

                                    <button
                                        type="button"
                                        onClick={
                                            handleCancelEdit
                                        }
                                        className="
                                            flex items-center gap-1
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

                            <div className="
                                flex
                                items-center
                                gap-3
                                bg-chip
                                rounded-xl
                                border
                                border-border-soft
                                px-4
                                py-3
                            ">
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
                                                        ${hasReviewed &&
                                                            !isEditing
                                                            ? "cursor-not-allowed opacity-50"
                                                            : "cursor-pointer hover:scale-110"
                                                        }
                                                    `}
                                                >
                                                    <FaStar
                                                        className={`
                                                            w-5 h-5
                                                            duration-200
                                                            ${value <=
                                                                rating
                                                                ? "text-minimal-yellow"
                                                                : "text-muted/30"
                                                            }
                                                        `}
                                                    />
                                                </button>
                                            );
                                        }
                                    )}
                                </div>

                                {rating > 0 && (
                                    <span className="text-sm font-semibold text-muted">
                                        {rating}/5
                                    </span>
                                )}
                            </div>

                            {/* REVIEW INPUT */}

                            <div className="
                                relative
                                w-full
                                bg-chip
                                rounded-xl
                                border
                                border-border-soft
                                hover:border-border
                                focus-within:border-border
                                duration-300
                                ease-in-out
                            ">

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
                                        (hasReviewed && !isEditing)
                                    }
                                    className="
                                        w-full
                                        rounded-xl
                                        bg-transparent
                                        py-3
                                        pl-4
                                        pr-14
                                        font-semibold
                                        outline-none
                                        placeholder:text-muted
                                    "
                                />

                                {/* SUBMIT */}

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
                                        bg-primary
                                        text-inverse
                                        cursor-pointer
                                        transition-all
                                        duration-300
                                        hover:bg-primary-hover
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
                                    <p className="text-xs text-muted px-2">
                                        You have already
                                        reviewed this
                                        product. Click
                                        Edit on your review
                                        to make changes.
                                    </p>
                                )}

                            {isEditing && (
                                <p className="text-xs text-muted px-2">
                                    Your changes will
                                    update your existing
                                    review.
                                </p>
                            )}
                        </div>
                    </div>
                </section>
            </section>
        </main>
    );
}

export default ProductPage;

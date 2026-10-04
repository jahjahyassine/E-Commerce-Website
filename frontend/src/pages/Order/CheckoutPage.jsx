import { useEffect, useState } from "react";

import DotField from "../../components/animation/DotField";
import Navbar from "../../components/Navbar";
import getCurrentUser from "../../hooks/CurrentUser";

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { useNavigate } from "react-router-dom";

const ADDRESS_STORAGE_KEY = "checkout_shipping_details";

function getStoredAddressInfo() {
    try {
        const raw = localStorage.getItem(ADDRESS_STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function CheckoutPage() {
    const token = localStorage.getItem("access_token");
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const BASE_URL =
        import.meta.env.VITE_BASE_URL || "http://localhost:8000";

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
            throw new Error(
                data.detail || "Failed to Retrieve Cart"
            );
        }

        return data;
    };

    const {
        data: cart,
        isLoading: isLoadingCart,
    } = useQuery({
        queryKey: ["cart"],
        queryFn: getCartItems,
        enabled: !!token,
    });

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
        if (isErrorUser) {
            navigate("/login");
        }
    }, [isErrorUser, navigate]);

    const [username, setUsername] = useState("");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [addressDefault, setAddressDefault] = useState(false);
    const [city, setCity] = useState("");
    const [cityDefault, setCityDefault] = useState(false);
    const [region, setRegion] = useState("");
    const [regionDefault, setRegionDefault] = useState(false);
    const [postalCode, setPostalCode] = useState("");
    const [postalCodeDefault, setPostalCodeDefault] =
        useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const infoSet =
        fullName !== "" &&
        phone !== "" &&
        address !== "" &&
        city !== "" &&
        region !== "";

    // --- Price / discount helpers ---
    const getVariantPrice = (item) =>
        Number(
            item.product_variant?.price ??
                item.price ??
                0
        );

    const getVariantDiscount = (item) =>
        Math.min(
            Math.max(
                Number(
                    item.product_variant
                        ?.discount_percentage ?? 0
                ),
                0
            ),
            100
        );

    const getItemDiscountedPrice = (item) => {
        const price = getVariantPrice(item);
        const discount = getVariantDiscount(item);

        return price * (1 - discount / 100);
    };

    const originalSubtotalAmount =
        cart?.items?.reduce((total, item) => {
            return (
                total +
                item.quantity * getVariantPrice(item)
            );
        }, 0) ?? 0;

    const subtotalAmount =
        cart?.items?.reduce((total, item) => {
            return (
                total +
                item.quantity *
                    getItemDiscountedPrice(item)
            );
        }, 0) ?? 0;

    const discountAmount =
        originalSubtotalAmount - subtotalAmount;

    const deliveryFee = subtotalAmount > 0 ? 10 : 0;
    const totalAmount = subtotalAmount + deliveryFee;

    // --- Update user information ---
    const updateUserInfosFunction = async (new_infos) => {
        const response = await fetch(`${BASE_URL}/profile`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(new_infos),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Failed to update Infos"
            );
        }

        return data;
    };

    const {
        mutate: updateUserInfos,
        error: errorPatch,
    } = useMutation({
        mutationFn: updateUserInfosFunction,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["user"],
            });
        },
    });

    // --- Load account info + address ---
    useEffect(() => {
        if (currentUser) {
            const stored = getStoredAddressInfo();

            setUsername(currentUser.username || "");
            setFullName(currentUser.full_name || "");
            setEmail(currentUser.email || "");
            setPhone(currentUser.phone || "");

            setAddress(
                stored.address ??
                    currentUser.address ??
                    ""
            );

            setCity(
                stored.city ??
                    currentUser.city ??
                    ""
            );

            setRegion(
                stored.region ??
                    currentUser.region ??
                    ""
            );

            setPostalCode(
                stored.postal_code ??
                    currentUser.postal_code ??
                    ""
            );
        }
    }, [currentUser]);

    const handleForm = async (e) => {
        e.preventDefault();

        const changedFields = {};

        if (username !== currentUser.username) {
            changedFields.username = username;
        }

        if (fullName !== currentUser.full_name) {
            changedFields.full_name = fullName;
        }

        if (email !== currentUser.email) {
            changedFields.email = email;
        }

        if (phone !== currentUser.phone) {
            changedFields.phone = phone;
        }

        if (
            address !== currentUser.address &&
            addressDefault
        ) {
            changedFields.address = address;
        }

        if (
            city !== currentUser.city &&
            cityDefault
        ) {
            changedFields.city = city;
        }

        if (
            region !== currentUser.region &&
            regionDefault
        ) {
            changedFields.region = region;
        }

        if (
            postalCode !== currentUser.postal_code &&
            postalCodeDefault
        ) {
            changedFields.postal_code = postalCode;
        }

        // Persist non-default address fields locally
        const storedUpdate = {
            ...getStoredAddressInfo(),
        };

        if (addressDefault) {
            delete storedUpdate.address;
        } else {
            storedUpdate.address = address;
        }

        if (cityDefault) {
            delete storedUpdate.city;
        } else {
            storedUpdate.city = city;
        }

        if (regionDefault) {
            delete storedUpdate.region;
        } else {
            storedUpdate.region = region;
        }

        if (postalCodeDefault) {
            delete storedUpdate.postal_code;
        } else {
            storedUpdate.postal_code = postalCode;
        }

        localStorage.setItem(
            ADDRESS_STORAGE_KEY,
            JSON.stringify(storedUpdate)
        );

        if (Object.keys(changedFields).length === 0) {
            setIsEditing(false);
            return;
        }

        updateUserInfos(changedFields);
        setIsEditing(false);
    };

    const handleCancel = () => {
        const stored = getStoredAddressInfo();

        setUsername(currentUser.username || "");
        setFullName(currentUser.full_name || "");
        setEmail(currentUser.email || "");
        setPhone(currentUser.phone || "");

        setAddress(
            stored.address ??
                currentUser.address ??
                ""
        );

        setCity(
            stored.city ??
                currentUser.city ??
                ""
        );

        setRegion(
            stored.region ??
                currentUser.region ??
                ""
        );

        setPostalCode(
            stored.postal_code ??
                currentUser.postal_code ??
                ""
        );

        setIsEditing(false);
    };

    // --- Create order ---
    const createOrder = async (orderData) => {
        const response = await fetch(`${BASE_URL}/orders`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(orderData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Failed to Place Order"
            );
        }

        return data;
    };

    const {
        mutate: placeOrder,
        isPending: isPlacingOrder,
        error: orderError,
    } = useMutation({
        mutationFn: createOrder,

        onSuccess: (order) => {
            queryClient.invalidateQueries({
                queryKey: ["cart"],
            });

            navigate(
                `/order-confirmation/${order.id}`
            );
        },
    });

    const handleOrder = () => {
        placeOrder({
            full_name: fullName,
            phone: phone,
            address: address,
            city: city,
            region: region,
            postal_code: postalCode,
        });
    };

    if (isLoadingCart || isLoadingUser) {
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
                        gradientFrom="#A8AEC040"
                        gradientTo="#6FA7A330"
                        glowColor="#6FA7A320"
                    />
                </div>

                <section className="relative z-10 min-h-screen flex items-center justify-center pt-20">
                    <p className="text-xl font-bold">
                        Loading...
                    </p>
                </section>
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
                    gradientFrom="#A8AEC040"
                    gradientTo="#6FA7A330"
                    glowColor="#6FA7A320"
                />
            </div>

            <section className="relative z-10 pt-20 px-4 sm:px-6 flex flex-col w-full max-w-6xl mx-auto gap-10 pb-10">
                <section className="w-full flex flex-col items-center">
    <h2
        className="
            text-3xl
            sm:text-4xl
            font-bold
            tracking-wider
            mb-6
            text-center
            text-foreground
        "
    >
        Checkout Details
    </h2>

    <div className="flex flex-wrap justify-center gap-4 sm:gap-8 mb-10">
        {/* STEP 1 — COMPLETED */}
        <div
            className="
                flex
                items-center
                gap-2
                min-w-[140px]
                sm:min-w-[180px]
                pb-4
                border-b
                border-accent/40
                cursor-pointer
                text-muted
                transition-all
                duration-300
                hover:text-foreground
            "
        >
            <p
                className="
                    flex
                    h-7
                    min-w-7
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-accent
                    bg-accent/10
                    px-2
                    text-sm
                    font-bold
                    text-accent
                "
            >
                ✓
            </p>

            <span className="font-medium">
                Shopping Cart
            </span>
        </div>

        {/* STEP 2 — ACTIVE */}
        <div
            className="
                flex
                items-center
                gap-2
                min-w-[140px]
                sm:min-w-[180px]
                pb-4
                border-b-2
                border-accent
                cursor-pointer
                text-foreground
            "
        >
            <p
                className="
                    flex
                    h-8
                    min-w-8
                    items-center
                    justify-center
                    rounded-full
                    bg-accent
                    px-2
                    text-sm
                    font-bold
                    text-inverse
                    shadow-[0_0_16px_rgba(79,179,191,0.35)]
                "
            >
                2
            </p>

            <span className="font-bold text-accent">
                Checkout Details
            </span>
        </div>

        {/* STEP 3 — UPCOMING */}
        <div
            className="
                flex
                items-center
                gap-2
                min-w-[140px]
                sm:min-w-[180px]
                pb-4
                border-b
                border-border
                cursor-pointer
                text-muted
            "
        >
            <p
                className="
                    flex
                    h-7
                    min-w-7
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-border
                    bg-surface
                    px-2
                    text-sm
                    font-semibold
                    text-muted
                "
            >
                3
            </p>

            <span className="font-medium">
                Order Complete
            </span>
        </div>
    </div>
</section>

                <section className="flex flex-col lg:flex-row gap-5">
                    <section className="h-full flex flex-col gap-2 flex-1 bg-card-dark rounded-3xl p-3">
                        <section className="m-auto border-b border-border w-full max-w-md">
                            <h3 className="text-xl text-center font-bold tracking-wide pb-2">
                                Delivery Information
                            </h3>
                        </section>

                        <section className="w-full h-full flex flex-col gap-4">
                            <form
                                onSubmit={handleForm}
                                className="mt-12 flex flex-col gap-4"
                            >
                                {/* Full Name + Phone */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col">
                                        <label
                                            htmlFor="fullName"
                                            className="text-sm font-bold text-muted px-1"
                                        >
                                            Full Name
                                        </label>

                                        <input
                                            id="fullName"
                                            type="text"
                                            placeholder="Enter your Name"
                                            required
                                            value={fullName}
                                            disabled={!isEditing}
                                            onChange={(e) =>
                                                setFullName(
                                                    e.target.value
                                                )
                                            }
                                            className="border border-border-soft rounded-xl bg-card text-base text-foreground font-semibold px-4 py-3 hover:border-border focus:border-accent focus:ring-2 focus:ring-accent/30 focus:outline-none transition-all duration-300 ease-in-out placeholder:text-subtle disabled:opacity-60 disabled:cursor-not-allowed"
                                        />
                                    </div>

                                    <div className="flex flex-col">
                                        <label
                                            htmlFor="phone"
                                            className="text-sm font-bold text-muted px-1"
                                        >
                                            Phone
                                        </label>

                                        <input
                                            id="phone"
                                            type="text"
                                            required
                                            placeholder="Enter your Phone number"
                                            value={phone}
                                            disabled={!isEditing}
                                            onChange={(e) =>
                                                setPhone(
                                                    e.target.value
                                                )
                                            }
                                            className="border border-border-soft rounded-xl bg-card text-base text-foreground font-semibold px-4 py-3 hover:border-border focus:border-accent focus:ring-2 focus:ring-accent/30 focus:outline-none transition-all duration-300 ease-in-out placeholder:text-subtle disabled:opacity-60 disabled:cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                <div className="flex flex-col">
                                    <label
                                        htmlFor="address"
                                        className="text-sm font-bold text-muted px-1"
                                    >
                                        Shipping Address
                                    </label>

                                    <input
                                        id="address"
                                        type="text"
                                        required
                                        placeholder="Enter your Shipping Address"
                                        value={address}
                                        disabled={!isEditing}
                                        onChange={(e) =>
                                            setAddress(
                                                e.target.value
                                            )
                                        }
                                        className="border border-border-soft rounded-xl bg-card text-base text-foreground font-semibold px-4 py-3 hover:border-border focus:border-accent focus:ring-2 focus:ring-accent/30 focus:outline-none transition-all duration-300 ease-in-out placeholder:text-subtle disabled:opacity-60 disabled:cursor-not-allowed"
                                    />

                                    <div className="flex items-center justify-end gap-2 mt-1 text-sm font-semibold">
                                        <input
                                            id="addressDefault"
                                            type="checkbox"
                                            disabled={!isEditing}
                                            checked={addressDefault}
                                            onChange={(e) =>
                                                setAddressDefault(
                                                    e.target.checked
                                                )
                                            }
                                            className="w-4 h-4 rounded border-border-soft accent-accent cursor-pointer"
                                        />

                                        <label
                                            htmlFor="addressDefault"
                                            className="text-muted cursor-pointer select-none"
                                        >
                                            Set as Default
                                        </label>
                                    </div>
                                </div>

                                {/* City + Region + Postal Code */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {/* City */}
                                    <div className="flex flex-col">
                                        <label
                                            htmlFor="city"
                                            className="text-sm font-bold text-muted px-1"
                                        >
                                            City
                                        </label>

                                        <input
                                            id="city"
                                            type="text"
                                            required
                                            placeholder="Enter Shipping City"
                                            value={city}
                                            disabled={!isEditing}
                                            onChange={(e) =>
                                                setCity(
                                                    e.target.value
                                                )
                                            }
                                            className="border border-border-soft rounded-xl bg-card text-base text-foreground font-semibold px-4 py-3 hover:border-border focus:border-accent focus:ring-2 focus:ring-accent/30 focus:outline-none transition-all duration-300 ease-in-out placeholder:text-subtle disabled:opacity-60 disabled:cursor-not-allowed"
                                        />

                                        <div className="flex items-center justify-end gap-2 mt-1 text-sm font-semibold">
                                            <input
                                                id="cityDefault"
                                                type="checkbox"
                                                disabled={!isEditing}
                                                checked={cityDefault}
                                                onChange={(e) =>
                                                    setCityDefault(
                                                        e.target
                                                            .checked
                                                    )
                                                }
                                                className="w-4 h-4 rounded border-border-soft accent-accent cursor-pointer"
                                            />

                                            <label
                                                htmlFor="cityDefault"
                                                className="text-muted cursor-pointer select-none"
                                            >
                                                Set as Default
                                            </label>
                                        </div>
                                    </div>

                                    {/* Region */}
                                    <div className="flex flex-col">
                                        <label
                                            htmlFor="region"
                                            className="text-sm font-bold text-muted px-1"
                                        >
                                            Region
                                        </label>

                                        <input
                                            id="region"
                                            type="text"
                                            required
                                            placeholder="Enter Shipping Region"
                                            value={region}
                                            disabled={!isEditing}
                                            onChange={(e) =>
                                                setRegion(
                                                    e.target.value
                                                )
                                            }
                                            className="border border-border-soft rounded-xl bg-card text-base text-foreground font-semibold px-4 py-3 hover:border-border focus:border-accent focus:ring-2 focus:ring-accent/30 focus:outline-none transition-all duration-300 ease-in-out placeholder:text-subtle disabled:opacity-60 disabled:cursor-not-allowed"
                                        />

                                        <div className="flex items-center justify-end gap-2 mt-1 text-sm font-semibold">
                                            <input
                                                id="regionDefault"
                                                type="checkbox"
                                                disabled={!isEditing}
                                                checked={regionDefault}
                                                onChange={(e) =>
                                                    setRegionDefault(
                                                        e.target
                                                            .checked
                                                    )
                                                }
                                                className="w-4 h-4 rounded border-border-soft accent-accent cursor-pointer"
                                            />

                                            <label
                                                htmlFor="regionDefault"
                                                className="text-muted cursor-pointer select-none"
                                            >
                                                Set as Default
                                            </label>
                                        </div>
                                    </div>

                                    {/* Postal Code */}
                                    <div className="flex flex-col">
                                        <label
                                            htmlFor="postalCode"
                                            className="text-sm font-bold text-muted px-1"
                                        >
                                            Postal Code
                                        </label>

                                        <input
                                            id="postalCode"
                                            type="text"
                                            required
                                            placeholder="Enter Postal Code"
                                            value={postalCode}
                                            disabled={!isEditing}
                                            onChange={(e) =>
                                                setPostalCode(
                                                    e.target.value
                                                )
                                            }
                                            className="border border-border-soft rounded-xl bg-card text-base text-foreground font-semibold px-4 py-3 hover:border-border focus:border-accent focus:ring-2 focus:ring-accent/30 focus:outline-none transition-all duration-300 ease-in-out placeholder:text-subtle disabled:opacity-60 disabled:cursor-not-allowed"
                                        />

                                        <div className="flex items-center justify-end gap-2 mt-1 text-sm font-semibold">
                                            <input
                                                id="postalCodeDefault"
                                                type="checkbox"
                                                disabled={!isEditing}
                                                checked={
                                                    postalCodeDefault
                                                }
                                                onChange={(e) =>
                                                    setPostalCodeDefault(
                                                        e.target
                                                            .checked
                                                    )
                                                }
                                                className="w-4 h-4 rounded border-border-soft accent-accent cursor-pointer"
                                            />

                                            <label
                                                htmlFor="postalCodeDefault"
                                                className="text-muted cursor-pointer select-none"
                                            >
                                                Set as Default
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div className="flex flex-col gap-3">
                                    <p className="text-sm font-bold text-muted px-1">
                                        Payment Method
                                    </p>

                                    <div className="flex items-center justify-between p-3 rounded-xl border border-border-soft bg-card">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-card-dark flex items-center justify-center">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="18"
                                                    height="18"
                                                    fill="currentColor"
                                                    viewBox="0 0 16 16"
                                                >
                                                    <path d="M3 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H3zm0 1h10a1 1 0 0 1 1 1v2H2V3a1 1 0 0 1 1-1z" />
                                                    <path d="M2 6h12v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6z" />
                                                </svg>
                                            </div>

                                            <div className="flex flex-col">
                                                <span className="font-semibold text-foreground">
                                                    Cash on delivery
                                                </span>

                                                <span className="text-sm text-muted">
                                                    Pay when your order arrives
                                                </span>
                                            </div>
                                        </div>

                                        <span className="text-sm font-semibold text-foreground bg-surface px-2.5 py-1 rounded-lg">
                                            COD
                                        </span>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex justify-end items-center gap-2">
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="px-5 py-2 rounded-xl bg-card text-muted border border-border-soft hover:bg-card-dark duration-300 ease-in-out cursor-pointer shadow-inner text-lg font-bold"
                                        >
                                            Cancel
                                        </button>
                                    )}

                                    <button
                                        type={
                                            isEditing
                                                ? "submit"
                                                : "button"
                                        }
                                        onClick={
                                            !isEditing
                                                ? () =>
                                                      setIsEditing(
                                                          true
                                                      )
                                                : undefined
                                        }
                                        className="px-12 py-2 rounded-xl bg-accent hover:bg-accent-hover duration-300 ease-in-out cursor-pointer shadow-inner text-inverse text-lg font-bold"
                                    >
                                        {isEditing
                                            ? "Save"
                                            : "Edit"}
                                    </button>
                                </div>
                            </form>
                        </section>
                    </section>

                    {/* Order Summary */}
                    <section className="bg-card-dark p-2 h-fit w-full lg:w-80 xl:w-[360px] shrink-0 rounded-3xl">
                        <div className="bg-card p-4 flex gap-7 flex-col rounded-2xl">
                            <h3 className="text-xl font-bold">
                                Order Summary
                            </h3>

                            <div className="flex flex-col">
                                <div className="flex justify-between">
                                    <p className="text-muted font-bold">
                                        Subtotal
                                    </p>

                                    <p className="font-bold">
                                        {originalSubtotalAmount.toFixed(
                                            2
                                        )}{" "}
                                        DH
                                    </p>
                                </div>

                                {discountAmount > 0 && (
                                    <div className="flex justify-between">
                                        <p className="text-muted font-bold">
                                            Discount
                                        </p>

                                        <p className="font-bold text-danger">
                                            -
                                            {discountAmount.toFixed(
                                                2
                                            )}{" "}
                                            DH
                                        </p>
                                    </div>
                                )}

                                <div className="flex justify-between">
                                    <p className="text-muted font-bold">
                                        Delivery Fee
                                    </p>

                                    <p className="font-bold">
                                        {deliveryFee.toFixed(2)}{" "}
                                        DH
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-between border-t border-border pt-3">
                                <p className="text-lg font-bold">
                                    Order Total
                                </p>

                                <p className="text-lg font-bold">
                                    {totalAmount.toFixed(2)}{" "}
                                    DH
                                </p>
                            </div>

                            {orderError && (
                                <p className="text-sm text-danger font-semibold">
                                    {orderError.message}
                                </p>
                            )}

                            {errorPatch && (
                                <p className="text-sm text-danger font-semibold">
                                    {errorPatch.message}
                                </p>
                            )}

                            <button
                                className="flex bg-accent text-inverse py-3 px-4 justify-center rounded-lg items-center gap-2 text-base font-bold hover:bg-accent-hover duration-300 ease-in-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={
                                    !infoSet ||
                                    isPlacingOrder ||
                                    !cart?.items?.length
                                }
                                onClick={handleOrder}
                            >
                                <p>
                                    {isPlacingOrder
                                        ? "Placing Order..."
                                        : "Place Order"}
                                </p>

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    className="bi bi-arrow-right"
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

export default CheckoutPage;
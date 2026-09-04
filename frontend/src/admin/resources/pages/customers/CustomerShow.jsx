import { useShow, useUpdate } from "@refinedev/core";
import { useParams, useNavigate, Link } from "react-router-dom";

import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    ShoppingBag,
    ShoppingCart,
    Star,
    Package,
    CreditCard,
    Activity,
    Shield,
} from "lucide-react";

import AdminSidebar from "../../components/AdminSidebar";
import DotField from "../../../../components/animation/DotField.jsx";

// ============================================================
// STATUS STYLES
// ============================================================

const orderStatusStyles = {
    PENDING:
        "text-warning bg-warning/10 border-warning/40",

    CONFIRMED:
        "text-primary bg-primary/10 border-primary/40",

    COMPLETED:
        "text-success bg-success/10 border-success/40",

    CANCELLED:
        "text-minimal-red bg-minimal-red/10 border-minimal-red/40",
};

const shippingStatusStyles = {
    NOT_SHIPPED:
        "text-warning bg-warning/10 border-warning/40",

    SHIPPED:
        "text-primary bg-primary/10 border-primary/40",

    DELIVERED:
        "text-success bg-success/10 border-success/40",
};

const paymentStatusStyles = {
    PENDING:
        "text-warning bg-warning/10 border-warning/40",

    PAID:
        "text-success bg-success/10 border-success/40",

    REFUNDED:
        "text-admin-muted bg-slate-700/40 border-admin-border",
};

// ============================================================
// CUSTOMER SHOW
// ============================================================

export function CustomerShow() {
    const { id } = useParams();
    const navigate = useNavigate();

    // ========================================================
    // FETCH CUSTOMER
    // ========================================================

    const {
        query: {
            data: customerResponse,
            isLoading,
            isError,
            error,
        },
    } = useShow({
        resource: "users",
        id,
    });

    // ========================================================
    // UPDATE CUSTOMER
    // ========================================================

    const {
        mutate: updateCustomer,
        isLoading: isUpdating,
    } = useUpdate();

    const customer = customerResponse?.data;

    const orders = customer?.orders ?? [];
    const reviews = customer?.reviews ?? [];

    const cart = customer?.cart ?? null;
    const cartItems = cart?.items ?? [];

    // ========================================================
    // BASIC STATISTICS
    // ========================================================

    const totalOrders = orders.length;

    /*
     * IMPORTANT:
     *
     * An order only counts toward "Total Spent" when:
     *
     * 1. The order is COMPLETED
     * 2. The payment is PAID
     * 3. The shipping is DELIVERED
     *
     * This prevents cancelled, unpaid, or undelivered orders
     * from being treated as actual customer spending.
     */

    const completedPaidDeliveredOrders = orders.filter(
        (order) =>
            order.order_status === "COMPLETED" &&
            order.payment_status === "PAID" &&
            order.shipping_status === "DELIVERED"
    );

    const totalSpent =
        completedPaidDeliveredOrders.reduce(
            (total, order) =>
                total + Number(order.total_amount || 0),
            0
        );

    const totalItemsPurchased =
        completedPaidDeliveredOrders.reduce(
            (total, order) =>
                total +
                (order.items ?? []).reduce(
                    (itemTotal, item) =>
                        itemTotal +
                        Number(item.quantity || 0),
                    0
                ),
            0
        );

    const averageRating =
        reviews.length > 0
            ? reviews.reduce(
                  (total, review) =>
                      total + Number(review.rating || 0),
                  0
              ) / reviews.length
            : 0;

    const cartItemCount = cartItems.reduce(
        (total, item) =>
            total + Number(item.quantity || 0),
        0
    );

    // ========================================================
    // HELPERS
    // ========================================================

    const formatDate = (date) => {
        if (!date) return "—";

        return new Date(date).toLocaleString("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };

    const formatMoney = (amount) => {
        return `${Number(amount || 0).toFixed(2)} DH`;
    };

    const displayName =
        customer?.full_name ||
        customer?.username ||
        "Unknown Customer";

    const profileInitial =
        displayName.charAt(0).toUpperCase();

    // ========================================================
    // DEACTIVATE CUSTOMER
    // ========================================================

    const handleDeactivateCustomer = () => {
        if (!customer || !customer.id) {
            return;
        }

        if (!customer.is_active) {
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to deactivate ${displayName}?`
        );

        if (!confirmed) {
            return;
        }

        updateCustomer(
            {
                resource: "users",
                id: customer.id,
                values: {
                    user_id: customer.id,
                    is_active: false,
                },
            },
            {
                onSuccess: () => {
                    /*
                     * useShow's query is invalidated by Refine,
                     * so the customer should refresh automatically.
                     */
                },

                onError: (error) => {
                    console.error(
                        "Failed to deactivate customer:",
                        error
                    );

                    window.alert(
                        error?.message ||
                            "Failed to deactivate customer."
                    );
                },
            }
        );
    };

    // ========================================================
    // LOADING
    // ========================================================

    if (isLoading) {
        return (
            <section
                className="
                    h-screen
                    bg-[#0F172A]
                    text-admin-text
                    flex
                    items-center
                    justify-center
                "
            >
                Loading customer...
            </section>
        );
    }

    // ========================================================
    // ERROR
    // ========================================================

    if (isError) {
        return (
            <section
                className="
                    h-screen
                    bg-[#0F172A]
                    text-admin-text
                    flex
                    items-center
                    justify-center
                "
            >
                <div className="text-center">
                    <p className="text-red-400 mb-4">
                        Error: {error?.message}
                    </p>

                    <button
                        onClick={() =>
                            navigate("/admin/customers")
                        }
                        className="
                            px-4
                            py-2
                            rounded-lg
                            bg-admin-primary
                            hover:bg-admin-primary-hover
                            transition-colors
                        "
                    >
                        Back to Customers
                    </button>
                </div>
            </section>
        );
    }

    // ========================================================
    // NOT FOUND
    // ========================================================

    if (!customer) {
        return (
            <section
                className="
                    h-screen
                    bg-[#0F172A]
                    text-admin-text
                    flex
                    items-center
                    justify-center
                "
            >
                Customer not found.
            </section>
        );
    }

    // ========================================================
    // MAIN
    // ========================================================

    return (
        <main
            className="
                h-screen
                max-w-full
                font-sans
                bg-[#0F172A]
                flex
                gap-4
            "
        >
            {/* ==================================================
                SIDEBAR
            ================================================== */}

            <header
                className="
                    relative
                    z-10
                    h-screen
                "
            >
                <AdminSidebar />
            </header>

            {/* ==================================================
                BACKGROUND
            ================================================== */}

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

            {/* ==================================================
                MAIN CONTENT
            ================================================== */}

            <section
                className="
                    relative
                    z-10
                    h-screen
                    flex-1
                    text-admin-text
                    overflow-y-auto
                    p-4
                "
            >
                {/* ==================================================
                    HEADER
                ================================================== */}

                <div
                    className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        border-b
                        border-admin-border
                        pb-3
                        mb-6
                    "
                >
                    <div
                        className="
                            flex
                            items-center
                            gap-3
                        "
                    >
                        <button
                            onClick={() =>
                                navigate("/admin/customers")
                            }
                            className="
                                p-2
                                rounded-lg
                                text-admin-muted
                                hover:text-admin-text
                                hover:bg-slate-800
                                transition-colors
                            "
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>

                        <div>
                            <h1
                                className="
                                    text-3xl
                                    font-semibold
                                "
                            >
                                Customer Details
                            </h1>

                            <p
                                className="
                                    text-sm
                                    text-admin-muted
                                    mt-1
                                "
                            >
                                Customer #{customer.id}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Deactivate Button */}

                        {customer.is_active && (
                            <button
                                type="button"
                                onClick={
                                    handleDeactivateCustomer
                                }
                                disabled={isUpdating}
                                className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    px-4
                                    py-2
                                    rounded-lg
                                    border
                                    border-minimal-red/40
                                    bg-minimal-red/10
                                    text-minimal-red
                                    text-sm
                                    font-semibold
                                    hover:bg-minimal-red/20
                                    disabled:opacity-50
                                    disabled:cursor-not-allowed
                                    transition-colors
                                "
                            >
                                <Activity className="h-4 w-4" />

                                {isUpdating
                                    ? "Deactivating..."
                                    : "Deactivate Customer"}
                            </button>
                        )}

                        <StatusBadge
                            value={
                                customer.is_active
                                    ? "ACTIVE"
                                    : "INACTIVE"
                            }
                            active={customer.is_active}
                        />
                    </div>
                </div>

                {/* ==================================================
                    CUSTOMER HERO
                ================================================== */}

                <div
                    className="
                        border
                        border-admin-border
                        bg-admin-surface
                        rounded-2xl
                        p-6
                        mb-4
                    "
                >
                    <div
                        className="
                            flex
                            flex-col
                            md:flex-row
                            md:items-center
                            justify-between
                            gap-6
                        "
                    >
                        <div
                            className="
                                flex
                                items-center
                                gap-5
                            "
                        >
                            {customer.profile_pic_path ? (
                                <img
                                    src={
                                        customer.profile_pic_path
                                    }
                                    alt={displayName}
                                    className="
                                        h-20
                                        w-20
                                        rounded-2xl
                                        object-cover
                                        border
                                        border-admin-border
                                    "
                                />
                            ) : (
                                <div
                                    className="
                                        h-20
                                        w-20
                                        rounded-2xl
                                        bg-slate-900
                                        border
                                        border-admin-border
                                        flex
                                        items-center
                                        justify-center
                                        text-2xl
                                        font-bold
                                        text-admin-primary
                                    "
                                >
                                    {profileInitial}
                                </div>
                            )}

                            <div>
                                <h2
                                    className="
                                        text-2xl
                                        font-semibold
                                    "
                                >
                                    {displayName}
                                </h2>

                                <p
                                    className="
                                        text-sm
                                        text-admin-muted
                                        mt-1
                                    "
                                >
                                    @{customer.username}
                                </p>

                                <div
                                    className="
                                        flex
                                        flex-wrap
                                        items-center
                                        gap-2
                                        mt-3
                                    "
                                >
                                    <span
                                        className="
                                            inline-flex
                                            items-center
                                            gap-1.5
                                            px-3
                                            py-1.5
                                            rounded-lg
                                            border
                                            text-xs
                                            font-semibold
                                            text-admin-muted
                                            bg-slate-900/60
                                            border-admin-border
                                        "
                                    >
                                        <Shield className="h-3.5 w-3.5" />

                                        {customer.role}
                                    </span>

                                    <span
                                        className={`
                                            inline-flex
                                            items-center
                                            gap-1.5
                                            px-3
                                            py-1.5
                                            rounded-lg
                                            border
                                            text-xs
                                            font-semibold
                                            ${
                                                customer.is_active
                                                    ? "text-success bg-success/10 border-success/40"
                                                    : "text-minimal-red bg-minimal-red/10 border-minimal-red/40"
                                            }
                                        `}
                                    >
                                        <Activity className="h-3.5 w-3.5" />

                                        {customer.is_active
                                            ? "ACTIVE"
                                            : "INACTIVE"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div
                            className="
                                grid
                                grid-cols-2
                                gap-x-8
                                gap-y-3
                            "
                        >
                            <QuickInfo
                                icon={
                                    <Mail className="h-4 w-4" />
                                }
                                label="Email"
                                value={customer.email}
                            />

                            <QuickInfo
                                icon={
                                    <Phone className="h-4 w-4" />
                                }
                                label="Phone"
                                value={
                                    customer.phone || "—"
                                }
                            />
                        </div>
                    </div>
                </div>

                {/* ==================================================
                    STATISTICS
                ================================================== */}

                <div
                    className="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        lg:grid-cols-4
                        gap-4
                        mb-4
                    "
                >
                    <StatCard
                        icon={
                            <ShoppingBag className="h-6 w-6" />
                        }
                        label="Orders"
                        value={totalOrders}
                    />

                    <StatCard
                        icon={
                            <CreditCard className="h-6 w-6" />
                        }
                        label="Total Spent"
                        value={formatMoney(totalSpent)}
                    />

                    <StatCard
                        icon={
                            <Package className="h-6 w-6" />
                        }
                        label="Items Purchased"
                        value={totalItemsPurchased}
                    />

                    <StatCard
                        icon={
                            <Star className="h-6 w-6" />
                        }
                        label="Reviews"
                        value={`${reviews.length}${
                            reviews.length > 0
                                ? ` · ${averageRating.toFixed(1)}`
                                : ""
                        }`}
                    />
                </div>

                {/* ==================================================
                    PERSONAL INFORMATION + ADDRESS
                ================================================== */}

                <div
                    className="
                        grid
                        grid-cols-1
                        lg:grid-cols-2
                        gap-4
                        mb-4
                    "
                >
                    {/* Personal Information */}

                    <div
                        className="
                            border
                            border-admin-border
                            bg-admin-surface
                            rounded-2xl
                            p-6
                        "
                    >
                        <SectionTitle
                            icon={
                                <User className="h-5 w-5" />
                            }
                            title="Personal Information"
                        />

                        <div className="space-y-5">
                            <InfoRow
                                icon={
                                    <User className="h-4 w-4" />
                                }
                                label="Full Name"
                                value={
                                    customer.full_name || "—"
                                }
                            />

                            <InfoRow
                                icon={
                                    <User className="h-4 w-4" />
                                }
                                label="Username"
                                value={
                                    customer.username || "—"
                                }
                            />

                            <InfoRow
                                icon={
                                    <Mail className="h-4 w-4" />
                                }
                                label="Email"
                                value={
                                    customer.email || "—"
                                }
                            />

                            <InfoRow
                                icon={
                                    <Phone className="h-4 w-4" />
                                }
                                label="Phone"
                                value={
                                    customer.phone || "—"
                                }
                            />
                        </div>
                    </div>

                    {/* Address */}

                    <div
                        className="
                            border
                            border-admin-border
                            bg-admin-surface
                            rounded-2xl
                            p-6
                        "
                    >
                        <SectionTitle
                            icon={
                                <MapPin className="h-5 w-5" />
                            }
                            title="Address"
                        />

                        <div className="space-y-4">
                            <AddressBlock
                                label="Street Address"
                                value={
                                    customer.address || "—"
                                }
                            />

                            <div
                                className="
                                    grid
                                    grid-cols-1
                                    sm:grid-cols-2
                                    gap-4
                                "
                            >
                                <AddressBlock
                                    label="City"
                                    value={
                                        customer.city || "—"
                                    }
                                />

                                <AddressBlock
                                    label="Region"
                                    value={
                                        customer.region || "—"
                                    }
                                />
                            </div>

                            <AddressBlock
                                label="Postal Code"
                                value={
                                    customer.postal_code || "—"
                                }
                            />
                        </div>
                    </div>
                </div>

                {/* ==================================================
                    ORDER HISTORY
                ================================================== */}

                <div
                    className="
                        border
                        border-admin-border
                        bg-admin-surface
                        rounded-2xl
                        overflow-hidden
                        mb-4
                    "
                >
                    <div
                        className="
                            p-6
                            border-b
                            border-admin-border
                            flex
                            items-center
                            justify-between
                        "
                    >
                        <SectionTitle
                            icon={
                                <ShoppingBag className="h-5 w-5" />
                            }
                            title="Order History"
                            noMargin
                        />

                        <span
                            className="
                                text-sm
                                text-admin-muted
                            "
                        >
                            {orders.length} order
                            {orders.length !== 1
                                ? "s"
                                : ""}
                        </span>
                    </div>

                    {orders.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead
                                    className="
                                        bg-slate-900
                                        border-b
                                        border-admin-border
                                    "
                                >
                                    <tr>
                                        <TableHeader>
                                            Order
                                        </TableHeader>

                                        <TableHeader>
                                            Date
                                        </TableHeader>

                                        <TableHeader>
                                            Items
                                        </TableHeader>

                                        <TableHeader>
                                            Total
                                        </TableHeader>

                                        <TableHeader>
                                            Status
                                        </TableHeader>

                                        <TableHeader>
                                            Shipping
                                        </TableHeader>

                                        <TableHeader>
                                            Payment
                                        </TableHeader>
                                    </tr>
                                </thead>

                                <tbody>
                                    {orders.map((order) => {
                                        const itemCount =
                                            (
                                                order.items ?? []
                                            ).reduce(
                                                (
                                                    total,
                                                    item
                                                ) =>
                                                    total +
                                                    Number(
                                                        item.quantity ||
                                                            0
                                                    ),
                                                0
                                            );

                                        return (
                                            <tr
                                                key={order.id}
                                                onClick={() =>
                                                    navigate(
                                                        `/admin/orders/${order.id}`
                                                    )
                                                }
                                                className="
                                                    border-b
                                                    border-slate-700/70
                                                    hover:bg-slate-800/50
                                                    cursor-pointer
                                                    transition-colors
                                                "
                                            >
                                                <td className="px-6 py-5">
                                                    <div
                                                        className="
                                                            flex
                                                            items-center
                                                            gap-3
                                                        "
                                                    >
                                                        <div
                                                            className="
                                                                h-10
                                                                w-10
                                                                rounded-lg
                                                                bg-slate-900
                                                                border
                                                                border-admin-border
                                                                flex
                                                                items-center
                                                                justify-center
                                                            "
                                                        >
                                                            <ShoppingBag
                                                                className="
                                                                    h-4
                                                                    w-4
                                                                    text-admin-primary
                                                                "
                                                            />
                                                        </div>

                                                        <span
                                                            className="
                                                                font-medium
                                                            "
                                                        >
                                                            #{order.id}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td
                                                    className="
                                                        px-6
                                                        py-5
                                                        text-sm
                                                        text-admin-muted
                                                        whitespace-nowrap
                                                    "
                                                >
                                                    {formatDate(
                                                        order.created_at
                                                    )}
                                                </td>

                                                <td
                                                    className="
                                                        px-6
                                                        py-5
                                                        text-sm
                                                    "
                                                >
                                                    {itemCount}
                                                </td>

                                                <td
                                                    className="
                                                        px-6
                                                        py-5
                                                        text-sm
                                                        font-semibold
                                                        whitespace-nowrap
                                                    "
                                                >
                                                    {formatMoney(
                                                        order.total_amount
                                                    )}
                                                </td>

                                                <td className="px-6 py-5">
                                                    <StatusBadge
                                                        value={
                                                            order.order_status
                                                        }
                                                        styles={
                                                            orderStatusStyles
                                                        }
                                                    />
                                                </td>

                                                <td className="px-6 py-5">
                                                    <StatusBadge
                                                        value={
                                                            order.shipping_status
                                                        }
                                                        styles={
                                                            shippingStatusStyles
                                                        }
                                                    />
                                                </td>

                                                <td className="px-6 py-5">
                                                    <StatusBadge
                                                        value={
                                                            order.payment_status
                                                        }
                                                        styles={
                                                            paymentStatusStyles
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyState
                            icon={
                                <ShoppingBag className="h-6 w-6" />
                            }
                            message="This customer has not placed any orders yet."
                        />
                    )}
                </div>

                {/* ==================================================
                    CART + REVIEWS
                ================================================== */}

                <div
                    className="
                        grid
                        grid-cols-1
                        lg:grid-cols-2
                        gap-4
                        mb-4
                    "
                >
                    {/* Cart */}

                    <div
                        className="
                            border
                            border-admin-border
                            bg-admin-surface
                            rounded-2xl
                            overflow-hidden
                        "
                    >
                        <div
                            className="
                                p-6
                                border-b
                                border-admin-border
                                flex
                                items-center
                                justify-between
                            "
                        >
                            <SectionTitle
                                icon={
                                    <ShoppingCart className="h-5 w-5" />
                                }
                                title="Current Cart"
                                noMargin
                            />

                            <span
                                className="
                                    text-sm
                                    text-admin-muted
                                "
                            >
                                {cartItemCount} item
                                {cartItemCount !== 1
                                    ? "s"
                                    : ""}
                            </span>
                        </div>

                        {cartItems.length > 0 ? (
                            <div className="p-6 space-y-3">
                                {cartItems.map((item) => (
                                    <Link
                                        key={`${item.cart_id}-${item.product_variant_id}`}
                                        className="
                                            flex
                                            items-center
                                            justify-between
                                            gap-4
                                            p-4
                                            rounded-xl
                                            bg-slate-900/60
                                            border
                                            border-admin-border
                                        "
                                        to={`/admin/products/${item.product_variant?.product?.id}`}
                                    >
                                        <div
                                            className="
                                                flex
                                                items-center
                                                gap-3
                                            "
                                        >
                                            <div
                                                className="
                                                    h-10
                                                    w-10
                                                    rounded-lg
                                                    bg-slate-900
                                                    border
                                                    border-admin-border
                                                    flex
                                                    items-center
                                                    justify-center
                                                "
                                            >
                                                <Package
                                                    className="
                                                        h-4
                                                        w-4
                                                        text-admin-muted
                                                    "
                                                />
                                            </div>

                                            <div>
                                                <p
                                                    className="
                                                        text-sm
                                                        font-semibold
                                                    "
                                                >
                                                    {item
                                                        .product_variant
                                                        ?.product
                                                        ?.name ||
                                                        "Unknown Product"}
                                                </p>

                                                <p
                                                    className="
                                                        text-xs
                                                        text-admin-muted
                                                        mt-1
                                                    "
                                                >
                                                    {item
                                                        .product_variant
                                                        ?.sku || "—"}
                                                </p>
                                            </div>
                                        </div>

                                        <span
                                            className="
                                                px-3
                                                py-1.5
                                                rounded-lg
                                                bg-slate-800
                                                border
                                                border-admin-border
                                                text-xs
                                                font-semibold
                                            "
                                        >
                                            × {item.quantity}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={
                                    <ShoppingCart className="h-6 w-6" />
                                }
                                message="The customer's cart is empty."
                            />
                        )}
                    </div>

                    {/* Reviews */}

                    <div
                        className="
                            border
                            border-admin-border
                            bg-admin-surface
                            rounded-2xl
                            overflow-hidden
                        "
                    >
                        <div
                            className="
                                p-6
                                border-b
                                border-admin-border
                                flex
                                items-center
                                justify-between
                            "
                        >
                            <SectionTitle
                                icon={
                                    <Star className="h-5 w-5" />
                                }
                                title="Customer Reviews"
                                noMargin
                            />

                            <span
                                className="
                                    text-sm
                                    text-admin-muted
                                "
                            >
                                {reviews.length} review
                                {reviews.length !== 1
                                    ? "s"
                                    : ""}
                            </span>
                        </div>

                        {reviews.length > 0 ? (
                            <div className="p-6 space-y-4">
                                {reviews.map((review) => (
                                    <div
                                        key={review.id}
                                        className="
                                            p-4
                                            rounded-xl
                                            bg-slate-900/60
                                            border
                                            border-admin-border
                                            cursor-pointer
                                        "
                                        onClick={() => navigate(`/admin/products/${review.product?.id}`)}
                                    >
                                        <div
                                            className="
                                                flex
                                                items-center
                                                justify-between
                                                gap-4
                                                mb-3
                                            "
                                        >
                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    gap-1
                                                "
                                            >
                                                {[1, 2, 3, 4, 5].map(
                                                    (star) => (
                                                        <Star
                                                            key={star}
                                                            className={`
                                                                h-4
                                                                w-4
                                                                ${
                                                                    star <=
                                                                    review.rating
                                                                        ? "fill-current text-yellow-400"
                                                                        : "text-slate-600"
                                                                }
                                                            `}
                                                        />
                                                    )
                                                )}
                                            </div>

                                            <span
                                                className="
                                                    text-xs
                                                    text-admin-muted
                                                "
                                            >
                                                Product #
                                                {review.product_id}
                                            </span>
                                        </div>

                                        <p
                                            className="
                                                text-sm
                                                text-slate-300
                                                leading-relaxed
                                            "
                                        >
                                            {review.review ||
                                                "No written review."}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={
                                    <Star className="h-6 w-6" />
                                }
                                message="This customer has not written any reviews."
                            />
                        )}
                    </div>
                </div>

                {/* ==================================================
                    ACCOUNT INFORMATION
                ================================================== */}

                <div
                    className="
                        border
                        border-admin-border
                        bg-admin-surface
                        rounded-2xl
                        p-6
                        mb-6
                    "
                >
                    <SectionTitle
                        icon={
                            <Calendar className="h-5 w-5" />
                        }
                        title="Account Information"
                    />

                    <div
                        className="
                            grid
                            grid-cols-1
                            md:grid-cols-3
                            gap-4
                        "
                    >
                        <InfoCard
                            icon={
                                <User className="h-5 w-5" />
                            }
                            label="User ID"
                            value={`#${customer.id}`}
                        />

                        <InfoCard
                            icon={
                                <Shield className="h-5 w-5" />
                            }
                            label="Role"
                            value={customer.role}
                        />

                        <InfoCard
                            icon={
                                <Activity className="h-5 w-5" />
                            }
                            label="Account Status"
                            value={
                                customer.is_active
                                    ? "Active"
                                    : "Inactive"
                            }
                        />
                    </div>
                </div>
            </section>
        </main>
    );
}

// ============================================================
// SECTION TITLE
// ============================================================

function SectionTitle({
    icon,
    title,
    noMargin = false,
}) {
    return (
        <div
            className={`
                flex
                items-center
                gap-2
                ${noMargin ? "" : "mb-6"}
            `}
        >
            <span className="text-admin-primary">
                {icon}
            </span>

            <h2
                className="
                    text-lg
                    font-semibold
                "
            >
                {title}
            </h2>
        </div>
    );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
    icon,
    label,
    value,
}) {
    return (
        <div
            className="
                border
                border-admin-border
                bg-admin-surface
                rounded-2xl
                p-5
            "
        >
            <div
                className="
                    flex
                    items-center
                    gap-2
                    text-admin-muted
                    mb-3
                "
            >
                {icon}

                <span className="text-sm">
                    {label}
                </span>
            </div>

            <p
                className="
                    text-2xl
                    font-bold
                "
            >
                {value}
            </p>
        </div>
    );
}

// ============================================================
// INFO ROW
// ============================================================

function InfoRow({
    icon,
    label,
    value,
}) {
    return (
        <div
            className="
                flex
                items-start
                gap-3
            "
        >
            <div
                className="
                    mt-0.5
                    text-admin-muted
                "
            >
                {icon}
            </div>

            <div>
                <p
                    className="
                        text-xs
                        text-admin-muted
                        mb-1
                    "
                >
                    {label}
                </p>

                <p
                    className="
                        text-sm
                        font-medium
                    "
                >
                    {value}
                </p>
            </div>
        </div>
    );
}

// ============================================================
// QUICK INFO
// ============================================================

function QuickInfo({
    icon,
    label,
    value,
}) {
    return (
        <div className="min-w-0">
            <div
                className="
                    flex
                    items-center
                    gap-2
                    text-admin-muted
                    mb-1
                "
            >
                {icon}

                <span className="text-xs">
                    {label}
                </span>
            </div>

            <p
                className="
                    text-sm
                    font-medium
                    truncate
                    max-w-[220px]
                "
            >
                {value}
            </p>
        </div>
    );
}

// ============================================================
// ADDRESS BLOCK
// ============================================================

function AddressBlock({
    label,
    value,
}) {
    return (
        <div>
            <p
                className="
                    text-xs
                    text-admin-muted
                    mb-1
                "
            >
                {label}
            </p>

            <p
                className="
                    text-sm
                    font-medium
                "
            >
                {value}
            </p>
        </div>
    );
}

// ============================================================
// INFO CARD
// ============================================================

function InfoCard({
    icon,
    label,
    value,
}) {
    return (
        <div
            className="
                p-4
                rounded-xl
                bg-slate-900/60
                border
                border-admin-border
            "
        >
            <div
                className="
                    flex
                    items-center
                    gap-2
                    text-admin-muted
                    mb-2
                "
            >
                {icon}

                <span className="text-xs">
                    {label}
                </span>
            </div>

            <p className="font-semibold">
                {value}
            </p>
        </div>
    );
}

// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({
    value,
    styles = {},
    active,
}) {
    let style;

    if (active !== undefined) {
        style = active
            ? "text-success bg-success/10 border-success/40"
            : "text-minimal-red bg-minimal-red/10 border-minimal-red/40";
    } else {
        style =
            styles[value] ??
            "text-admin-muted bg-slate-800/50 border-admin-border";
    }

    return (
        <span
            className={`
                inline-flex
                items-center
                px-3
                py-1.5
                rounded-lg
                border
                text-xs
                font-semibold
                whitespace-nowrap
                ${style}
            `}
        >
            {value
                ? value.replaceAll("_", " ")
                : "—"}
        </span>
    );
}

// ============================================================
// EMPTY STATE
// ============================================================

function EmptyState({
    icon,
    message,
}) {
    return (
        <div
            className="
                px-6
                py-12
                text-center
                text-admin-muted
            "
        >
            <div
                className="
                    flex
                    justify-center
                    mb-3
                    opacity-60
                "
            >
                {icon}
            </div>

            <p className="text-sm">
                {message}
            </p>
        </div>
    );
}

// ============================================================
// TABLE HEADER
// ============================================================

function TableHeader({
    children,
    align = "left",
}) {
    return (
        <th
            className={`
                px-6
                py-4
                text-sm
                text-admin-muted
                ${
                    align === "right"
                        ? "text-right"
                        : "text-left"
                }
            `}
        >
            {children}
        </th>
    );
}
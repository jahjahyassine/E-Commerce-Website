import { useShow, useUpdate } from "@refinedev/core";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Edit,
    Save,
    X,
    Package,
    Truck,
    CreditCard,
    User,
    MapPin,
    Calendar,
    ShoppingCart,
    DollarSign,
    Mail,
    Phone,
} from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import DotField from "../../../../components/animation/DotField.jsx";

const orderStatusStyles = {
    PENDING: "text-warning bg-warning/10 border-warning/40",
    CONFIRMED: "text-primary bg-primary/10 border-primary/40",
    COMPLETED: "text-success bg-success/10 border-success/40",
    CANCELLED: "text-minimal-red bg-minimal-red/10 border-minimal-red/40",
};

const shippingStatusStyles = {
    NOT_SHIPPED: "text-warning bg-warning/10 border-warning/40",
    SHIPPED: "text-primary bg-primary/10 border-primary/40",
    DELIVERED: "text-success bg-success/10 border-success/40",
};

const paymentStatusStyles = {
    PENDING: "text-warning bg-warning/10 border-warning/40",
    PAID: "text-success bg-success/10 border-success/40",
    REFUNDED: "text-admin-muted bg-slate-700/40 border-admin-border",
};

/* ============================================================
   LIFECYCLE — mirrors the backend state machine for UX purposes
   only. It decides which action(s) to *offer*; the backend is
   the only thing that actually enforces the rules.
   ============================================================ */
const LIFECYCLE_ACTIONS = {
    PENDING: [
        { status: "CONFIRMED", label: "Confirm Order" },
        { status: "CANCELLED", label: "Cancel Order" },
    ],
    CONFIRMED: [
        { status: "SHIPPED", label: "Ship Order" },
        { status: "CANCELLED", label: "Cancel Order" },
    ],
    SHIPPED: [{ status: "COMPLETED", label: "Complete Order" }],
    COMPLETED: [],
    CANCELLED: [],
};

function deriveLifecycle(order) {
    if (!order) return null;
    const { order_status, shipping_status, payment_status } = order;

    if (
        order_status === "COMPLETED" &&
        shipping_status === "DELIVERED" &&
        payment_status === "PAID"
    ) {
        return "COMPLETED";
    }
    if (order_status === "CANCELLED") {
        return "CANCELLED";
    }
    if (order_status === "CONFIRMED" && shipping_status === "SHIPPED") {
        return "SHIPPED";
    }
    if (order_status === "CONFIRMED" && shipping_status === "NOT_SHIPPED") {
        return "CONFIRMED";
    }
    if (order_status === "PENDING") {
        return "PENDING";
    }
    return null;
}

export function OrderShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [selectedAction, setSelectedAction] = useState("");

    const {
        query: { data: orderResponse, isLoading, isError, error, refetch },
    } = useShow({
        resource: "orders",
        id,
    });

    const order = orderResponse?.data;

    const { mutate: updateOrder, isPending: isUpdating } = useUpdate();

    const lifecycle = deriveLifecycle(order);
    const actions = lifecycle ? LIFECYCLE_ACTIONS[lifecycle] ?? [] : [];

    const startEditing = () => {
        if (actions.length === 0) return;
        setSelectedAction(actions[0].status);
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setSelectedAction("");
        setIsEditing(false);
    };

    /* ========================================================
       SAVE — sends ONLY the chosen lifecycle action. The backend
       derives order_status / shipping_status / payment_status;
       we never construct that combination on the frontend.
       ======================================================== */
    const handleSave = () => {
        if (!selectedAction) return;

        updateOrder(
            {
                resource: "orders",
                id,
                values: {
                    status: selectedAction,
                },
                mutationMode: "pessimistic",
                successNotification: {
                    message: "Order status updated successfully",
                    type: "success",
                },
                errorNotification: {
                    message: "Failed to update order status",
                    type: "error",
                },
            },
            {
                onSuccess: () => {
                    setIsEditing(false);
                    refetch();
                },
                onError: (err) => {
                    alert(err?.message || "Failed to update order.");
                },
            }
        );
    };

    const items = order?.items ?? [];
    const totalItems = items.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0
    );
    const subtotal = items.reduce(
        (total, item) =>
            total + Number(item.quantity || 0) * Number(item.price || 0),
        0
    );
    const total = Number(order?.total_amount ?? subtotal);

    const formatDate = (date) => {
        if (!date) return "—";
        return new Date(date).toLocaleString("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };

    const customer = order?.user ?? null;
    const customerName =
        order?.customer_name ??
        customer?.full_name ??
        customer?.username ??
        "—";
    const customerPhone = order?.customer_phone ?? customer?.phone ?? "—";
    const shippingAddress = order?.shipping_address ?? "—";
    const shippingCity = order?.shipping_city ?? "—";
    const shippingRegion = order?.shipping_region ?? "—";
    const shippingPostalCode = order?.shipping_postal_code ?? "";

    if (isLoading) {
        return (
            <section className="h-screen bg-[#0F172A] text-admin-text flex items-center justify-center">
                Loading order...
            </section>
        );
    }

    if (isError) {
        return (
            <section className="h-screen bg-[#0F172A] text-admin-text flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-400 mb-4">
                        Error: {error?.message}
                    </p>
                    <button
                        onClick={() => navigate("/admin/orders")}
                        className="px-4 py-2 rounded-lg bg-admin-primary hover:bg-admin-primary-hover"
                    >
                        Back to Orders
                    </button>
                </div>
            </section>
        );
    }

    if (!order) {
        return (
            <section className="h-screen bg-[#0F172A] text-admin-text flex items-center justify-center">
                Order not found.
            </section>
        );
    }

    return (
        <main className="h-screen max-w-full font-sans bg-[#0F172A] flex gap-4">
            <header className="relative z-10 h-screen">
                <AdminSidebar />
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

            <section className="relative z-10 h-screen flex-1 text-admin-text overflow-y-auto p-4">
                <div className="flex items-center justify-between gap-4 border-b border-admin-border pb-3 mb-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate("/admin/orders")}
                            className="p-2 rounded-lg text-admin-muted hover:text-admin-text hover:bg-slate-800 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-semibold">
                                Order Details
                            </h1>
                            <p className="text-sm text-admin-muted mt-1">
                                Order #{order.id}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleCancelEdit}
                                    disabled={isUpdating}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-admin-border text-admin-muted hover:text-admin-text hover:bg-slate-800"
                                >
                                    <X className="h-4 w-4" />
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isUpdating || !selectedAction}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-admin-primary border border-admin-primary-border hover:bg-admin-primary-hover font-semibold disabled:opacity-50"
                                >
                                    <Save className="h-4 w-4" />
                                    {isUpdating ? "Saving..." : "Save Changes"}
                                </button>
                            </>
                        ) : (
                            actions.length > 0 && (
                                <button
                                    onClick={startEditing}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-admin-primary border border-admin-primary-border hover:bg-admin-primary-hover font-semibold"
                                >
                                    <Edit className="h-4 w-4" />
                                    Edit Order
                                </button>
                            )
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <StatCard
                        icon={<ShoppingCart className="h-6 w-6" />}
                        label="Items"
                        value={`${totalItems} pcs`}
                    />
                    <StatCard
                        icon={<DollarSign className="h-6 w-6" />}
                        label="Total"
                        value={`${total.toFixed(2)} DH`}
                    />
                    <StatCard
                        icon={<Package className="h-6 w-6" />}
                        label="Order Status"
                        value={order.order_status ?? "—"}
                    />
                    <StatCard
                        icon={<Truck className="h-6 w-6" />}
                        label="Shipping"
                        value={order.shipping_status ?? "—"}
                    />
                </div>

                <div className="border border-admin-border bg-admin-surface rounded-2xl p-6 mb-4">
                    <div className="flex items-center gap-2 mb-6">
                        <Package className="h-5 w-5 text-admin-primary" />
                        <h2 className="text-lg font-semibold">
                            Order Status
                        </h2>
                    </div>

                    {isEditing ? (
                        <div className="max-w-sm">
                            <label className="block text-sm text-admin-muted mb-2">
                                Action
                            </label>
                            {actions.length > 0 ? (
                                <select
                                    value={selectedAction}
                                    onChange={(e) =>
                                        setSelectedAction(e.target.value)
                                    }
                                    className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-admin-border text-admin-text outline-none focus:border-admin-primary"
                                >
                                    {actions.map((action) => (
                                        <option
                                            key={action.status}
                                            value={action.status}
                                        >
                                            {action.label}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <p className="text-sm text-admin-muted italic">
                                    No actions available for this order.
                                </p>
                            )}
                            <p className="text-xs text-admin-muted mt-2">
                                Current status: {lifecycle ?? "Unknown"}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <StatusCard
                                icon={<Package className="h-5 w-5" />}
                                label="Order Status"
                                value={order.order_status}
                                styles={orderStatusStyles}
                            />
                            <StatusCard
                                icon={<Truck className="h-5 w-5" />}
                                label="Shipping Status"
                                value={order.shipping_status}
                                styles={shippingStatusStyles}
                            />
                            <StatusCard
                                icon={<CreditCard className="h-5 w-5" />}
                                label="Payment Status"
                                value={order.payment_status}
                                styles={paymentStatusStyles}
                            />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <div className="border border-admin-border bg-admin-surface rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <User className="h-5 w-5 text-admin-primary" />
                            <h2 className="text-lg font-semibold">
                                Customer
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <InfoRow
                                icon={<User className="h-4 w-4" />}
                                label="Name"
                                value={customerName}
                            />
                            <InfoRow
                                icon={<Mail className="h-4 w-4" />}
                                label="Email"
                                value={customer?.email ?? "—"}
                            />
                            <InfoRow
                                icon={<Phone className="h-4 w-4" />}
                                label="Phone"
                                value={customerPhone}
                            />
                        </div>
                    </div>

                    <div className="border border-admin-border bg-admin-surface rounded-2xl p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <MapPin className="h-5 w-5 text-admin-primary" />
                            <h2 className="text-lg font-semibold">
                                Shipping Address
                            </h2>
                        </div>
                        <div className="space-y-3 text-sm text-slate-300">
                            <p>{shippingAddress}</p>
                            <p>
                                {shippingCity}
                                {shippingRegion !== "—"
                                    ? `, ${shippingRegion}`
                                    : ""}
                            </p>
                            {shippingPostalCode && (
                                <p>{shippingPostalCode}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border border-admin-border bg-admin-surface rounded-2xl overflow-hidden mb-4">
                    <div className="p-6 border-b border-admin-border flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5 text-admin-primary" />
                        <h2 className="text-lg font-semibold">
                            Order Items
                        </h2>
                    </div>

                    {items.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-900 border-b border-admin-border">
                                    <tr>
                                        <TableHeader>Product</TableHeader>
                                        <TableHeader>SKU</TableHeader>
                                        <TableHeader>Price</TableHeader>
                                        <TableHeader>Quantity</TableHeader>
                                        <TableHeader align="right">
                                            Total
                                        </TableHeader>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => {
                                        const quantity = Number(
                                            item.quantity || 0
                                        );
                                        const price = Number(
                                            item.price || 0
                                        );
                                        const variant =
                                            item.product_variant;
                                        const product = variant?.product;
                                        const attributes =
                                            item.variant_attributes_snapshot;

                                        return (
                                            <tr
                                                key={
                                                    `${item.order_id}-${item.product_variant_id}` ??
                                                    index
                                                }
                                                className="border-b border-slate-700/70 hover:bg-slate-800/50"
                                            >
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        {variant?.media?.[0]
                                                            ?.media_url ? (
                                                            <img
                                                                src={
                                                                    variant
                                                                        .media[0]
                                                                        .media_url
                                                                }
                                                                alt={
                                                                    item.product_name
                                                                }
                                                                className="h-12 w-12 rounded-lg object-cover border border-admin-border"
                                                            />
                                                        ) : (
                                                            <div className="h-12 w-12 rounded-lg bg-slate-900 border border-admin-border flex items-center justify-center">
                                                                <Package className="h-5 w-5 text-admin-muted" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-medium">
                                                                {item.product_name ??
                                                                    product?.name ??
                                                                    "Product"}
                                                            </p>
                                                            {attributes &&
                                                                Object.keys(
                                                                    attributes
                                                                ).length >
                                                                    0 && (
                                                                    <p className="text-xs text-admin-muted mt-1">
                                                                        {Object.entries(
                                                                            attributes
                                                                        )
                                                                            .map(
                                                                                ([
                                                                                    key,
                                                                                    value,
                                                                                ]) =>
                                                                                    `${key}: ${value}`
                                                                            )
                                                                            .join(
                                                                                ", "
                                                                            )}
                                                                    </p>
                                                                )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-sm text-admin-muted">
                                                    {variant?.sku ?? "—"}
                                                </td>
                                                <td className="px-6 py-5 text-sm">
                                                    {price.toFixed(2)} DH
                                                </td>
                                                <td className="px-6 py-5 text-sm">
                                                    {quantity}
                                                </td>
                                                <td className="px-6 py-5 text-sm font-semibold text-right">
                                                    {(price * quantity).toFixed(
                                                        2
                                                    )}{" "}
                                                    DH
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="px-6 py-12 text-center text-admin-muted">
                            No items found.
                        </div>
                    )}

                    <div className="p-6 border-t border-admin-border flex justify-end">
                        <div className="w-full md:w-80 space-y-3">
                            <div className="flex justify-between text-sm text-admin-muted">
                                <span>Subtotal</span>
                                <span>{subtotal.toFixed(2)} DH</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-3 border-t border-admin-border">
                                <span>Total</span>
                                <span>{total.toFixed(2)} DH</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border border-admin-border bg-admin-surface rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-2 mb-6">
                        <Calendar className="h-5 w-5 text-admin-primary" />
                        <h2 className="text-lg font-semibold">
                            Order Information
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoCard
                            icon={<Calendar className="h-5 w-5" />}
                            label="Created"
                            value={formatDate(order.created_at)}
                        />
                        <InfoCard
                            icon={<Calendar className="h-5 w-5" />}
                            label="Updated"
                            value={formatDate(order.updated_at)}
                        />
                    </div>
                </div>
            </section>
        </main>
    );
}

function StatusCard({ icon, label, value, styles }) {
    const style =
        styles[value] ??
        "text-admin-muted bg-slate-800/50 border-admin-border";

    return (
        <div className="p-4 rounded-xl bg-slate-900/60 border border-admin-border">
            <div className="flex items-center gap-2 text-admin-muted mb-3">
                {icon}
                <span className="text-xs">{label}</span>
            </div>
            <span
                className={`inline-flex items-center px-3 py-1.5 rounded-lg border text-xs font-semibold ${style}`}
            >
                {value ? value.replaceAll("_", " ") : "—"}
            </span>
        </div>
    );
}

function InfoRow({ icon, label, value }) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 text-admin-muted">{icon}</div>
            <div>
                <p className="text-xs text-admin-muted mb-1">{label}</p>
                <p className="text-sm font-medium">{value}</p>
            </div>
        </div>
    );
}

function InfoCard({ icon, label, value }) {
    return (
        <div className="p-4 rounded-xl bg-slate-900/60 border border-admin-border">
            <div className="flex items-center gap-2 text-admin-muted mb-2">
                {icon}
                <span className="text-xs">{label}</span>
            </div>
            <p className="font-semibold">{value}</p>
        </div>
    );
}

function StatCard({ icon, label, value }) {
    return (
        <div className="border border-admin-border bg-admin-surface rounded-2xl p-5">
            <div className="flex items-center gap-2 text-admin-muted mb-3">
                {icon}
                <span className="text-sm">{label}</span>
            </div>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );
}

function TableHeader({ children, align = "left" }) {
    return (
        <th
            className={`px-6 py-4 text-sm text-admin-muted ${
                align === "right" ? "text-right" : "text-left"
            }`}
        >
            {children}
        </th>
    );
}
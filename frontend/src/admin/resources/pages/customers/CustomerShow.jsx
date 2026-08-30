import {
    useShow,
} from "@refinedev/core";

import {
    Link,
} from "react-router-dom";

import AdminSidebar from "../../components/AdminSidebar";
import DotField from "../../../../components/animation/DotField";

function CustomerShow() {
    const {
        query,
    } = useShow({
        resource: "users",
    });

    const {
        data,
        isLoading,
        isError,
    } = query;

    const customer = data?.data;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#f7f8f8]">
                <AdminSidebar />

                <main className="ml-64 min-h-screen flex items-center justify-center">
                    <p className="text-sm text-gray-400">
                        Loading customer...
                    </p>
                </main>
            </div>
        );
    }

    if (isError || !customer) {
        return (
            <div className="min-h-screen bg-[#f7f8f8]">
                <AdminSidebar />

                <main className="ml-64 min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-lg font-semibold">
                            Customer not found
                        </p>

                        <Link
                            to="/admin/users"
                            className="inline-block mt-4 text-sm text-[#567C8D]"
                        >
                            Back to customers
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    const orders = customer.orders ?? [];
    const reviews = customer.reviews ?? [];
    const cart = customer.cart;

    const totalSpent = orders
        .filter(
            (order) =>
                order.payment_status === "PAID"
        )
        .reduce(
            (total, order) =>
                total + Number(order.total_amount),
            0
        );

    const cartQuantity =
        cart?.items?.reduce(
            (total, item) =>
                total + item.quantity,
            0
        ) ?? 0;

    return (
        <div className="min-h-screen bg-[#f7f8f8] text-[#263238]">
            <AdminSidebar />

            <main className="ml-64 min-h-screen relative overflow-hidden">
                <DotField />

                <div className="relative z-10 p-8">
                    <div className="mb-8">
                        <Link
                            to="/admin/users"
                            className="text-sm text-[#567C8D] hover:underline"
                        >
                            ← Back to customers
                        </Link>

                        <div className="flex items-center justify-between mt-5">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-[#567C8D]/10 flex items-center justify-center text-[#567C8D] text-xl font-bold">
                                    {customer.first_name
                                        ?.charAt(0)
                                        ?.toUpperCase()}
                                    {customer.last_name
                                        ?.charAt(0)
                                        ?.toUpperCase()}
                                </div>

                                <div>
                                    <h1 className="text-3xl font-bold">
                                        {customer.first_name}{" "}
                                        {customer.last_name}
                                    </h1>

                                    <p className="text-sm text-gray-500 mt-1">
                                        Customer #{customer.id}
                                    </p>
                                </div>
                            </div>

                            <span className="rounded-full bg-[#F5E4C8] px-4 py-2 text-xs font-semibold text-[#6d5630]">
                                {customer.role}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-8">
                        <StatCard
                            title="Orders"
                            value={orders.length}
                        />

                        <StatCard
                            title="Total spent"
                            value={`${totalSpent.toFixed(2)} DH`}
                        />

                        <StatCard
                            title="Cart items"
                            value={cartQuantity}
                        />

                        <StatCard
                            title="Reviews"
                            value={reviews.length}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <div className="col-span-1">
                            <CustomerInformation
                                customer={customer}
                            />

                            <CustomerCart
                                cart={cart}
                            />
                        </div>

                        <div className="col-span-2 space-y-6">
                            <CustomerOrders
                                orders={orders}
                            />

                            <CustomerReviews
                                reviews={reviews}
                            />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({
    title,
    value,
}) {
    return (
        <div className="bg-white border border-[#dce4e7] rounded-2xl p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-gray-400">
                {title}
            </p>

            <p className="text-2xl font-bold mt-2">
                {value}
            </p>
        </div>
    );
}

function CustomerInformation({
    customer,
}) {
    return (
        <div className="bg-white border border-[#dce4e7] rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold mb-5">
                Customer information
            </h2>

            <div className="space-y-4">
                <InfoRow
                    label="Full name"
                    value={`${customer.first_name} ${customer.last_name}`}
                />

                <InfoRow
                    label="Email"
                    value={customer.email}
                />

                <InfoRow
                    label="Phone"
                    value={customer.phone || "—"}
                />

                <InfoRow
                    label="City"
                    value={customer.city || "—"}
                />

                <InfoRow
                    label="Region"
                    value={customer.region || "—"}
                />

                <InfoRow
                    label="Postal code"
                    value={customer.postal_code || "—"}
                />

                <InfoRow
                    label="Customer ID"
                    value={`#${customer.id}`}
                />

                <InfoRow
                    label="Joined"
                    value={formatDate(customer.created_at)}
                />
            </div>
        </div>
    );
}

function CustomerCart({
    cart,
}) {
    return (
        <div className="bg-white border border-[#dce4e7] rounded-2xl p-6 shadow-sm mt-6">
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold">
                    Current cart
                </h2>

                <span className="text-xs text-gray-400">
                    {cart?.items?.length ?? 0} products
                </span>
            </div>

            {!cart || cart.items.length === 0 ? (
                <div className="py-8 text-center">
                    <p className="text-sm text-gray-400">
                        Cart is empty
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {cart.items.map((item) => (
                        <div
                            key={item.id}
                            className="border-b border-[#edf1f2] last:border-0 pb-4 last:pb-0"
                        >
                            <div className="flex justify-between gap-3">
                                <div>
                                    <p className="font-medium text-sm">
                                        {item.product_name}
                                    </p>

                                    {item.variant_attributes && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            {formatAttributes(
                                                item.variant_attributes
                                            )}
                                        </p>
                                    )}

                                    <p className="text-xs text-gray-400 mt-2">
                                        Quantity: {item.quantity}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <p className="font-semibold text-sm">
                                        {Number(
                                            item.price
                                        ).toFixed(2)}{" "}
                                        DH
                                    </p>

                                    <p className="text-xs text-gray-400 mt-1">
                                        Stock: {item.stock}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function CustomerOrders({
    orders,
}) {
    return (
        <div className="bg-white border border-[#dce4e7] rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[#e6ecee] flex items-center justify-between">
                <h2 className="text-lg font-bold">
                    Orders
                </h2>

                <span className="text-xs text-gray-400">
                    {orders.length} total
                </span>
            </div>

            {orders.length === 0 ? (
                <div className="py-12 text-center">
                    <p className="text-sm text-gray-400">
                        This customer has no orders.
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-[#edf1f2]">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="p-6"
                        >
                            <div className="flex justify-between items-start mb-5">
                                <div>
                                    <Link
                                        to={`/admin/orders/show/${order.id}`}
                                        className="font-bold text-sm text-[#567C8D] hover:underline"
                                    >
                                        Order #{order.id}
                                    </Link>

                                    <p className="text-xs text-gray-400 mt-1">
                                        {formatDate(
                                            order.created_at
                                        )}
                                    </p>
                                </div>

                                <p className="font-bold">
                                    {Number(
                                        order.total_amount
                                    ).toFixed(2)}{" "}
                                    DH
                                </p>
                            </div>

                            <div className="flex gap-2 mb-5">
                                <StatusBadge
                                    value={
                                        order.order_status
                                    }
                                />

                                <StatusBadge
                                    value={
                                        order.shipping_status
                                    }
                                />

                                <StatusBadge
                                    value={
                                        order.payment_status
                                    }
                                />
                            </div>

                            <div className="space-y-3">
                                {order.items.map(
                                    (item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between rounded-xl bg-[#fafbfb] p-4"
                                        >
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {
                                                        item.product_name
                                                    }
                                                </p>

                                                {item.variant_attributes_snapshot && (
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {formatAttributes(
                                                            item.variant_attributes_snapshot
                                                        )}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="text-right">
                                                <p className="text-sm font-semibold">
                                                    ×{" "}
                                                    {
                                                        item.quantity
                                                    }
                                                </p>

                                                <p className="text-xs text-gray-400 mt-1">
                                                    {Number(
                                                        item.price
                                                    ).toFixed(
                                                        2
                                                    )}{" "}
                                                    DH
                                                </p>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>

                            <div className="mt-5 pt-5 border-t border-[#edf1f2]">
                                <p className="text-xs text-gray-400">
                                    Shipping address
                                </p>

                                <p className="text-sm mt-1">
                                    {
                                        order.shipping_address
                                    }
                                    ,{" "}
                                    {
                                        order.shipping_city
                                    }
                                    ,{" "}
                                    {
                                        order.shipping_region
                                    }
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function CustomerReviews({
    reviews,
}) {
    return (
        <div className="bg-white border border-[#dce4e7] rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[#e6ecee]">
                <h2 className="text-lg font-bold">
                    Reviews
                </h2>
            </div>

            {reviews.length === 0 ? (
                <div className="py-12 text-center">
                    <p className="text-sm text-gray-400">
                        This customer has no reviews.
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-[#edf1f2]">
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            className="p-6"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-sm">
                                        {review.product_name}
                                    </p>

                                    <div className="flex items-center gap-1 mt-2">
                                        {[1, 2, 3, 4, 5].map(
                                            (star) => (
                                                <span
                                                    key={
                                                        star
                                                    }
                                                    className={
                                                        star <=
                                                        review.rating
                                                            ? "text-[#D4A017]"
                                                            : "text-gray-200"
                                                    }
                                                >
                                                    ★
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>

                                <span className="text-xs text-gray-400">
                                    {formatDate(
                                        review.created_at
                                    )}
                                </span>
                            </div>

                            {review.comment && (
                                <p className="text-sm text-gray-600 mt-4 leading-6">
                                    {review.comment}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function InfoRow({
    label,
    value,
}) {
    return (
        <div>
            <p className="text-xs text-gray-400">
                {label}
            </p>

            <p className="text-sm font-medium mt-1 break-words">
                {value}
            </p>
        </div>
    );
}

function StatusBadge({
    value,
}) {
    const normalized = String(
        value
    ).toUpperCase();

    return (
        <span className="inline-flex rounded-full bg-[#eef3f5] px-3 py-1 text-[11px] font-medium text-[#567C8D]">
            {normalized.replaceAll("_", " ")}
        </span>
    );
}

function formatAttributes(
    attributes
) {
    if (!attributes) {
        return "";
    }

    return Object.entries(attributes)
        .map(
            ([key, value]) =>
                `${key}: ${value}`
        )
        .join(" • ");
}

function formatDate(
    value
) {
    if (!value) {
        return "—";
    }

    return new Date(value).toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
}

export default CustomerShow;
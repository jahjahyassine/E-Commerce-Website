import { useList, useUpdate } from "@refinedev/core";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from "@tanstack/react-table";
import { Fragment, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import DotField from "../../../../components/animation/DotField.jsx";
import { Search, X, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ============================================================
   STATUS STYLES (read-only badge colors — unchanged)
   ============================================================ */
const shippingStatusStyles = {
    NOT_SHIPPED:
        "text-admin-warning bg-admin-warning/10 border-admin-warning/40",
    SHIPPED:
        "text-admin-primary bg-admin-primary/10 border-admin-primary/40",
    DELIVERED:
        "text-admin-success bg-admin-success/10 border-admin-success/40",
};

const orderStatusStyles = {
    PENDING:
        "text-admin-warning bg-admin-warning/10 border-admin-warning/40",
    CONFIRMED:
        "text-admin-primary bg-admin-primary/10 border-admin-primary/40",
    COMPLETED:
        "text-admin-success bg-admin-success/10 border-admin-success/40",
    CANCELLED:
        "text-admin-danger bg-admin-danger/10 border-admin-danger/40",
};

const paymentStatusStyles = {
    PENDING:
        "text-admin-warning bg-admin-warning/10 border-admin-warning/40",
    PAID:
        "text-admin-success bg-admin-success/10 border-admin-success/40",
    REFUNDED:
        "text-admin-primary bg-admin-primary/10 border-admin-primary/40",
};

/* ============================================================
   OPTIONS — still used for the read-only badge labels and the
   list filter dropdowns. NOT used to build write payloads.
   ============================================================ */
const shippingStatusOptions = [
    { value: "NOT_SHIPPED", label: "Not Shipped" },
    { value: "SHIPPED", label: "Shipped" },
    { value: "DELIVERED", label: "Delivered" },
];

const orderStatusOptions = [
    { value: "PENDING", label: "Pending" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
];

const paymentStatusOptions = [
    { value: "PENDING", label: "Pending" },
    { value: "PAID", label: "Paid" },
    { value: "REFUNDED", label: "Refunded" },
];

/* ============================================================
   LIFECYCLE — this mirrors the backend state machine for UX
   purposes only. It is NOT the source of truth: the backend
   still enforces every transition rule independently. This
   just decides which actions to *show* the admin.
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

/**
 * Derive the current lifecycle stage from the three DB fields, purely
 * for deciding which action(s) to display. If the combination doesn't
 * match a known lifecycle stage (e.g. legacy/inconsistent data), no
 * actions are offered — the admin should investigate that order
 * directly rather than being offered a guessed action.
 */
function deriveLifecycle(order) {
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

/* ============================================================
   STATUS BADGE (read-only)
   ============================================================ */
function StatusBadge({ label, styles }) {
    return (
        <span
            className={`inline-block rounded-md border px-2 py-1 text-sm font-medium ${
                styles || ""
            }`}
        >
            {label}
        </span>
    );
}

/* ============================================================
   LIFECYCLE ACTION SELECT
   Replaces the old three independent StatusEditor dropdowns.
   Selecting an action immediately fires the mutation with
   ONLY `{ status: <action> }` — the backend derives everything
   else.
   ============================================================ */
function LifecycleActionSelect({ order, disabled, onSelect }) {
    const lifecycle = deriveLifecycle(order);
    const actions = lifecycle ? LIFECYCLE_ACTIONS[lifecycle] ?? [] : [];

    if (!lifecycle || actions.length === 0) {
        return (
            <span className="text-sm text-admin-muted italic">
                No actions available
            </span>
        );
    }

    return (
        <div
            className="relative"
            onClick={(e) => e.stopPropagation()}
        >
            <select
                defaultValue=""
                disabled={disabled}
                onChange={(e) => {
                    const value = e.target.value;
                    if (!value) return;
                    onSelect(value);
                    // Reset back to placeholder; the row will re-render
                    // with the new server state once the mutation settles.
                    e.target.value = "";
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                className={`
                    appearance-none
                    min-w-[180px]
                    rounded-lg
                    border
                    border-admin-input-border
                    bg-admin-input
                    px-3
                    py-2
                    pr-9
                    text-sm
                    text-admin-text
                    outline-none
                    cursor-pointer
                    focus:border-admin-primary
                    transition-colors
                    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                `}
            >
                <option value="" disabled>
                    {disabled ? "Updating..." : "Select action..."}
                </option>
                {actions.map((action) => (
                    <option
                        key={action.status}
                        value={action.status}
                        className="bg-admin-surface text-admin-text"
                    >
                        {action.label}
                    </option>
                ))}
            </select>
            <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-admin-muted"
            />
        </div>
    );
}

/* ============================================================
   ORDER LIST
   ============================================================ */
export function OrderList() {
    const navigate = useNavigate();
    const [rowSelection, setRowSelection] = useState({});
    const [expandedRows, setExpandedRows] = useState({});
    const [search, setSearch] = useState("");
    const [shippingStatus, setShippingStatus] = useState("all");
    const [orderStatus, setOrderStatus] = useState("all");
    const [paymentStatus, setPaymentStatus] = useState("all");
    const [updatingOrderId, setUpdatingOrderId] = useState(null);

    const { mutate: updateOrder } = useUpdate();

    const toggleExpanded = (orderId) => {
        setExpandedRows((previous) => ({
            ...previous,
            [orderId]: !previous[orderId],
        }));
    };

    /* ========================================================
       UPDATE ORDER — sends ONLY the lifecycle action. The
       backend derives order_status / shipping_status /
       payment_status. Pessimistic mode: order updates can also
       touch inventory + stock history, so we wait for the
       backend to confirm before trusting the UI state.
       ======================================================== */
    const updateOrderLifecycle = (order, nextStatus) => {
        setUpdatingOrderId(order.id);

        updateOrder(
            {
                resource: "orders",
                id: order.id,
                values: {
                    status: nextStatus,
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
                onSettled: () => {
                    setUpdatingOrderId(null);
                },
            }
        );
    };

    /* ========================================================
       FILTERS
       ======================================================== */
    const hasFilters =
        search !== "" ||
        shippingStatus !== "all" ||
        orderStatus !== "all" ||
        paymentStatus !== "all";

    const resetFilters = () => {
        setSearch("");
        setShippingStatus("all");
        setOrderStatus("all");
        setPaymentStatus("all");
    };

    /* ========================================================
       FETCH ORDERS
       ======================================================== */
    const {
        result: { data: orders = [], total: totalOrders = 0 },
        query: { isError, isPending, error: ordersError },
    } = useList({
        resource: "orders",
        filters: [
            ...(search.trim()
                ? [
                      {
                          field: "search",
                          operator: "contains",
                          value: search.trim(),
                      },
                  ]
                : []),
            ...(shippingStatus !== "all"
                ? [
                      {
                          field: "shipping_status",
                          operator: "eq",
                          value: shippingStatus,
                      },
                  ]
                : []),
            ...(orderStatus !== "all"
                ? [
                      {
                          field: "order_status",
                          operator: "eq",
                          value: orderStatus,
                      },
                  ]
                : []),
            ...(paymentStatus !== "all"
                ? [
                      {
                          field: "payment_status",
                          operator: "eq",
                          value: paymentStatus,
                      },
                  ]
                : []),
        ],
        pagination: null,
        sorters: null,
    });

    /* ========================================================
       TABLE COLUMNS
       ======================================================== */
    const columns = [
        {
            id: "select",
            header: ({ table }) => (
                <input
                    type="checkbox"
                    checked={table.getIsAllRowsSelected()}
                    ref={(element) => {
                        if (element) {
                            element.indeterminate =
                                table.getIsSomeRowsSelected();
                        }
                    }}
                    onChange={table.getToggleAllRowsSelectedHandler()}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="h-4 w-4 cursor-pointer accent-blue-500"
                />
            ),
            cell: ({ row }) => (
                <input
                    type="checkbox"
                    checked={row.getIsSelected()}
                    disabled={!row.getCanSelect()}
                    onChange={row.getToggleSelectedHandler()}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="h-4 w-4 cursor-pointer accent-blue-500"
                />
            ),
        },
        {
            accessorKey: "id",
            header: "Order Id",
            cell: (info) => (
                <button
                    type="button"
                    onClick={() =>
                        navigate(`/admin/orders/${info.getValue()}`)
                    }
                    className="text-admin-muted hover:text-admin-primary transition-colors cursor-pointer"
                >
                    Order{" "}
                    <span className="font-bold text-admin-text">
                        #{info.getValue()}
                    </span>
                </button>
            ),
        },
        {
            id: "customer",
            header: "Customer",
            cell: (info) => {
                const user = info.row.original.user;
                return (
                    <p className="text-admin-text">
                        {user?.full_name || user?.username || "Unknown"}
                    </p>
                );
            },
        },
        {
            accessorKey: "created_at",
            header: "Ordered",
            cell: (info) => {
                const value = info.getValue();
                if (!value) {
                    return "-";
                }
                const date = new Date(value);
                return (
                    <p className="text-admin-muted">
                        {date.toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </p>
                );
            },
        },
        {
            accessorKey: "total_amount",
            header: "Total",
            cell: (info) => (
                <p className="font-medium">
                    {Number(info.getValue() || 0).toFixed(2)} DH
                </p>
            ),
        },
        {
            accessorKey: "shipping_status",
            header: "Shipping Status",
            cell: (info) => (
                <StatusBadge
                    label={
                        shippingStatusOptions.find(
                            (option) => option.value === info.getValue()
                        )?.label || info.getValue()
                    }
                    styles={shippingStatusStyles[info.getValue()]}
                />
            ),
        },
        {
            accessorKey: "order_status",
            header: "Order Status",
            cell: (info) => (
                <StatusBadge
                    label={
                        orderStatusOptions.find(
                            (option) => option.value === info.getValue()
                        )?.label || info.getValue()
                    }
                    styles={orderStatusStyles[info.getValue()]}
                />
            ),
        },
        {
            accessorKey: "payment_status",
            header: "Payment Status",
            cell: (info) => (
                <StatusBadge
                    label={
                        paymentStatusOptions.find(
                            (option) => option.value === info.getValue()
                        )?.label || info.getValue()
                    }
                    styles={paymentStatusStyles[info.getValue()]}
                />
            ),
        },
        {
            id: "expand",
            header: "",
            cell: ({ row }) => (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleExpanded(row.original.id);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="flex items-center justify-center h-8 w-8 rounded-lg border border-admin-border text-admin-muted hover:text-admin-text hover:border-admin-border-hover transition-colors cursor-pointer"
                >
                    <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                            expandedRows[row.original.id]
                                ? "rotate-180"
                                : ""
                        }`}
                    />
                </button>
            ),
        },
    ];

    /* ========================================================
       TABLE
       ======================================================== */
    const table = useReactTable({
        data: orders,
        columns,
        getCoreRowModel: getCoreRowModel(),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        state: {
            rowSelection,
        },
    });

    /* ========================================================
       LOADING / ERROR
       ======================================================== */
    if (isPending) {
        return (
            <section className="h-screen max-w-full font-sans bg-[#0F172A] text-admin-text flex justify-center items-center">
                <div>Loading orders...</div>
            </section>
        );
    }

    if (isError) {
        return (
            <section className="h-screen max-w-full font-sans bg-[#0F172A] text-admin-text flex justify-center items-center">
                <div>
                    Error: {ordersError?.message || "Failed to load orders"}
                </div>
            </section>
        );
    }

    /* ========================================================
       RENDER
       ======================================================== */
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

            <section className="relative z-10 h-screen flex-1 text-admin-text order-2 overflow-y-auto p-4">
                <div className="flex items-center justify-between gap-4 border-b border-admin-border pb-3 mb-4">
                    <h1 className="text-3xl">Orders</h1>
                </div>

                {/* FILTERS */}
                <div className="border border-admin-border bg-admin-surface rounded-2xl p-4 mb-4">
                    <p className="text-admin-muted text-sm pb-2">Filters</p>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-admin-muted" />
                            <input
                                type="text"
                                placeholder="Search ordered products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-64 pl-9 pr-3 py-2 rounded-lg bg-admin-input border border-admin-input-border text-admin-text placeholder:text-admin-muted outline-none focus:border-admin-primary transition-colors"
                            />
                        </div>

                        <select
                            value={shippingStatus}
                            onChange={(e) =>
                                setShippingStatus(e.target.value)
                            }
                            className="px-3 py-2 rounded-lg bg-admin-input border border-admin-input-border text-admin-text outline-none focus:border-admin-primary"
                        >
                            <option value="all">All Shipping</option>
                            <option value="NOT_SHIPPED">Not Shipped</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                        </select>

                        <select
                            value={orderStatus}
                            onChange={(e) => setOrderStatus(e.target.value)}
                            className="px-3 py-2 rounded-lg bg-admin-input border border-admin-input-border text-admin-text outline-none focus:border-admin-primary"
                        >
                            <option value="all">All Orders</option>
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>

                        <select
                            value={paymentStatus}
                            onChange={(e) =>
                                setPaymentStatus(e.target.value)
                            }
                            className="px-3 py-2 rounded-lg bg-admin-input border border-admin-input-border text-admin-text outline-none focus:border-admin-primary"
                        >
                            <option value="all">All Payments</option>
                            <option value="PENDING">Pending</option>
                            <option value="PAID">Paid</option>
                            <option value="REFUNDED">Refunded</option>
                        </select>

                        {hasFilters && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="flex items-center gap-1 px-4 py-2 bg-admin-input rounded-lg border border-admin-border text-admin-muted hover:text-admin-text hover:border-admin-border-hover duration-300 transition-colors cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* TOTAL */}
                <div className="flex justify-center border-b border-admin-border pb-4 mb-4 px-6 gap-5 items-center">
                    <h3 className="text-admin-muted font-bold">
                        Total Orders
                    </h3>
                    <p className="text-lg font-bold">{totalOrders}</p>
                </div>

                {/* TABLE */}
                <div className="overflow-hidden border border-admin-border bg-admin-surface rounded-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead className="border-b border-admin-border bg-admin-input">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            className="px-6 py-4 text-sm font-semibold text-admin-muted text-left whitespace-nowrap"
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext()
                                                  )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>

                        <tbody>
                            {table.getRowModel().rows.length > 0 ? (
                                table.getRowModel().rows.map((row) => {
                                    const order = row.original;
                                    const orderId = order.id;

                                    return (
                                        <Fragment key={orderId}>
                                            <tr
                                                onClick={(e) => {
                                                    if (
                                                        e.target.closest(
                                                            "select, input, button, a"
                                                        )
                                                    ) {
                                                        return;
                                                    }
                                                    navigate(
                                                        `/admin/orders/${orderId}`
                                                    );
                                                }}
                                                className={`border-b border-admin-border transition-colors hover:bg-admin-surface-hover cursor-pointer ${
                                                    row.getIsSelected()
                                                        ? "bg-admin-surface-hover"
                                                        : ""
                                                }`}
                                            >
                                                {row
                                                    .getVisibleCells()
                                                    .map((cell) => (
                                                        <td
                                                            key={cell.id}
                                                            className="px-6 py-5 text-sm"
                                                        >
                                                            {flexRender(
                                                                cell.column
                                                                    .columnDef
                                                                    .cell,
                                                                cell.getContext()
                                                            )}
                                                        </td>
                                                    ))}
                                            </tr>

                                            {expandedRows[orderId] && (
                                                <tr className="border-b border-admin-border bg-admin-input/40">
                                                    <td
                                                        colSpan={
                                                            columns.length
                                                        }
                                                        className="px-6 py-5"
                                                    >
                                                        <div className="flex flex-wrap items-end gap-6">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-xs font-semibold text-admin-muted uppercase tracking-wide">
                                                                    Lifecycle
                                                                    Action
                                                                </span>
                                                                <LifecycleActionSelect
                                                                    order={
                                                                        order
                                                                    }
                                                                    disabled={
                                                                        updatingOrderId ===
                                                                        orderId
                                                                    }
                                                                    onSelect={(
                                                                        status
                                                                    ) =>
                                                                        updateOrderLifecycle(
                                                                            order,
                                                                            status
                                                                        )
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="px-6 py-12 text-center text-admin-muted"
                                    >
                                        No Orders found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    );
}
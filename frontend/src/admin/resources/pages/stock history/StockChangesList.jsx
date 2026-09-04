import { useList } from "@refinedev/core";

import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from "@tanstack/react-table";

import {
    Search,
    X,
    Package,
    ArrowDownToLine,
    ArrowUpFromLine,
    Truck,
    ShoppingCart,
} from "lucide-react";

import { useMemo, useState } from "react";

import AdminSidebar from "../../components/AdminSidebar";
import DotField from "../../../../components/animation/DotField.jsx";



const columns = [
    {
        id: "product",
        header: "Product",

        accessorFn: (row) =>
            row.product_variant?.product?.name ??
            "",

        cell: (info) => {
            const stockChange = info.row.original;

            const variant =
                stockChange.product_variant;

            const product =
                variant?.product;

            const media = variant?.media ?? product?.media ?? []

            return (
                <div className="flex items-center gap-3">
                    <div
                        className="
                            w-10
                            h-10
                            rounded-lg
                            overflow-hidden
                            bg-slate-900
                            border
                            border-admin-border
                            flex
                            items-center
                            justify-center
                            shrink-0
                        "
                    >
                        {media[0].media_url ? (
                            <img
                                src={media[0].media_url}
                                alt={
                                    product?.name ||
                                    "Product"
                                }
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <Package
                                className="
                                    h-4
                                    w-4
                                    text-admin-primary
                                "
                            />
                        )}
                    </div>

                    <div>
                        <p className="font-medium text-admin-text">
                            {product?.name ||
                                "Unknown Product"}
                        </p>

                        <p className="text-xs text-admin-muted mt-1">
                            {variant?.name ||
                                `Variant #${stockChange.product_variant_id}`}
                        </p>
                    </div>
                </div>
            );
        },
    },

    {
        id: "variant",
        header: "Variant",

        accessorFn: (row) =>
            row.product_variant?.name ??
            "",

        cell: (info) => {
            const stockChange =
                info.row.original;

            const variant =
                stockChange.product_variant;

            return (
                <div>
                    <p className="text-sm text-admin-text">
                        {variant?.sku || "—"}
                    </p>
                </div>
            );
        },
    },

    {
        accessorKey: "change_type",
        header: "Type",

        cell: (info) => {
            const type = info.getValue();

            return type === "IN" ? (
                <span className="flex items-center gap-2 text-admin-active">
                    <span
                        className="
                            h-7
                            w-7
                            rounded-lg
                            bg-admin-active/10
                            flex
                            items-center
                            justify-center
                        "
                    >
                        <ArrowDownToLine className="h-4 w-4" />
                    </span>

                    <span>Stock In</span>
                </span>
            ) : (
                <span className="flex items-center gap-2 text-admin-inactive">
                    <span
                        className="
                            h-7
                            w-7
                            rounded-lg
                            bg-admin-inactive/10
                            flex
                            items-center
                            justify-center
                        "
                    >
                        <ArrowUpFromLine className="h-4 w-4" />
                    </span>

                    <span>Stock Out</span>
                </span>
            );
        },
    },

    {
        accessorKey: "quantity",
        header: "Quantity",

        cell: (info) => {
            const stockChange =
                info.row.original;

            const type =
                stockChange.change_type;

            return (
                <span
                    className={
                        type === "IN"
                            ? "font-semibold text-admin-active"
                            : "font-semibold text-admin-inactive"
                    }
                >
                    {type === "IN" ? "+" : "-"}
                    {info.getValue()}
                </span>
            );
        },
    },

    {
        id: "source",
        header: "Source",

        accessorFn: (row) =>
            row.supplier?.name ??
            row.order_id ??
            "",

        cell: (info) => {
            const stockChange =
                info.row.original;

            if (stockChange.supplier) {
                return (
                    <div className="flex items-center gap-2">
                        <Truck
                            className="
                                h-4
                                w-4
                                text-admin-muted
                            "
                        />

                        <div>
                            <p className="text-sm text-admin-text">
                                {
                                    stockChange
                                        .supplier
                                        .name
                                }
                            </p>

                            <p className="text-xs text-admin-muted mt-1">
                                Supplier
                            </p>
                        </div>
                    </div>
                );
            }

            if (stockChange.order_id) {
                return (
                    <div className="flex items-center gap-2">
                        <ShoppingCart
                            className="
                                h-4
                                w-4
                                text-admin-muted
                            "
                        />

                        <div>
                            <p className="text-sm text-admin-text">
                                Order #
                                {
                                    stockChange.order_id
                                }
                            </p>

                            <p className="text-xs text-admin-muted mt-1">
                                Order
                            </p>
                        </div>
                    </div>
                );
            }

            return (
                <span className="text-sm text-admin-muted">
                    —
                </span>
            );
        },
    },

    {
        accessorKey: "changed_at",
        header: "Changed At",

        cell: (info) => {
            const date = info.getValue();

            if (!date) {
                return (
                    <span className="text-admin-muted">
                        —
                    </span>
                );
            }

            const parsedDate = new Date(date);

            return (
                <div>
                    <p className="text-sm text-admin-text whitespace-nowrap">
                        {parsedDate.toLocaleDateString(
                            "en-GB",
                            {
                                dateStyle: "medium",
                            }
                        )}
                    </p>

                    <p className="text-xs text-admin-muted mt-1">
                        {parsedDate.toLocaleTimeString(
                            "en-GB",
                            {
                                hour: "2-digit",
                                minute: "2-digit",
                            }
                        )}
                    </p>
                </div>
            );
        },
    },
];


export default function StockChangesList() {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] =
        useState("");

    const hasFilters =
        search !== "" ||
        typeFilter !== "";

    /* ========================================================
       FILTERS
    ======================================================== */

    const filters = useMemo(() => {
        const filters = [];

        if (search.trim()) {
            filters.push({
                field: "search",
                operator: "eq",
                value: search.trim(),
            });
        }

        if (typeFilter) {
            filters.push({
                field: "change_type",
                operator: "eq",
                value: typeFilter,
            });
        }

        return filters;
    }, [search, typeFilter]);

    /* ========================================================
       FETCH
    ======================================================== */

    const {
        result: {
            data,
            total,
        },
        query: {
            isPending,
            isError,
            error,
        },
    } = useList({
        resource: "stock-changes",
        filters,
        pagination: null,
        sorters: null,
    });

    const stockChanges = data ?? [];

    /* ========================================================
       STATISTICS
    ======================================================== */

    const totalChanges =
        total ?? stockChanges.length;

    const totalStockIn =
        stockChanges
            .filter(
                (change) =>
                    change.change_type === "IN"
            )
            .reduce(
                (sum, change) =>
                    sum +
                    Number(change.quantity || 0),
                0
            );

    const totalStockOut =
        stockChanges
            .filter(
                (change) =>
                    change.change_type === "OUT"
            )
            .reduce(
                (sum, change) =>
                    sum +
                    Number(change.quantity || 0),
                0
            );

    const resetFilters = () => {
        setSearch("");
        setTypeFilter("");
    };

    /* ========================================================
       TABLE
    ======================================================== */

    const table = useReactTable({
        data: stockChanges,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const rows = table
        .getRowModel()
        .rows;

    /* ========================================================
       LOADING
    ======================================================== */

    if (isPending) {
        return (
            <section className="h-screen bg-[#0F172A] text-admin-text flex items-center justify-center">
                Loading stock changes...
            </section>
        );
    }

    /* ========================================================
       ERROR
    ======================================================== */

    if (isError) {
        return (
            <section className="h-screen bg-[#0F172A] text-admin-text flex items-center justify-center">
                Error: {error?.message}
            </section>
        );
    }

    /* ========================================================
       MAIN
    ======================================================== */

    return (
        <main className="h-screen max-w-full font-sans bg-[#0F172A] flex gap-4">

            {/* SIDEBAR */}

            <header className="relative z-10 h-screen">
                <AdminSidebar />
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

            {/* CONTENT */}

            <section
                className="
                    relative
                    z-10
                    h-screen
                    flex-1
                    overflow-y-auto
                    p-4
                    text-admin-text
                "
            >

                {/* HEADER */}

                <div
                    className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        border-b
                        border-admin-border
                        pb-3
                        mb-4
                    "
                >
                    <div>
                        <h1 className="text-3xl">
                            Stock Changes
                        </h1>

                        <p className="text-sm text-admin-muted mt-1">
                            View and track all inventory stock movements.
                        </p>
                    </div>
                </div>

                {/* STATISTICS */}

                <div
                    className="
                        grid
                        grid-cols-1
                        sm:grid-cols-3
                        gap-4
                        mb-6
                    "
                >
                    <StatCard
                        icon={
                            <Package className="h-5 w-5" />
                        }
                        label="Total Changes"
                        value={totalChanges}
                    />

                    <StatCard
                        icon={
                            <ArrowDownToLine className="h-5 w-5" />
                        }
                        label="Stock In"
                        value={totalStockIn}
                    />

                    <StatCard
                        icon={
                            <ArrowUpFromLine className="h-5 w-5" />
                        }
                        label="Stock Out"
                        value={totalStockOut}
                    />
                </div>

                {/* FILTERS */}

                <div
                    className="
                        border
                        border-admin-border
                        bg-admin-surface
                        rounded-2xl
                        p-4
                        mb-4
                    "
                >
                    <p className="text-admin-muted text-sm pb-3">
                        Filters
                    </p>

                    <div className="flex flex-wrap items-center gap-3">

                        {/* SEARCH */}

                        <div className="relative">
                            <Search
                                className="
                                    absolute
                                    left-3
                                    top-1/2
                                    -translate-y-1/2
                                    h-4
                                    w-4
                                    text-admin-muted
                                "
                            />

                            <input
                                type="text"
                                placeholder="Search stock changes..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                className="
                                    w-72
                                    pl-9
                                    pr-10
                                    py-2
                                    rounded-lg
                                    bg-slate-900
                                    border
                                    border-admin-border
                                    text-admin-text
                                    placeholder:text-admin-muted
                                    outline-none
                                    focus:border-admin-primary
                                    transition-colors
                                "
                            />

                            {search && (
                                <button
                                    onClick={() =>
                                        setSearch("")
                                    }
                                    className="
                                        absolute
                                        right-3
                                        top-1/2
                                        -translate-y-1/2
                                        text-admin-muted
                                        hover:text-admin-text
                                    "
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* TYPE */}

                        <select
                            value={typeFilter}
                            onChange={(event) =>
                                setTypeFilter(
                                    event.target.value
                                )
                            }
                            className="
                                px-3
                                py-2
                                rounded-lg
                                bg-slate-900
                                border
                                border-admin-border
                                text-admin-text
                                outline-none
                                focus:border-admin-primary
                            "
                        >
                            <option value="">
                                All Types
                            </option>

                            <option value="IN">
                                Stock In
                            </option>

                            <option value="OUT">
                                Stock Out
                            </option>
                        </select>

                        {/* RESET */}

                        {hasFilters && (
                            <button
                                onClick={resetFilters}
                                className="
                                    flex
                                    items-center
                                    gap-1
                                    px-4
                                    py-2
                                    rounded-lg
                                    bg-white/10
                                    border
                                    border-admin-border
                                    text-admin-muted
                                    hover:text-admin-text
                                    transition-colors
                                "
                            >
                                <X className="h-4 w-4" />
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* TOTAL */}

                <div
                    className="
                        flex
                        justify-between
                        border-b
                        border-admin-border
                        pb-4
                        mb-4
                        px-6
                    "
                >
                    <div>
                        <h3 className="text-admin-muted font-bold">
                            Stock Changes
                        </h3>

                        <p className="text-lg font-bold">
                            {totalChanges}
                        </p>
                    </div>
                </div>

                {/* TABLE */}

                <div className="overflow-hidden border border-slate-700 bg-admin-surface rounded-2xl">

                    <div className="overflow-x-auto">

                        <table className="w-full text-left">

                            <thead className="border-b border-slate-700 bg-slate-900">

                                {table
                                    .getHeaderGroups()
                                    .map(
                                        (headerGroup) => (
                                            <tr
                                                key={
                                                    headerGroup.id
                                                }
                                            >
                                                {headerGroup.headers.map(
                                                    (
                                                        header
                                                    ) => (
                                                        <th
                                                            key={
                                                                header.id
                                                            }
                                                            className="
                                                                px-6
                                                                py-4
                                                                text-sm
                                                                font-semibold
                                                                text-admin-muted
                                                            "
                                                        >
                                                            {header.isPlaceholder
                                                                ? null
                                                                : flexRender(
                                                                      header
                                                                          .column
                                                                          .columnDef
                                                                          .header,
                                                                      header.getContext()
                                                                  )}
                                                        </th>
                                                    )
                                                )}
                                            </tr>
                                        )
                                    )}

                            </thead>

                            <tbody>

                                {rows.length > 0 ? (

                                    rows.map((row) => (

                                        <tr
                                            key={row.id}
                                            className="
                                                border-b
                                                border-slate-700/70
                                                transition-colors
                                                hover:bg-slate-800/60
                                            "
                                        >

                                            {row
                                                .getVisibleCells()
                                                .map(
                                                    (
                                                        cell
                                                    ) => (
                                                        <td
                                                            key={
                                                                cell.id
                                                            }
                                                            className="px-6 py-5 text-sm"
                                                        >
                                                            {flexRender(
                                                                cell
                                                                    .column
                                                                    .columnDef
                                                                    .cell,
                                                                cell.getContext()
                                                            )}
                                                        </td>
                                                    )
                                                )}

                                        </tr>

                                    ))

                                ) : (

                                    <tr>

                                        <td
                                            colSpan={
                                                columns.length
                                            }
                                            className="
                                                px-6
                                                py-12
                                                text-center
                                                text-admin-muted
                                            "
                                        >
                                            <Package
                                                className="
                                                    h-8
                                                    w-8
                                                    mx-auto
                                                    mb-3
                                                "
                                            />

                                            <p>
                                                {hasFilters
                                                    ? "No stock changes match your filters."
                                                    : "No stock changes found."}
                                            </p>
                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>
                </div>

                {/* RESULT COUNT */}

                <div
                    className="
                        flex
                        justify-between
                        items-center
                        text-xs
                        text-admin-muted
                        px-1
                        mt-4
                    "
                >
                    <span>
                        Showing {rows.length} of{" "}
                        {totalChanges} stock changes
                    </span>
                </div>

            </section>
        </main>
    );
}

/* ============================================================
   STAT CARD
============================================================ */

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

            <p className="text-2xl font-bold">
                {value}
            </p>
        </div>
    );
}

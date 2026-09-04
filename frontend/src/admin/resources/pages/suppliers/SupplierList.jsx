import { useList } from "@refinedev/core";

import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from "@tanstack/react-table";

import {
    Search,
    X,
    Plus,
    Building2,
    Mail,
    Phone,
    MapPin,
    Power,
    PowerOff,
} from "lucide-react";

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminSidebar from "../../components/AdminSidebar";
import DotField from "../../../../components/animation/DotField.jsx";

/* ============================================================
   TABLE COLUMNS
============================================================ */

const columns = [
    {
        accessorKey: "name",
        header: "Supplier",

        cell: (info) => {
            const supplier = info.row.original;

            return (
                <div className="flex items-center gap-3">
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
                        <Building2
                            className="
                                h-4
                                w-4
                                text-admin-primary
                            "
                        />
                    </div>

                    <div>
                        <p className="font-semibold text-sm text-admin-text">
                            {supplier.name}
                        </p>

                        <p className="text-xs text-admin-muted mt-1">
                            #{supplier.id}
                        </p>
                    </div>
                </div>
            );
        },
    },

    {
        id: "contact",
        header: "Contact",

        accessorFn: (row) =>
            `${row.email ?? ""} ${row.phone ?? ""}`,

        cell: (info) => {
            const supplier = info.row.original;

            return (
                <div className="space-y-2">
                    {supplier.email && (
                        <div className="flex items-center gap-2 text-sm text-admin-text">
                            <Mail className="h-3.5 w-3.5 text-admin-muted" />

                            <span>
                                {supplier.email}
                            </span>
                        </div>
                    )}

                    {supplier.phone && (
                        <div className="flex items-center gap-2 text-xs text-admin-muted">
                            <Phone className="h-3.5 w-3.5" />

                            <span>
                                {supplier.phone}
                            </span>
                        </div>
                    )}

                    {!supplier.email && !supplier.phone && (
                        <span className="text-sm text-admin-muted">
                            —
                        </span>
                    )}
                </div>
            );
        },
    },

    {
        accessorKey: "address",
        header: "Address",

        cell: (info) => {
            const address = info.getValue();

            return address ? (
                <div className="flex items-start gap-2 max-w-[260px]">
                    <MapPin
                        className="
                            h-4
                            w-4
                            text-admin-muted
                            mt-0.5
                            shrink-0
                        "
                    />

                    <span
                        className="
                            truncate
                            text-sm
                            text-admin-muted
                        "
                        title={address}
                    >
                        {address}
                    </span>
                </div>
            ) : (
                <span className="text-sm text-admin-muted">
                    —
                </span>
            );
        },
    },

    {
        accessorKey: "created_at",
        header: "Created",

        cell: (info) => {
            const date = info.getValue();

            if (!date) {
                return (
                    <span className="text-admin-muted">
                        —
                    </span>
                );
            }

            return (
                <span className="text-sm text-admin-muted whitespace-nowrap">
                    {new Date(date).toLocaleDateString(
                        "en-GB",
                        {
                            dateStyle: "medium",
                        }
                    )}
                </span>
            );
        },
    },

    {
        accessorKey: "is_active",
        header: "Status",

        cell: (info) => {
            const active = info.getValue();

            return active ? (
                <span className="flex items-center gap-2 text-admin-active">
                    <span
                        className="
                            h-1.5
                            w-1.5
                            rounded-full
                            bg-admin-active
                            shadow-[0_0_8px_2px_rgba(52,211,153,0.6)]
                        "
                    />

                    Active
                </span>
            ) : (
                <span className="flex items-center gap-2 text-admin-inactive">
                    <span
                        className="
                            h-1.5
                            w-1.5
                            rounded-full
                            bg-minimal-red
                            shadow-[0_0_8px_2px_rgba(248,113,113,0.6)]
                        "
                    />

                    Inactive
                </span>
            );
        },
    },

    {
        id: "actions",
        header: "Actions",

        cell: (info) => {
            const supplier = info.row.original;

            return (
                <button
                    onClick={(event) => {
                        event.stopPropagation();

                        window.location.href = `/admin/suppliers/${supplier.id}`;
                    }}
                    className="
                        px-3
                        py-2
                        rounded-lg
                        border
                        border-admin-border
                        text-xs
                        font-medium
                        text-admin-muted
                        hover:text-admin-text
                        hover:bg-slate-800
                        transition-colors
                    "
                >
                    View
                </button>
            );
        },
    },
];

/* ============================================================
   SUPPLIER LIST
============================================================ */

export function SupplierList() {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    /* ========================================================
       REFINE FILTERS
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

        if (statusFilter) {
            filters.push({
                field: "is_active",
                operator: "eq",
                value: statusFilter === "true",
            });
        }

        return filters;
    }, [search, statusFilter]);

    /* ========================================================
       FETCH SUPPLIERS
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
        resource: "suppliers",
        filters,
        pagination: null,
        sorters: null,
    });

    const suppliers = data ?? [];

    /* ========================================================
       STATISTICS
    ======================================================== */

    const totalSuppliers = total ?? suppliers.length;

    const activeSuppliers = suppliers.filter(
        (supplier) => supplier.is_active
    ).length;

    const inactiveSuppliers = suppliers.filter(
        (supplier) => !supplier.is_active
    ).length;

    /* ========================================================
       RESET FILTERS
    ======================================================== */

    const hasFilters =
        search !== "" ||
        statusFilter !== "";

    const resetFilters = () => {
        setSearch("");
        setStatusFilter("");
    };

    /* ========================================================
       TANSTACK TABLE
    ======================================================== */

    const table = useReactTable({
        data: suppliers,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const rows = table.getRowModel().rows;

    /* ========================================================
       LOADING
    ======================================================== */

    if (isPending) {
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
                Loading suppliers...
            </section>
        );
    }

    /* ========================================================
       ERROR
    ======================================================== */

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
                        onClick={() => navigate("/admin")}
                        className="
                            px-4
                            py-2
                            rounded-lg
                            bg-admin-primary
                            hover:bg-admin-primary-hover
                            transition-colors
                        "
                    >
                        Back to Dashboard
                    </button>
                </div>
            </section>
        );
    }

    /* ========================================================
       MAIN
    ======================================================== */

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
                        flex-col
                        sm:flex-row
                        sm:items-center
                        justify-between
                        gap-4
                        border-b
                        border-admin-border
                        pb-4
                        mb-6
                    "
                >
                    <div>
                        <h1 className="text-3xl font-semibold">
                            Suppliers
                        </h1>

                        <p className="text-sm text-admin-muted mt-1">
                            Manage your product suppliers
                        </p>
                    </div>

                    <button
                        onClick={() =>
                            navigate("/admin/suppliers/create")
                        }
                        className="
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            px-4
                            py-2.5
                            rounded-xl
                            bg-admin-primary
                            hover:bg-admin-primary-hover
                            text-white
                            text-sm
                            font-semibold
                            transition-colors
                        "
                    >
                        <Plus className="h-4 w-4" />

                        Add Supplier
                    </button>
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
                            <Building2 className="h-5 w-5" />
                        }
                        label="Total Suppliers"
                        value={totalSuppliers}
                    />

                    <StatCard
                        icon={
                            <Power className="h-5 w-5" />
                        }
                        label="Active"
                        value={activeSuppliers}
                    />

                    <StatCard
                        icon={
                            <PowerOff className="h-5 w-5" />
                        }
                        label="Inactive"
                        value={inactiveSuppliers}
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
                                placeholder="Search suppliers..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
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

                        {/* STATUS */}

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
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
                                All Statuses
                            </option>

                            <option value="true">
                                Active
                            </option>

                            <option value="false">
                                Inactive
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

                {/* RESULT COUNT */}

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
                            Total Suppliers
                        </h3>

                        <p className="text-lg font-bold">
                            {totalSuppliers}
                        </p>
                    </div>
                </div>

                {/* TABLE */}

                <div
                    className="
                        overflow-hidden
                        border
                        border-admin-border
                        bg-admin-surface
                        rounded-2xl
                    "
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead
                                className="
                                    border-b
                                    border-slate-700
                                    bg-slate-900
                                "
                            >
                                {table
                                    .getHeaderGroups()
                                    .map((headerGroup) => (
                                        <tr
                                            key={
                                                headerGroup.id
                                            }
                                        >
                                            {headerGroup.headers.map(
                                                (header) => (
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
                                    ))}
                            </thead>

                            <tbody>
                                {rows.length > 0 ? (
                                    rows.map((row) => (
                                        <tr
                                            key={row.id}
                                            onClick={() =>
                                                navigate(
                                                    `/admin/suppliers/${row.original.id}`
                                                )
                                            }
                                            className="
                                                border-b
                                                border-slate-700/70
                                                transition-colors
                                                hover:bg-slate-800/60
                                                cursor-pointer
                                            "
                                        >
                                            {row
                                                .getVisibleCells()
                                                .map((cell) => (
                                                    <td
                                                        key={
                                                            cell.id
                                                        }
                                                        className="
                                                            px-6
                                                            py-5
                                                            text-sm
                                                        "
                                                    >
                                                        {flexRender(
                                                            cell
                                                                .column
                                                                .columnDef
                                                                .cell,
                                                            cell.getContext()
                                                        )}
                                                    </td>
                                                ))}
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
                                            <Building2
                                                className="
                                                    h-8
                                                    w-8
                                                    mx-auto
                                                    mb-3
                                                "
                                            />

                                            <p>
                                                {hasFilters
                                                    ? "No suppliers match your filters."
                                                    : "No suppliers found."}
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
                        {totalSuppliers} suppliers
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
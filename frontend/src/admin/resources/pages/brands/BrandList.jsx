import {
    useList,
    useUpdateMany,
    useCreate,
    useInvalidate,
} from "@refinedev/core";

import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from "@tanstack/react-table";

import { useState } from "react";

import AdminSidebar from "../../components/AdminSidebar";
import DotField from "../../../../components/animation/DotField.jsx";

import {
    Plus,
    Search,
    X,
    Ban,
    Check,
} from "lucide-react";

import { useNavigate } from "react-router-dom";


const columns = [
    {
        id: "select",

        header: ({ table }) => (
            <input
                type="checkbox"
                checked={table.getIsAllRowsSelected()}
                onChange={table.getToggleAllRowsSelectedHandler()}
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
                className="h-4 w-4 cursor-pointer accent-blue-500"
            />
        ),
    },

    {
        accessorKey: "name",

        header: "Brand",

        cell: (info) => (
            <p className="font-medium">
                {info.getValue()}
            </p>
        ),
    },

    {
        accessorKey: "is_active",

        header: "Status",

        cell: (info) => {
            const isActive = info.getValue();

            return (
                <span
                    className={`
                        flex items-center gap-2
                        ${
                            isActive
                                ? "text-admin-active hover:text-admin-active-hover"
                                : "text-admin-inactive hover:text-admin-inactive-hover"
                        }
                        duration-300 ease-in-out
                    `}
                >
                    <span
                        className={`
                            h-1 w-1 rounded-full
                            ${
                                isActive
                                    ? "bg-admin-active shadow-[0_0_8px_2px_rgba(52,211,153,0.6)]"
                                    : "bg-minimal-red shadow-[0_0_8px_2px_rgba(248,113,113,0.6)]"
                            }
                        `}
                    />

                    {isActive ? "Active" : "Inactive"}
                </span>
            );
        },
    },
];


export function BrandList() {
    const navigate = useNavigate();
    const invalidate = useInvalidate();

    const [rowSelection, setRowSelection] = useState({});
    const [addBrand, setAddBrand] = useState(false);
    const [brandName, setBrandName] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");


    /*
    |--------------------------------------------------------------------------
    | Fetch Brands
    |--------------------------------------------------------------------------
    */

    const {
        result: {
            data: brands = [],
            total: totalBrands,
        },

        query: {
            isError,
            isPending,
            error: brandsError,
        },
    } = useList({
        resource: "brands",

        filters: [
            ...(search.trim()
                ? [
                    {
                        field: "name",
                        operator: "contains",
                        value: search.trim(),
                    },
                ]
                : []),

            ...(statusFilter !== "all"
                ? [
                    {
                        field: "is_active",
                        operator: "eq",
                        value: statusFilter === "active",
                    },
                ]
                : []),
        ],

        pagination: null,
        sorters: null,
    });


    /*
    |--------------------------------------------------------------------------
    | Create Brand
    |--------------------------------------------------------------------------
    */

    const {
        mutate: createBrand,
        mutation,
    } = useCreate({
        resource: "brands",

        mutationOptions: {
            onSuccess: async () => {
                setBrandName("");
                setAddBrand(false);

                await invalidate({
                    resource: "brands",
                    invalidates: ["list"],
                });
            },
        },
    });


    /*
    |--------------------------------------------------------------------------
    | Create Error Message
    |--------------------------------------------------------------------------
    */

    const getCreateErrorMessage = (error) => {
        if (!error) {
            return "Failed to create brand";
        }

        const message = error.message;

        // Extract FastAPI {"detail": "..."} from:
        // Create failed (409): {"detail":"Brand already exists"}

        const match = message?.match(/\{.*\}$/);

        if (match) {
            try {
                const data = JSON.parse(match[0]);

                if (data.detail) {
                    return data.detail;
                }
            } catch {
                // Ignore JSON parsing errors
            }
        }

        return message || "Failed to create brand";
    };


    /*
    |--------------------------------------------------------------------------
    | Update Brands
    |--------------------------------------------------------------------------
    */

    const {
        mutate: updateMany,
        isPending: pendingUpdatingBrands,
    } = useUpdateMany();


    /*
    |--------------------------------------------------------------------------
    | Table
    |--------------------------------------------------------------------------
    */

    const table = useReactTable({
        data: brands,
        columns,

        getCoreRowModel: getCoreRowModel(),

        enableRowSelection: true,

        onRowSelectionChange: setRowSelection,

        state: {
            rowSelection,
        },
    });


    /*
    |--------------------------------------------------------------------------
    | Selection
    |--------------------------------------------------------------------------
    */

    const selectedRows =
        table.getSelectedRowModel().rows;

    const selectedCount =
        selectedRows.length;

    const selectedIds =
        selectedRows.map(
            (row) => row.original.id
        );


    /*
    |--------------------------------------------------------------------------
    | Selected Status
    |--------------------------------------------------------------------------
    */

    const selectedStatuses =
        selectedRows.map(
            (row) => row.original.is_active
        );

    const allSelectedActive =
        selectedStatuses.length > 0 &&
        selectedStatuses.every(
            (status) => status === true
        );

    const allSelectedInactive =
        selectedStatuses.length > 0 &&
        selectedStatuses.every(
            (status) => status === false
        );


    /*
    |--------------------------------------------------------------------------
    | Activate / Deactivate
    |--------------------------------------------------------------------------
    */

    const handleChangeStatus = (isActive) => {
        if (selectedIds.length === 0) {
            return;
        }

        const confirmed = window.confirm(
            `${isActive ? "Activate" : "Deactivate"} ${
                selectedIds.length
            } selected brand${
                selectedIds.length === 1 ? "" : "s"
            }?`
        );

        if (!confirmed) {
            return;
        }

        updateMany(
            {
                resource: "brands",

                ids: selectedIds,

                values: {
                    is_active: isActive,
                },
            },

            {
                onSuccess: async () => {
                    setRowSelection({});

                    await invalidate({
                        resource: "brands",
                        invalidates: ["list"],
                    });
                },
            }
        );
    };


    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    if (isPending) {
        return (
            <section
                className="
                    h-screen
                    max-w-full
                    font-sans
                    bg-[#0F172A]
                    text-admin-text
                    flex
                    justify-center
                    items-center
                "
            >
                <div>
                    Loading brands...
                </div>
            </section>
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Error
    |--------------------------------------------------------------------------
    */

    if (isError) {
        return (
            <section
                className="
                    h-screen
                    max-w-full
                    bg-[#0F172A]
                    text-admin-text
                    flex
                    justify-center
                    items-center
                "
            >
                <div>
                    Error: {brandsError?.message}
                </div>
            </section>
        );
    }


    /*
    |--------------------------------------------------------------------------
    | UI
    |--------------------------------------------------------------------------
    */

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

            {/* Sidebar */}

            <header
                className="
                    relative
                    z-10
                    h-screen
                "
            >
                <AdminSidebar />
            </header>


            {/* Background */}

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


            {/* Main */}

            <section
                className="
                    relative
                    z-10
                    h-screen
                    flex-1
                    text-admin-text
                    order-2
                    overflow-y-auto
                    p-4
                "
            >

                {/* Header */}

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
                    <h1 className="text-3xl">
                        Brands
                    </h1>

                    <div
                        className="
                            flex
                            gap-2
                            justify-center
                        "
                    >

                        {/* Activate */}

                        {selectedCount > 0 &&
                            allSelectedInactive && (
                                <button
                                    onClick={() =>
                                        handleChangeStatus(true)
                                    }
                                    disabled={
                                        pendingUpdatingBrands
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        px-3
                                        py-2
                                        text-md
                                        rounded-xl
                                        bg-emerald-500/10
                                        border
                                        border-emerald-500/30
                                        text-emerald-400
                                        hover:bg-emerald-500/20
                                        hover:border-emerald-500/50
                                        transition-colors
                                        disabled:opacity-50
                                    "
                                >
                                    <Check className="h-4 w-4" />

                                    Activate ({selectedCount})
                                </button>
                            )}


                        {/* Deactivate */}

                        {selectedCount > 0 &&
                            allSelectedActive && (
                                <button
                                    onClick={() =>
                                        handleChangeStatus(false)
                                    }
                                    disabled={
                                        pendingUpdatingBrands
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        px-3
                                        py-2
                                        text-md
                                        rounded-xl
                                        bg-red-500/10
                                        border
                                        border-red-500/30
                                        text-red-400
                                        hover:bg-red-500/20
                                        hover:border-red-500/50
                                        transition-colors
                                        disabled:opacity-50
                                    "
                                >
                                    <Ban className="h-4 w-4" />

                                    Deactivate ({selectedCount})
                                </button>
                            )}


                        {/* Add Brand */}

                        <button
                            className="
                                flex
                                items-center
                                gap-2
                                bg-admin-primary
                                px-4
                                py-2
                                rounded-xl
                                text-md
                                font-bold
                                border
                                border-admin-primary-border
                                text-admin-text
                                hover:bg-admin-primary-hover
                                duration-300
                                ease-in-out
                            "
                            onClick={() =>
                                setAddBrand(true)
                            }
                        >
                            <Plus className="h-5 w-5" />

                            Add New Brand
                        </button>
                    </div>
                </div>


                {/* Add Brand */}

                {addBrand && (
                    <div
                        className="
                            border-b
                            border-admin-border
                            pb-4
                            mb-4
                            px-6
                        "
                    >
                        <div
                            className="
                                flex
                                justify-center
                                gap-5
                                items-center
                            "
                        >
                            <label
                                htmlFor="brandName"
                                className="
                                    text-admin-muted
                                    font-bold
                                "
                            >
                                Name
                            </label>

                            <input
                                className="
                                    px-4
                                    py-2
                                    rounded-xl
                                    bg-admin-input/70
                                    border
                                    border-admin-border
                                    text-admin-text
                                    outline-none
                                    focus:border-admin-primary
                                "
                                id="brandName"
                                value={brandName}
                                onChange={(e) =>
                                    setBrandName(
                                        e.target.value
                                    )
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        const name =
                                            brandName.trim();

                                        if (
                                            !name ||
                                            mutation.isPending
                                        ) {
                                            return;
                                        }

                                        createBrand({
                                            values: {
                                                name,
                                            },
                                        });
                                    }
                                }}
                            />

                            <button
                                onClick={() => {
                                    const name =
                                        brandName.trim();

                                    if (!name) {
                                        return;
                                    }

                                    createBrand({
                                        values: {
                                            name,
                                        },
                                    });
                                }}
                                disabled={
                                    mutation.isPending ||
                                    !brandName.trim()
                                }
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    bg-admin-primary
                                    px-4
                                    py-2
                                    rounded-xl
                                    text-md
                                    font-bold
                                    border
                                    border-admin-primary-border
                                    text-admin-text
                                    hover:bg-admin-primary-hover
                                    duration-300
                                    ease-in-out
                                    cursor-pointer
                                    disabled:opacity-50
                                    disabled:cursor-not-allowed
                                "
                            >
                                {mutation.isPending
                                    ? "Saving..."
                                    : "Save"}
                            </button>

                            <button
                                onClick={() => {
                                    setBrandName("");
                                    setAddBrand(false);
                                }}
                                className="
                                    p-2
                                    rounded-xl
                                    text-admin-muted
                                    hover:text-admin-text
                                    hover:bg-admin-hover
                                    transition-colors
                                "
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>


                        {/* Create Error */}

                        {mutation.isError && (
                            <p
                                className="
                                    text-red-400
                                    text-sm
                                    text-center
                                    mt-3
                                "
                            >
                                {getCreateErrorMessage(
                                    mutation.error
                                )}
                            </p>
                        )}
                    </div>
                )}


                {/* Search + Filters */}

                <div
                    className="
                        flex
                        flex-wrap
                        items-center
                        justify-between
                        gap-4
                        border-b
                        border-admin-border
                        pb-4
                        mb-4
                    "
                >

                    {/* Search */}

                    <div
                        className="
                            relative
                            flex-1
                            max-w-md
                        "
                    >
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
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                            placeholder="Search brands..."
                            className="
                                w-full
                                pl-10
                                pr-4
                                py-2.5
                                rounded-xl
                                bg-admin-input/70
                                border
                                border-admin-border
                                text-admin-text
                                placeholder:text-admin-muted
                                outline-none
                                focus:border-admin-primary
                            "
                        />
                    </div>


                    {/* Status Filter */}

                    <div
                        className="
                            flex
                            items-center
                            gap-5
                            text-sm
                        "
                    >
                        <span
                            className="
                                text-admin-muted
                                font-semibold
                            "
                        >
                            Status:
                        </span>


                        {/* All */}

                        <label
                            className="
                                flex
                                items-center
                                gap-2
                                cursor-pointer
                            "
                        >
                            <input
                                type="checkbox"
                                checked={
                                    statusFilter === "all"
                                }
                                onChange={() =>
                                    setStatusFilter(
                                        statusFilter === "all"
                                            ? "active"
                                            : "all"
                                    )
                                }
                                className="
                                    h-4
                                    w-4
                                    accent-blue-500
                                "
                            />

                            All
                        </label>


                        {/* Active */}

                        <label
                            className="
                                flex
                                items-center
                                gap-2
                                cursor-pointer
                            "
                        >
                            <input
                                type="checkbox"
                                checked={
                                    statusFilter === "active"
                                }
                                onChange={() =>
                                    setStatusFilter(
                                        statusFilter === "active"
                                            ? "all"
                                            : "active"
                                    )
                                }
                                className="
                                    h-4
                                    w-4
                                    accent-emerald-500
                                "
                            />

                            Active
                        </label>


                        {/* Inactive */}

                        <label
                            className="
                                flex
                                items-center
                                gap-2
                                cursor-pointer
                            "
                        >
                            <input
                                type="checkbox"
                                checked={
                                    statusFilter === "inactive"
                                }
                                onChange={() =>
                                    setStatusFilter(
                                        statusFilter === "inactive"
                                            ? "all"
                                            : "inactive"
                                    )
                                }
                                className="
                                    h-4
                                    w-4
                                    accent-red-500
                                "
                            />

                            Inactive
                        </label>
                    </div>
                </div>


                {/* Total */}

                <div
                    className="
                        flex
                        justify-center
                        border-b
                        border-admin-border
                        pb-4
                        mb-4
                        px-6
                        gap-5
                        items-center
                    "
                >
                    <h3
                        className="
                            text-admin-muted
                            font-bold
                        "
                    >
                        Total Brands
                    </h3>

                    <p className="text-lg font-bold">
                        {totalBrands}
                    </p>
                </div>


                {/* Table */}

                <div
                    className="
                        overflow-hidden
                        border
                        border-slate-700
                        bg-admin-surface
                        rounded-2xl
                        w-[50vw] mx-auto
                    "
                >
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
                                        key={headerGroup.id}
                                    >
                                        {headerGroup.headers.map(
                                            (header) => (
                                                <th
                                                    key={header.id}
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
                            {table.getRowModel().rows.length > 0
                                ? (
                                    table
                                        .getRowModel()
                                        .rows
                                        .map((row) => (
                                            <tr
                                                key={row.id}
                                                onClick={() =>
                                                    navigate(
                                                        `/admin/brands/${row.original.id}`
                                                    )
                                                }
                                                className={`
                                                    border-b
                                                    border-slate-700/70
                                                    transition-colors
                                                    hover:bg-slate-800/60
                                                    cursor-pointer
                                                    ${
                                                        row.getIsSelected()
                                                            ? "bg-slate-800"
                                                            : ""
                                                    }
                                                `}
                                            >
                                                {row
                                                    .getVisibleCells()
                                                    .map((cell) => (
                                                        <td
                                                            key={cell.id}
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
                                )
                                : (
                                    <tr>
                                        <td
                                            colSpan={columns.length}
                                            className="
                                                px-6
                                                py-12
                                                text-center
                                                text-admin-muted
                                            "
                                        >
                                            No brands found.
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
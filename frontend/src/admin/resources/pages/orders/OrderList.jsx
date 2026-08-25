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
                        ${isActive
                            ? "text-admin-active hover:text-admin-active-hover"
                            : "text-admin-inactive hover:text-admin-inactive-hover"
                        }
                        duration-300 ease-in-out
                    `}
                >
                    <span
                        className={`
                            h-1 w-1 rounded-full
                            ${isActive
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


export function OrderList() {
    const navigate = useNavigate();
    const invalidate = useInvalidate();

    const [rowSelection, setRowSelection] = useState({});

    const [search, setSearch] = useState("");
    const [shippingStatus, setShippingStatus] = useState("all");
    const [orderStatus, setOrderStatus] = useState("all");
    const [paymentStatus, setPaymentStatus] = useState("all");

    const hasFilters = search !== "" || shippingStatus !== "all" || orderStatus !== "all" || paymentStatus !== "all";

    const resetFilters = () => {
        setSearch("");
        setShippingStatus("all");
        setOrderStatus("all");
        setPaymentStatus("all");
    };

    const {
        result: {
            data: orders = [],
            total: totalOrders,
        },

        query: {
            isError,
            isPending,
            error: ordersError,
        },
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




    // const {
    //     mutate: createBrand,
    //     mutation,
    // } = useCreate({
    //     resource: "brands",

    //     mutationOptions: {
    //         onSuccess: async () => {
    //             setBrandName("");
    //             setAddBrand(false);

    //             await invalidate({
    //                 resource: "brands",
    //                 invalidates: ["list"],
    //             });
    //         },
    //     },
    // });



    const getCreateErrorMessage = (error) => {
        if (!error) {
            return "Failed to create brand";
        }

        const message = error.message;

        const match = message?.match(/\{.*\}$/);

        if (match) {
            try {
                const data = JSON.parse(match[0]);

                if (data.detail) {
                    return data.detail;
                }
            } catch {
            }
        }

        return message || "Failed to create brand";
    };


    const {
        mutate: updateMany,
        isPending: pendingUpdatingBrands,
    } = useUpdateMany();




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



    const selectedRows =
        table.getSelectedRowModel().rows;

    const selectedCount =
        selectedRows.length;

    const selectedIds =
        selectedRows.map(
            (row) => row.original.id
        );







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
                    Loading orders...
                </div>
            </section>
        );
    }

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

            <header
                className="
                    relative
                    z-10
                    h-screen
                "
            >
                <AdminSidebar />
            </header>



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
                        Orders
                    </h1>
                </div>


                <div className="border border-admin-border bg-admin-surface rounded-2xl p-4 mb-4">
                    <p className="text-admin-muted text-sm pb-2">
                        Filters
                    </p>

                    <div className="flex flex-wrap items-center gap-3">


                        <div className="relative">

                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-admin-muted"
                            />

                            <input
                                type="text"
                                placeholder="Search ordered products..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                className="
                                    w-64
                                    pl-9 pr-3 py-2
                                    rounded-lg
                                    bg-slate-900
                                    border border-admin-border
                                    text-admin-text
                                    placeholder:text-admin-muted
                                    outline-none
                                    focus:border-admin-primary
                                    transition-colors
                                "
                            />

                        </div>


                        <select
                            value={shippingStatus}
                            onChange={(e) =>
                                setShippingStatus(e.target.value)
                            }
                            className="
                                px-3 py-2
                                rounded-lg
                                bg-slate-900
                                border border-admin-border
                                text-admin-text
                                outline-none
                                focus:border-admin-primary
                            "
                        >
                            <option value="all">
                                All Status
                            </option>

                            <option value="NOT_SHIPPED">
                                Not Shipped
                            </option>

                            <option value="SHIPPED">
                                Shipped
                            </option>

                            <option value="DELIVERED">
                                Delivered
                            </option>
                        </select>

                        <select
                            value={orderStatus}
                            onChange={(e) =>
                                setOrderStatus(e.target.value)
                            }
                            className="
                                px-3 py-2
                                rounded-lg
                                bg-slate-900
                                border border-admin-border
                                text-admin-text
                                outline-none
                                focus:border-admin-primary
                            "
                        >
                            <option value="all">
                                All Status
                            </option>

                            <option value="PENDING">
                                Pending
                            </option>

                            <option value="CONFIRMED">
                                Confirmed
                            </option>

                            <option value="COMPLETED">
                                Completed
                            </option>

                            <option value="CANCELLED">
                                Cancelled
                            </option>
                        </select>


                        <select
                            value={paymentStatus}
                            onChange={(e) =>
                                setPaymentStatus(e.target.value)
                            }
                            className="
                                px-3 py-2
                                rounded-lg
                                bg-slate-900
                                border border-admin-border
                                text-admin-text
                                outline-none
                                focus:border-admin-primary
                            "
                        >
                            <option value="all">
                                All Status
                            </option>

                            <option value="PENDING">
                                Pending
                            </option>

                            <option value="PAID">
                                Paid
                            </option>

                            <option value="REFUNDED">
                                Refunded
                            </option>
                        </select>

                        {hasFilters && (
                            <button
                                onClick={resetFilters}
                                className="
                                    flex items-center gap-1
                                    px-4 py-2 bg-white/10 backdrop-blur-xl
                                    rounded-lg
                                    border border-admin-border
                                    text-admin-muted
                                    hover:text-admin-text
                                    hover:border-admin-border-hover
                                    duration-300
                                    transition-colors
                                "
                            >
                                <X className="h-4 w-4" />
                                Reset
                            </button>
                        )}

                    </div>



                </div>



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
                        Total Orders
                    </h3>

                    <p className="text-lg font-bold">
                        {totalOrders}
                    </p>
                </div>



                <div
                    className="
                        overflow-hidden
                        border
                        border-slate-700
                        bg-admin-surface
                        rounded-2xl
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
                                                        `/admin/orders/${row.original.id}`
                                                    )
                                                }
                                                className={`
                                                    border-b
                                                    border-slate-700/70
                                                    transition-colors
                                                    hover:bg-slate-800/60
                                                    cursor-pointer
                                                    ${row.getIsSelected()
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
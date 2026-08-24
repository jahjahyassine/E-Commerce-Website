import { useList, useDeleteMany } from "@refinedev/core";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from "@tanstack/react-table";
import { FaStar } from "react-icons/fa6";
import { useMemo, useState } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import DotField from "../../../../components/animation/DotField.jsx";
import { Plus, Search, X, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

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
        accessorKey: "product.name",
        accessorFn: (row) => row.product?.name ?? "",
        header: "Product Name",

        cell: (info) => (
            <p className="font-medium">
                {info.getValue()}
            </p>
        ),
    },

    {
        accessorKey: "sku",
        accessorFn: (row) => row.sku ?? "",
        header: "SKU",

        cell: (info) => (
            <p className="font-medium">
                {info.getValue()}
            </p>
        ),
    },

    {
        accessorKey: "price",
        header: "Price",

        cell: (info) => (
            <p>
                ${Number(info.getValue() || 0).toFixed(2)}
            </p>
        ),
    },

    {
        id: "sales",

        header: "Sales",

        accessorFn: (row) =>
            row?.order_items?.reduce(
                        (sum, item) =>
                            sum + Number(item.quantity || 0),
                        0
                    ) ?? 0,

        cell: (info) => (
            <p>
                {info.getValue()} pcs
            </p>
        ),
    },

    {
        id: "revenue",

        header: "Revenue",

        accessorFn: (row) =>
            row?.order_items?.reduce(
                        (sum, item) =>
                            sum +
                            Number(item.quantity || 0) *
                            Number(item.price || 0),
                        0
                    ) ?? 0,
        cell: (info) => (
            <p>
                ${Number(info.getValue() || 0).toFixed(2)}
            </p>
        ),
    },

    {
        id: "stock",

        header: "Stock",

        accessorFn: (row) => Number(row?.inventory?.quantity || 0) ?? 0,

        cell: (info) => (
            <p>
                {info.getValue()} pcs
            </p>
        ),
    },

    {
        id: "status",

        header: "Status",

        accessorFn: (row) => row.is_active ?? false,

        cell: (info) => (
            <p className="flex items-center gap-2">
                {info.getValue() ? (
                    <span className="flex items-center gap-2 text-admin-active hover:text-admin-active-hover duration-300 ease-in-out">
                        <span className="h-1 w-1 rounded-full bg-admin-active shadow-[0_0_8px_2px_rgba(52,211,153,0.6)]" />
                        Active
                    </span>
                ) : (
                    <span className="flex items-center gap-2 text-admin-inactive hover:text-admin-inactive-hover duration-300 ease-in-out">
                        <span className="h-1 w-1 rounded-full bg-minimal-red shadow-[0_0_8px_2px_rgba(248,113,113,0.6)]" />
                        Inactive
                    </span>
                )}
            </p>
        ),
    },
];

export function InventoryList() {

    const navigate = useNavigate()

    const [rowSelection, setRowSelection] = useState({});


    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [brandFilter, setBrandFilter] = useState("");
    const [ratingFilter, setRatingFilter] = useState("");

    const [minPrice, setMinPrice] = useState(null);
    const [maxPrice, setMaxPrice] = useState(null);


    const hasFilters = search !== "" || statusFilter !== "" || categoryFilter !== "" || brandFilter !== "" || ratingFilter !== "" || minPrice !== null || maxPrice !== null;


    const resetFilters = () => {
        setSearch("");
        setStatusFilter("");
        setCategoryFilter("");
        setBrandFilter("");
        setRatingFilter("");
        setMinPrice(null);
        setMaxPrice(null);
    };


    const {
        result: { data, total },
        query: { isError, error, isPending },
    } = useList({
        resource: "inventory",
        filters: [
            {
                field: "search",
                operator: "eq",
                value: search !== "" ? search : null,
            },
            {
                field: "category_id",
                operator: "eq",
                value: categoryFilter !== "" ? Number(categoryFilter) : null,
            },
            {
                field: "brand_id",
                operator: "eq",
                value: brandFilter !== "" ? Number(brandFilter) : null,
            },
            {
                field: "min_rating",
                operator: "eq",
                value: ratingFilter !== "" ? Number(ratingFilter) : null,
            },
            {
                field: "min_price",
                operator: "eq",
                value: minPrice ? Number(minPrice) : null,
            },
            {
                field: "max_price",
                operator: "eq",
                value: maxPrice ? Number(maxPrice) : null,
            },
            {
                field: "is_active",
                operator: "eq",
                value: statusFilter ? statusFilter : null,
            },
        ],
        pagination: null,
        sorters: null,
    });

    const products = data ?? [];


    const {
        result: { data: categories, total: totalCategories },
        query: { isError: isErrorCategory },
    } = useList({
        resource: "categories",
        filters: null,
        pagination: null,
        sorters: null,
    });


    const {
        result: { data: brands, total: totalBrands },
        query: { isError: isErrorBrand },
    } = useList({
        resource: "brands",
        filters: null,
        pagination: null,
        sorters: null,
    });




    const table = useReactTable({
        data: products,
        columns,

        getCoreRowModel: getCoreRowModel(),

        enableRowSelection: true,

        onRowSelectionChange: setRowSelection,

        state: {
            rowSelection,
        },
    });

    const rows = table.getRowModel().rows;

    const totalProducts = rows.length;

    const totalRevenue = rows.reduce(
        (acc, row) =>
            acc + Number(
                row.getValue("revenue") || 0
            ),
        0
    );

    const totalSales = rows.reduce(
        (acc, row) =>
            acc + Number(
                row.getValue("sales") || 0
            ),
        0
    );


    const selectedRows = table.getSelectedRowModel().rows;

    const selectedCount = table.getSelectedRowModel().rows.length;

    const selectedIds = selectedRows.map((row) => row.original.id)

    const { mutate: deleteMany } = useDeleteMany();

    const handleDelete = () => {
        const selectedIds = table
            .getSelectedRowModel()
            .rows
            .map((row) => row.original.id);

        if (selectedIds.length === 0) {
            return;
        }

        const confirmed = window.confirm(
            `Delete ${selectedIds.length} selected product(s)?`
        );

        if (!confirmed) {
            return;
        }

        deleteMany(
            {
                resource: `products/${products.product_id}/variants`,
                ids: selectedIds,
            },
            {
                onSuccess: () => {
                    setRowSelection({});
                },
            }
        );
    };


    if (isPending) {
        return (
            <section className="h-screen max-w-full font-sans bg-[#0F172A] text-admin-text flex justify-center items-center">
                <div>
                    Loading products...
                </div>
            </section>
        );
    }

    if (isError) {
        return (
            <section className="h-screen max-w-full bg-[#0F172A] text-admin-text flex justify-center items-center">
                <div>
                    Error: {error?.message}
                </div>
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


            <section className="relative z-10 h-screen flex-1 text-admin-text order-2 overflow-y-auto p-4">

                <div className="flex items-center justify-between gap-4 border-b border-admin-border pb-3 mb-4">
                    <h1 className="text-3xl">
                        Products
                    </h1>

                    <div className="flex gap-2 justify-center">
                        {selectedCount > 0 && (
                            <button
                                onClick={handleDelete}
                                className="
                                    flex items-center gap-2
                                    px-3 py-2 text-md
                                    rounded-xl
                                    bg-red-500/10
                                    border border-red-500/30
                                    text-red-400
                                    hover:bg-red-500/20
                                    hover:border-red-500/50
                                    transition-colors
                                "
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete ({selectedCount})
                            </button>
                        )}

                        <Link
                            to="/admin/products/create"
                            className="
                                flex items-center gap-2
                                bg-admin-primary
                                px-4 py-2
                                rounded-xl
                                text-md font-bold
                                border border-admin-primary-border
                                text-admin-text
                                hover:bg-admin-primary-hover
                                duration-300
                                ease-in-out
                            "
                        >
                            <Plus className="h-5 w-5" />
                            Add New Product
                        </Link>
                    </div>
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
                                placeholder="Search products..."
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
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value)
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
                            <option value="">
                                All Status
                            </option>

                            <option value={true}>
                                Active
                            </option>

                            <option value={false}>
                                Inactive
                            </option>
                        </select>

                        <select
                            value={categoryFilter}
                            onChange={(e) =>
                                setCategoryFilter(e.target.value)
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
                            <option value="">
                                All Categories
                            </option>

                            {categories.map((category) => (
                                <option
                                    key={category.id}
                                    value={category.id}
                                >
                                    {category.name}
                                </option>
                            ))}
                        </select>


                        <select
                            value={brandFilter}
                            onChange={(e) =>
                                setBrandFilter(e.target.value)
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
                            <option value="">
                                All Brands
                            </option>

                            {brands.map((brand) => (
                                <option
                                    key={brand.id}
                                    value={brand.id}
                                >
                                    {brand.name}
                                </option>
                            ))}
                        </select>


                        <select
                            value={ratingFilter}
                            onChange={(e) =>
                                setRatingFilter(e.target.value)
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
                            <option value="">
                                All Ratings
                            </option>

                            <option value="4">
                                4+ Stars
                            </option>

                            <option value="3">
                                3+ Stars
                            </option>

                            <option value="2">
                                2+ Stars
                            </option>
                        </select>


                        <input
                            type="number"
                            min="0"
                            placeholder="Min price"
                            value={minPrice}
                            onChange={(e) =>
                                setMinPrice(e.target.value)
                            }
                            className="
                                w-28
                                px-3 py-2
                                rounded-lg
                                bg-slate-900
                                border border-admin-border
                                text-admin-text
                                placeholder:text-admin-muted
                                outline-none
                                focus:border-admin-primary
                            "
                        />


                        <input
                            type="number"
                            min="0"
                            placeholder="Max price"
                            value={maxPrice}
                            onChange={(e) =>
                                setMaxPrice(e.target.value)
                            }
                            className="
                                w-28
                                px-3 py-2
                                rounded-lg
                                bg-slate-900
                                border border-admin-border
                                text-admin-text
                                placeholder:text-admin-muted
                                outline-none
                                focus:border-admin-primary
                            "
                        />


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


                <div className="flex justify-between border-b border-admin-border pb-4 mb-4 px-6">

                    <div>
                        <h3 className="text-admin-muted font-bold">
                            Total Products
                        </h3>

                        <p className="text-lg font-bold">
                            {totalProducts}
                        </p>
                    </div>

                    <div>
                        <h3 className="text-admin-muted font-bold">
                            Total Sales
                        </h3>

                        <p className="text-lg font-bold">
                            {totalSales} pcs
                        </p>
                    </div>

                    <div>
                        <h3 className="text-admin-muted font-bold">
                            Total Revenue
                        </h3>

                        <p className="text-lg font-bold">
                            ${totalRevenue.toFixed(2)}
                        </p>
                    </div>

                </div>


                <div className="overflow-hidden border border-slate-700 bg-admin-surface rounded-2xl">

                    <table className="w-full text-left">


                        <thead className="border-b border-slate-700 bg-slate-900">

                            {table.getHeaderGroups().map(
                                (headerGroup) => (
                                    <tr key={headerGroup.id}>

                                        {headerGroup.headers.map(
                                            (header) => (
                                                <th
                                                    key={header.id}
                                                    className="px-6 py-4 text-sm font-semibold text-admin-muted"
                                                >
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
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

                            {table.getRowModel().rows.length > 0 ? (

                                table.getRowModel().rows.map(
                                    (row) => (
                                        <tr
                                            key={row.id}
                                            onClick={() => navigate(`/admin/products/${row.original.product_id}/variants/${row.original.id}`)}
                                            className={`
                                                border-b border-slate-700/70
                                                transition-colors
                                                hover:bg-slate-800/60
                                                cursor-pointer
                                                ${row.getIsSelected()
                                                    ? "bg-slate-800"
                                                    : ""
                                                }
                                            `}
                                        >

                                            {row.getVisibleCells().map(
                                                (cell) => (
                                                    <td
                                                        key={cell.id}
                                                        className="px-6 py-5 text-sm"
                                                    >
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </td>
                                                )
                                            )}

                                        </tr>
                                    )
                                )

                            ) : (

                                <tr>

                                    <td
                                        colSpan={columns.length}
                                        className="px-6 py-12 text-center text-admin-muted"
                                    >
                                        No products found.
                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

            </section>

        </main >
    );
}
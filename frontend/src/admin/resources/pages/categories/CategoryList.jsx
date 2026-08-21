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
        accessorKey: "name",
        header: "Category",

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
                    className={`flex items-center gap-2 ${isActive
                            ? "text-admin-active hover:text-admin-active-hover"
                            : "text-admin-inactive hover:text-admin-inactive-hover"
                        } duration-300 ease-in-out`}
                >
                    <span
                        className={`h-1 w-1 rounded-full ${isActive
                                ? "bg-admin-active shadow-[0_0_8px_2px_rgba(52,211,153,0.6)]"
                                : "bg-minimal-red shadow-[0_0_8px_2px_rgba(248,113,113,0.6)]"
                            }`}
                    />

                    {isActive ? "Active" : "Inactive"}
                </span>
            );
        },
    }


];

export function CategoryList() {

    const navigate = useNavigate()

    const [rowSelection, setRowSelection] = useState({});

    const {
        result: { data: categories, total: totalCategories },
        query: { isError, isPending },
    } = useList({
        resource: "categories",
        filters: null,
        pagination: null,
        sorters: null,
    });




    const table = useReactTable({
        data: categories,
        columns,

        getCoreRowModel: getCoreRowModel(),

        enableRowSelection: true,

        onRowSelectionChange: setRowSelection,

        state: {
            rowSelection,
        },
    });

    const rows = table.getRowModel().rows;


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
                resource: "categories",
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
                    Loading categories...
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
                        Categories
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
                            to="/admin/category/create"
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
                            Add New Category
                        </Link>
                    </div>
                </div>


                <div className="flex justify-center border-b border-admin-border pb-4 mb-4 px-6 gap-5 items-center">

                    <h3 className="text-admin-muted font-bold">
                        Total Categories
                    </h3>

                    <p className="text-lg font-bold">
                        {totalCategories}
                    </p>

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
                                            onClick={() => navigate(`/admin/categories/${row.original.id}`)}
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
                                        No categories found.
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
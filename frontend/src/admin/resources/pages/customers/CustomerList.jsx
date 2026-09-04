import { useList } from "@refinedev/core";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from "@tanstack/react-table";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/AdminSidebar";
import DotField from "../../../../components/animation/DotField.jsx";

const columns = [
    {
        accessorKey: "full_name",
        header: "Customer",

        accessorFn: (row) => row.full_name ?? "",

        cell: (info) => {
            const user = info.row.original;
            const profilePic = user.profile_pic_path;

            return (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img
                            src={profilePic}
                            alt={user.full_name || user.username}
                            className="object-cover w-full h-full"
                        />
                    </div>

                    <div>
                        <p className="font-medium text-admin-text">
                            {user.full_name || user.username}
                        </p>

                        <p className="text-xs text-admin-muted mt-1">
                            #{user.id}
                        </p>
                    </div>
                </div>
            );
        },
    },

    {
        id: "contact",
        header: "Contact",

        accessorFn: (row) => row.email ?? "",

        cell: (info) => {
            const user = info.row.original;

            return (
                <div>
                    <p className="text-sm text-admin-text">
                        {user.email}
                    </p>

                    <p className="text-xs text-admin-muted mt-1">
                        {user.phone || "No phone"}
                    </p>
                </div>
            );
        },
    },

    {
        id: "location",
        header: "Location",

        accessorFn: (row) =>
            row.city || row.region || "",

        cell: (info) => {
            const user = info.row.original;

            return (
                <div>
                    <p className="text-sm text-admin-text">
                        {user.city || "—"}
                    </p>

                    <p className="text-xs text-admin-muted mt-1">
                        {user.region || "—"}
                    </p>
                </div>
            );
        },
    },

    {
        accessorKey: "role",
        header: "Role",

        cell: (info) => (
            <span className="inline-flex rounded-full bg-admin-primary/10 px-3 py-1 text-xs font-medium text-admin-primary">
                {info.getValue()}
            </span>
        ),
    },

    {
        accessorKey: "is_active",
        header: "Status",

        cell: (info) => (
            info.getValue() ? (
                <span className="flex items-center gap-2 text-admin-active">
                    <span className="h-1.5 w-1.5 rounded-full bg-admin-active shadow-[0_0_8px_2px_rgba(52,211,153,0.6)]" />
                    Active
                </span>
            ) : (
                <span className="flex items-center gap-2 text-admin-inactive">
                    <span className="h-1.5 w-1.5 rounded-full bg-minimal-red shadow-[0_0_8px_2px_rgba(248,113,113,0.6)]" />
                    Inactive
                </span>
            )
        ),
    },

    {
        id: "orders",
        header: "Orders",

        accessorFn: (row) =>
            row?.orders?.length ?? 0,

        cell: (info) => (
            <p className="font-semibold">
                {info.getValue()}
            </p>
        ),
    },
];

export default function CustomerList() {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [activeFilter, setActiveFilter] = useState("");

    const hasFilters =
        search !== "" ||
        roleFilter !== "" ||
        activeFilter !== "";

    const resetFilters = () => {
        setSearch("");
        setRoleFilter("");
        setActiveFilter("");
    };

    const filters = useMemo(() => {
        const filters = [];

        if (search.trim()) {
            filters.push({
                field: "search",
                operator: "eq",
                value: search.trim(),
            });
        }

        if (roleFilter) {
            filters.push({
                field: "role",
                operator: "eq",
                value: roleFilter,
            });
        }

        if (activeFilter) {
            filters.push({
                field: "is_active",
                operator: "eq",
                value: activeFilter === "true",
            });
        }

        return filters;
    }, [
        search,
        roleFilter,
        activeFilter,
    ]);

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
        resource: "users",
        filters,
        pagination: null,
        sorters: null,
    });

    const users = data ?? [];

    const table = useReactTable({
        data: users,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const rows = table.getRowModel().rows;

    const totalCustomers = total ?? rows.length;

    if (isPending) {
        return (
            <section className="h-screen bg-[#0F172A] text-admin-text flex items-center justify-center">
                Loading customers...
            </section>
        );
    }

    if (isError) {
        return (
            <section className="h-screen bg-[#0F172A] text-admin-text flex items-center justify-center">
                Error: {error?.message}
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

            <section className="relative z-10 h-screen flex-1 overflow-y-auto p-4 text-admin-text">

                <div className="flex items-center justify-between gap-4 border-b border-admin-border pb-3 mb-4">
                    <div>
                        <h1 className="text-3xl">
                            Customers
                        </h1>

                        <p className="text-sm text-admin-muted mt-1">
                            Manage customers and view their activity.
                        </p>
                    </div>
                </div>

                <div className="border border-admin-border bg-admin-surface rounded-2xl p-4 mb-4">

                    <p className="text-admin-muted text-sm pb-3">
                        Filters
                    </p>

                    <div className="flex flex-wrap items-center gap-3">

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
                                placeholder="Search customers..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                                className="
                                    w-72
                                    pl-9
                                    pr-3
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

                        </div>

                        <select
                            value={roleFilter}
                            onChange={(e) =>
                                setRoleFilter(e.target.value)
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
                                All Roles
                            </option>

                            <option value="CUSTOMER">
                                Customer
                            </option>

                            <option value="ADMIN">
                                Admin
                            </option>
                        </select>

                        <select
                            value={activeFilter}
                            onChange={(e) =>
                                setActiveFilter(e.target.value)
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
                                All Status
                            </option>

                            <option value="true">
                                Active
                            </option>

                            <option value="false">
                                Inactive
                            </option>
                        </select>

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

                <div className="flex justify-between border-b border-admin-border pb-4 mb-4 px-6">

                    <div>
                        <h3 className="text-admin-muted font-bold">
                            Total Customers
                        </h3>

                        <p className="text-lg font-bold">
                            {totalCustomers}
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

                            {rows.length > 0 ? (

                                rows.map((row) => (

                                    <tr
                                        key={row.id}
                                        onClick={() =>
                                            navigate(
                                                `/admin/customers/${row.original.id}`
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

                                ))

                            ) : (

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
                                        No customers found.
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
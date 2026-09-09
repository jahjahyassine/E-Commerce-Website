import { useList, useDelete } from "@refinedev/core";

import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from "@tanstack/react-table";

import {
    Search,
    X,
    Star,
    MessageSquare,
    User,
    Package,
} from "lucide-react";

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminSidebar from "../../components/AdminSidebar";
import DotField from "../../../../components/animation/DotField.jsx";
import { useQueryClient } from "@tanstack/react-query";



export function ReviewList() {
    const navigate = useNavigate();
    const queryClient = useQueryClient()

    const [search, setSearch] = useState("");
    const [ratingFilter, setRatingFilter] = useState("");


    const { mutate: deleteReview } = useDelete();

    const handleDelete = (reviewId) => {
        if (!window.confirm("Are you sure you want to delete this review?")) {
            return;
        }

        deleteReview(
            {
                resource: "reviews",
                id: reviewId,
            },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({
                        queryKey: ["reviews"]
                    })
                },
                onError: (error) => {
                    console.error("Failed to delete review:", error);
                },
            }
        );
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

        if (ratingFilter) {
            filters.push({
                field: "rating",
                operator: "eq",
                value: Number(ratingFilter),
            });
        }

        return filters;
    }, [search, ratingFilter]);

    const columns = [
        {
            id: "reviewer",
            header: "Customer",
            accessorFn: (row) =>
                `${row.user?.full_name ?? ""} ${row.user?.username ?? ""} ${row.user?.email ?? ""
                }`,

            cell: (info) => {
                const review = info.row.original;
                const user = review.user;

                return (
                    <div className="flex items-center gap-3">
                        <div
                            className="
                            h-10
                            w-10
                            rounded-full
                            bg-slate-900
                            flex
                            items-center
                            justify-center
                            shrink-0
                        "
                        >
                            {
                                user.profile_pic_path ?
                                    <div className="w-10 h-10 rounded-full overflow-hidden">
                                        <img
                                            src={user.profile_pic_path}
                                            alt={user.full_name || user.username}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                    :
                                    <User
                                        className="
                                        h-4
                                        w-4
                                        text-admin-primary
                                    "
                                    />
                            }

                        </div>

                        <div className="min-w-0">
                            <p className="font-semibold text-sm text-admin-text truncate">
                                {user?.full_name ||
                                    user?.username ||
                                    "Unknown User"}
                            </p>

                            <p className="text-xs text-admin-muted mt-1 truncate">
                                {user?.email || `User #${review.user_id}`}
                            </p>
                        </div>
                    </div>
                );
            },
        },

        {
            id: "product",
            header: "Product",

            accessorFn: (row) => row.product?.name ?? "",

            cell: (info) => {
                const review = info.row.original;
                const product = review.product;

                const mediaUrl =
                    product?.media?.[0]?.media_url ?? null;

                return (
                    <div className="flex items-center gap-3">
                        <div
                            className="
                            h-10
                            w-10
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
                            {mediaUrl ? (
                                <img
                                    src={mediaUrl}
                                    alt={product?.name || "Product"}
                                    className="w-full h-full object-cover"
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

                        <div className="min-w-0">
                            <p className="font-medium text-sm text-admin-text truncate">
                                {product?.name ||
                                    `Product #${review.product_id}`}
                            </p>

                            <p className="text-xs text-admin-muted mt-1">
                                #{review.product_id}
                            </p>
                        </div>
                    </div>
                );
            },
        },

        {
            accessorKey: "rating",
            header: "Rating",

            cell: (info) => {
                const rating = info.getValue();

                return (
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map(
                                (_, index) => (
                                    <Star
                                        key={index}
                                        className={`
                                        h-4
                                        w-4
                                        ${index < rating
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-slate-600"
                                            }
                                    `}
                                    />
                                )
                            )}
                        </div>

                        <span className="text-sm font-semibold text-admin-text">
                            {rating}/5
                        </span>
                    </div>
                );
            },
        },

        {
            accessorKey: "review",
            header: "Review",

            cell: (info) => {
                const reviewText = info.getValue();

                return reviewText ? (
                    <div className="flex items-start gap-2 max-w-[320px]">
                        <MessageSquare
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
                            title={reviewText}
                        >
                            {reviewText}
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
            id: "actions",
            header: "Actions",
            cell: (info) => {
                const review = info.row.original;

                return (
                    <button
                        onClick={(event) => {
                            event.stopPropagation();
                            handleDelete(review.id);
                        }}
                        className="
                    px-3
                    py-2
                    rounded-lg
                    border
                    border-red-500/30
                    text-xs
                    font-medium
                    text-red-400
                    hover:text-red-300
                    hover:bg-red-500/10
                    transition-colors
                "
                    >
                        Delete
                    </button>
                );
            },
        },
    ];


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
        resource: "reviews",
        filters,
        pagination: null,
        sorters: null,
    });

    const reviews = data ?? [];

    const totalReviews = total ?? reviews.length;

    const averageRating =
        reviews.length > 0
            ? (
                reviews.reduce(
                    (sum, review) =>
                        sum + Number(review.rating || 0),
                    0
                ) / reviews.length
            ).toFixed(1)
            : "0.0";

    const fiveStarReviews = reviews.filter(
        (review) => Number(review.rating) === 5
    ).length;

    const fourPlusReviews = reviews.filter(
        (review) => Number(review.rating) >= 4
    ).length;


    const hasFilters =
        search !== "" ||
        ratingFilter !== "";

    const resetFilters = () => {
        setSearch("");
        setRatingFilter("");
    };


    const table = useReactTable({
        data: reviews,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const rows = table.getRowModel().rows;




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
                Loading reviews...
            </section>
        );
    }

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

            <header className="relative z-10 h-screen">
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
                    overflow-y-auto
                    p-4
                    text-admin-text
                "
            >

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
                            Reviews
                        </h1>

                        <p className="text-sm text-admin-muted mt-1">
                            Manage customer product reviews
                        </p>
                    </div>
                </div>


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
                            <MessageSquare className="h-5 w-5" />
                        }
                        label="Total Reviews"
                        value={totalReviews}
                    />

                    <StatCard
                        icon={
                            <Star className="h-5 w-5" />
                        }
                        label="Average Rating"
                        value={averageRating}
                    />

                    <StatCard
                        icon={
                            <Star className="h-5 w-5" />
                        }
                        label="5 Stars Reviews"
                        value={fiveStarReviews}
                    />
                </div>


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
                                placeholder="Search reviews..."
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


                        <select
                            value={ratingFilter}
                            onChange={(event) =>
                                setRatingFilter(
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
                                All Ratings
                            </option>

                            <option value="5">
                                5 Stars
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

                            <option value="1">
                                1+ Stars
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
                            Total Reviews
                        </h3>

                        <p className="text-lg font-bold">
                            {totalReviews}
                        </p>
                    </div>
                </div>


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
                                                cursor-pointer
                                            "
                                        >
                                            {row
                                                .getVisibleCells()
                                                .map(
                                                    (cell) => (
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
                                            <MessageSquare
                                                className="
                                                    h-8
                                                    w-8
                                                    mx-auto
                                                    mb-3
                                                "
                                            />

                                            <p>
                                                {hasFilters
                                                    ? "No reviews match your filters."
                                                    : "No reviews found."}
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>


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
                        {totalReviews} reviews
                    </span>
                </div>
            </section>
        </main>
    );
}


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

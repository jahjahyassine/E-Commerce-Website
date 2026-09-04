import { useList, useUpdate } from "@refinedev/core";

import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from "@tanstack/react-table";

import { useMemo, useState } from "react";

import { Link } from "react-router-dom";

import { Search, X, Percent, Save } from "lucide-react";

import AdminSidebar from "../../components/AdminSidebar";

import DotField from "../../../../components/animation/DotField.jsx";

const QUICK_DISCOUNTS = [0, 10, 20, 30, 50];

const formatPrice = (value) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "MAD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value ?? 0));
};

const getAttributes = (attributes) => {
    if (!attributes || typeof attributes !== "object") {
        return [];
    }

    return Object.entries(attributes);
};

const getDiscountedPrice = (price, discount) => {
    const originalPrice = Number(price ?? 0);
    const discountPercentage = Number(discount ?? 0);

    return originalPrice * (1 - discountPercentage / 100);
};

export function DiscountList() {
    const [search, setSearch] = useState("");
    const [rowSelection, setRowSelection] = useState({});
    const [showDiscountOptions, setShowDiscountOptions] = useState(false);
    const [discount, setDiscount] = useState("");
    const [isApplying, setIsApplying] = useState(false);
    const [applyError, setApplyError] = useState("");

    const { mutateAsync: updateVariant } = useUpdate();

    const {
        result: { data },
        query: {
            isPending,
            isError,
            error,
            refetch,
        },
    } = useList({
        resource: "products",
        filters: [
            {
                field: "search",
                operator: "eq",
                value: search !== "" ? search : null,
            },
        ],
        pagination: null,
        sorters: null,
    });

    const products = data ?? [];

    const variants = useMemo(() => {
        return products.flatMap((product) => {
            const productVariants = product?.product_variants ?? [];

            return productVariants.map((variant) => ({
                ...variant,
                product,
                product_id: product.id,
            }));
        });
    }, [products]);

    const discountedVariants = useMemo(() => {
        return variants.filter(
            (variant) =>
                Number(variant.discount_percentage ?? 0) > 0
        );
    }, [variants]);

    const averageDiscount = useMemo(() => {
        if (variants.length === 0) {
            return 0;
        }

        const total = variants.reduce(
            (sum, variant) =>
                sum + Number(variant.discount_percentage ?? 0),
            0
        );

        return total / variants.length;
    }, [variants]);

    const columns = useMemo(
        () => [
            {
                id: "select",
                header: ({ table }) => (
                    <input
                        type="checkbox"
                        checked={table.getIsAllRowsSelected()}
                        onChange={table.getToggleAllRowsSelectedHandler()}
                        className="h-4 w-4 cursor-pointer accent-blue-500"
                        aria-label="Select all variants"
                    />
                ),
                cell: ({ row }) => (
                    <input
                        type="checkbox"
                        checked={row.getIsSelected()}
                        disabled={!row.getCanSelect()}
                        onChange={row.getToggleSelectedHandler()}
                        onClick={(event) => event.stopPropagation()}
                        className="h-4 w-4 cursor-pointer accent-blue-500"
                        aria-label={`Select ${
                            row.original.product?.name ?? "variant"
                        }`}
                    />
                ),
            },
            {
                id: "product",
                header: "Product",
                cell: ({ row }) => {
                    const variant = row.original;
                    const product = variant.product;

                    return (
                        <Link
                            to={`/admin/products/${product?.id}`}
                            onClick={(event) => event.stopPropagation()}
                            className="block hover:text-admin-primary transition-colors"
                        >
                            <p className="font-medium text-admin-text">
                                {product?.name ?? "Unknown Product"}
                            </p>

                            <p className="text-xs text-admin-muted mt-1">
                                Product #{product?.id}
                            </p>
                        </Link>
                    );
                },
            },
            {
                id: "variant",
                header: "Variant",
                cell: ({ row }) => {
                    const attributes = getAttributes(
                        row.original.attributes
                    );

                    if (attributes.length === 0) {
                        return (
                            <span className="text-admin-muted">
                                Default
                            </span>
                        );
                    }

                    return (
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                            {attributes.map(([key, value]) => (
                                <span
                                    key={key}
                                    className="rounded-lg border border-admin-border bg-slate-900 px-2 py-1 text-xs text-admin-muted"
                                >
                                    <span className="text-admin-text">
                                        {key}:
                                    </span>{" "}
                                    {String(value)}
                                </span>
                            ))}
                        </div>
                    );
                },
            },
            {
                accessorKey: "sku",
                header: "SKU",
                cell: ({ getValue }) => (
                    <span className="text-admin-muted font-mono text-xs">
                        {getValue()}
                    </span>
                ),
            },
            {
                accessorKey: "price",
                header: "Price",
                cell: ({ getValue }) => (
                    <span className="font-medium text-admin-text">
                        {formatPrice(getValue())}
                    </span>
                ),
            },
            {
                accessorKey: "discount_percentage",
                header: "Discount",
                cell: ({ getValue }) => {
                    const value = Number(getValue() ?? 0);

                    return (
                        <span
                            className={
                                value > 0
                                    ? "font-semibold text-admin-active"
                                    : "text-admin-muted"
                            }
                        >
                            {value.toFixed(0)}%
                        </span>
                    );
                },
            },
            {
                id: "final_price",
                header: "Final Price",
                cell: ({ row }) => {
                    const variant = row.original;

                    const discountValue = Number(
                        variant.discount_percentage ?? 0
                    );

                    const finalPrice = getDiscountedPrice(
                        variant.price,
                        discountValue
                    );

                    if (discountValue <= 0) {
                        return (
                            <span className="font-medium text-admin-text">
                                {formatPrice(variant.price)}
                            </span>
                        );
                    }

                    return (
                        <div>
                            <p className="font-semibold text-admin-active">
                                {formatPrice(finalPrice)}
                            </p>

                            <p className="text-xs text-admin-muted line-through mt-0.5">
                                {formatPrice(variant.price)}
                            </p>
                        </div>
                    );
                },
            },
            {
                id: "stock",
                header: "Stock",
                cell: ({ row }) => {
                    const quantity = Number(
                        row.original.inventory?.quantity ?? 0
                    );

                    return (
                        <span
                            className={
                                quantity > 0
                                    ? "text-admin-text"
                                    : "text-minimal-red"
                            }
                        >
                            {quantity}
                        </span>
                    );
                },
            },
            {
                accessorKey: "is_active",
                header: "Status",
                cell: ({ getValue }) => {
                    const active = Boolean(getValue());

                    return (
                        <span
                            className={
                                active
                                    ? "text-admin-active"
                                    : "text-admin-inactive"
                            }
                        >
                            {active ? "Active" : "Inactive"}
                        </span>
                    );
                },
            },
        ],
        []
    );

    const table = useReactTable({
        data: variants,
        columns,
        getCoreRowModel: getCoreRowModel(),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        state: {
            rowSelection,
        },
        getRowId: (row) => String(row.id),
    });

    const selectedRows = table.getSelectedRowModel().rows;
    const selectedCount = selectedRows.length;

    const clearSelection = () => {
        setRowSelection({});
        setDiscount("");
        setApplyError("");
        setShowDiscountOptions(false);
    };

    const saveDiscount = async () => {
        if (selectedCount === 0 || isApplying) {
            return;
        }

        const value = Number(discount);

        if (!Number.isFinite(value) || value < 0 || value > 100) {
            setApplyError("Discount must be between 0% and 100%.");
            return;
        }

        setIsApplying(true);
        setApplyError("");

        try {
            const results = await Promise.allSettled(
                selectedRows.map((row) => {
                    const variant = row.original;

                    return updateVariant({
                        resource: `products/${variant.product_id}/variants`,
                        id: variant.id,
                        values: {
                            discount_percentage: value,
                        },
                    });
                })
            );

            const failedCount = results.filter(
                (result) => result.status === "rejected"
            ).length;

            // Refresh the products list with the updated discounts
            await refetch();

            if (failedCount > 0) {
                setApplyError(
                    `${failedCount} variant${
                        failedCount === 1 ? "" : "s"
                    } failed to update.`
                );
                return;
            }

            clearSelection();
        } catch (err) {
            console.error("Failed to save discount:", err);

            setApplyError(
                err?.message ||
                    "Something went wrong while saving the discount."
            );
        } finally {
            setIsApplying(false);
        }
    };

    if (isPending) {
        return (
            <section className="h-screen max-w-full font-sans bg-[#0F172A] text-admin-text flex justify-center items-center">
                <div>Loading discounts...</div>
            </section>
        );
    }

    if (isError) {
        return (
            <section className="h-screen max-w-full font-sans bg-[#0F172A] text-admin-text flex justify-center items-center">
                <div className="text-minimal-red">
                    Error loading discounts:{" "}
                    {error?.message || "Unknown error"}
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
                    speed={0.25}
                    gap={20}
                    dotSize={1}
                    opacities={[0.05, 0.1, 0.2, 0.3, 0.4]}
                    colors={["#94A3B8"]}
                    maxHeight={500}
                />
            </div>

            <section className="relative z-10 h-screen flex-1 text-admin-text order-2 overflow-y-auto p-4">
                {/* Page Header */}
                <div className="flex items-center justify-between gap-4 border-b border-admin-border pb-3 mb-4">
                    <h1 className="text-3xl">Discounts</h1>

                    {selectedCount > 0 && (
                        <button
                            type="button"
                            onClick={() =>
                                setShowDiscountOptions(
                                    (previous) => !previous
                                )
                            }
                            disabled={isApplying}
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
                                disabled:opacity-50
                                disabled:cursor-not-allowed
                            "
                        >
                            <Percent size={18} />

                            {showDiscountOptions
                                ? "Close"
                                : `Add Discount (${selectedCount})`}
                        </button>
                    )}
                </div>

                {/* Discount Options */}
                {showDiscountOptions && selectedCount > 0 && (
                    <div className="border border-admin-border bg-admin-surface rounded-2xl p-4 mb-4">
                        <div className="flex items-center justify-between gap-4 mb-3">
                            <div>
                                <p className="text-admin-text font-medium">
                                    Add Discount
                                </p>

                                <p className="text-admin-muted text-sm mt-1">
                                    Set the discount for {selectedCount}{" "}
                                    selected variant
                                    {selectedCount === 1 ? "" : "s"}.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setShowDiscountOptions(false)
                                }
                                className="text-admin-muted hover:text-admin-text transition-colors"
                                aria-label="Close discount options"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {/* Custom discount */}
                            <div className="relative">
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="1"
                                    value={discount}
                                    onChange={(event) => {
                                        setDiscount(event.target.value);
                                        setApplyError("");
                                    }}
                                    placeholder="Custom"
                                    disabled={isApplying}
                                    className="
                                        w-28
                                        rounded-xl
                                        border border-admin-border
                                        bg-slate-900
                                        px-4 py-2
                                        pr-8
                                        text-sm
                                        text-admin-text
                                        placeholder:text-admin-muted
                                        outline-none
                                        focus:border-admin-primary
                                        disabled:opacity-50
                                    "
                                />

                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-muted text-sm">
                                    %
                                </span>
                            </div>

                            {/* Quick discounts */}
                            {QUICK_DISCOUNTS.map((value) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => {
                                        setDiscount(String(value));
                                        setApplyError("");
                                    }}
                                    disabled={isApplying}
                                    className={`
                                        px-4 py-2
                                        rounded-xl
                                        border
                                        bg-slate-900
                                        transition-colors
                                        disabled:opacity-50
                                        disabled:cursor-not-allowed
                                        ${
                                            discount === String(value)
                                                ? "border-admin-primary text-admin-text bg-slate-800"
                                                : "border-admin-border text-admin-text hover:bg-slate-800 hover:border-admin-primary"
                                        }
                                    `}
                                >
                                    {value}%
                                </button>
                            ))}

                            {/* Save */}
                            <button
                                type="button"
                                onClick={saveDiscount}
                                disabled={
                                    isApplying ||
                                    discount === "" ||
                                    Number(discount) < 0 ||
                                    Number(discount) > 100
                                }
                                className="
                                    flex items-center gap-2
                                    px-4 py-2
                                    rounded-xl
                                    bg-admin-primary
                                    border border-admin-primary-border
                                    text-admin-text
                                    font-semibold
                                    hover:bg-admin-primary-hover
                                    transition-colors
                                    disabled:opacity-50
                                    disabled:cursor-not-allowed
                                "
                            >
                                <Save size={17} />
                                {isApplying ? "Saving..." : "Save"}
                            </button>
                        </div>

                        {applyError && (
                            <p className="text-minimal-red text-sm mt-3">
                                {applyError}
                            </p>
                        )}
                    </div>
                )}

                {/* Filters */}
                <div className="border border-admin-border bg-admin-surface rounded-2xl p-4 mb-4">
                    <p className="text-admin-muted text-sm pb-2">
                        Filters
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted"
                            />

                            <input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                className="
                                    w-72
                                    rounded-xl
                                    border border-admin-border
                                    bg-slate-900
                                    py-2.5 pl-10 pr-4
                                    text-sm text-admin-text
                                    placeholder:text-admin-muted
                                    outline-none
                                    focus:border-admin-primary
                                "
                            />
                        </div>

                        {search !== "" && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                className="
                                    flex items-center gap-2
                                    rounded-xl
                                    border border-admin-border
                                    bg-slate-900
                                    px-3 py-2.5
                                    text-sm text-admin-muted
                                    hover:text-admin-text
                                    hover:bg-slate-800
                                    transition-colors
                                "
                            >
                                <X size={16} />
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Summary */}
                <div className="flex justify-between border-b border-admin-border pb-4 mb-4 px-6">
                    <div>
                        <h3 className="text-admin-muted text-sm">
                            Total Variants
                        </h3>

                        <p className="text-xl font-semibold mt-1">
                            {variants.length}
                        </p>
                    </div>

                    <div>
                        <h3 className="text-admin-muted text-sm">
                            Discounted
                        </h3>

                        <p className="text-xl font-semibold mt-1">
                            {discountedVariants.length}
                        </p>
                    </div>

                    <div>
                        <h3 className="text-admin-muted text-sm">
                            Average Discount
                        </h3>

                        <p className="text-xl font-semibold mt-1">
                            {averageDiscount.toFixed(1)}%
                        </p>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden border border-slate-700 bg-admin-surface rounded-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1200px] text-left">
                            <thead className="border-b border-slate-700 bg-slate-900">
                                {table.getHeaderGroups().map(
                                    (headerGroup) => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map(
                                                (header) => (
                                                    <th
                                                        key={header.id}
                                                        className="px-6 py-4 text-sm font-medium text-admin-muted"
                                                    >
                                                        {header.isPlaceholder
                                                            ? null
                                                            : flexRender(
                                                                  header.column
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
                                {table.getRowModel().rows.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={columns.length}
                                            className="px-6 py-12 text-center text-admin-muted"
                                        >
                                            No variants found.
                                        </td>
                                    </tr>
                                ) : (
                                    table.getRowModel().rows.map((row) => (
                                        <tr
                                            key={row.id}
                                            className={`
                                                border-b border-slate-700/60
                                                hover:bg-slate-800/60
                                                transition-colors
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
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Selection Footer */}
                {selectedCount > 0 && (
                    <div className="mt-4 flex items-center justify-between rounded-xl border border-admin-border bg-admin-surface px-4 py-3">
                        <div>
                            <span className="text-sm text-admin-text">
                                {selectedCount} variant
                                {selectedCount === 1 ? "" : "s"} selected
                            </span>

                            {applyError && (
                                <p className="text-sm text-minimal-red mt-1">
                                    {applyError}
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={clearSelection}
                            disabled={isApplying}
                            className="
                                text-sm
                                text-admin-muted
                                hover:text-admin-text
                                transition-colors
                                disabled:opacity-50
                            "
                        >
                            Clear selection
                        </button>
                    </div>
                )}
            </section>
        </main>
    );
}

export default DiscountList;
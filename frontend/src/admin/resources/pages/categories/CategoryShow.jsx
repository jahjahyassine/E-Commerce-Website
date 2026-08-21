import {
    useShow,
    useUpdate,
    useList
} from "@refinedev/core";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
    ArrowLeft,
    Edit,
    Save,
    X,
    Tag,
    BarChart3,
    Package,
    ShoppingCart,
    DollarSign,
} from "lucide-react";

import AdminSidebar from "../../components/AdminSidebar";
import DotField from "../../../../components/animation/DotField.jsx";


export function CategoryShow() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);

    const [form, setForm] = useState({
        name: "",
        is_active: true,
    });


    const {
        query: {
            data: categoryResponse,
            isLoading,
            isError,
            error,
            refetch,
        },
    } = useShow({
        resource: "categories",
        id,
    });

    const category = categoryResponse?.data;

    const {
        result: { data: productsResponse, total },
        query: { isError: isErrorProducts, error: errorProducts, isPending },
    } = useList({
        resource: "products",
        filters: [
            {
                field: "category_id",
                operator: "eq",
                value: id,
            },
        ]
    })

    const products = productsResponse?.data;

    const totalProducts = total

    const totalSales = products?.reduce(
        (total, product) =>
            total +
            (product.product_variants?.reduce(
                (sum, variant) =>
                    sum +
                    (variant.order_items?.reduce(
                        (acc, item) =>
                            acc + Number(item.quantity || 0),
                        0
                    ) ?? 0),
                0
            ) ?? 0),
        0
    ) ?? 0;

    const totalRevenue = products?.reduce(
        (total, product) =>
            total +
            (product.product_variants?.reduce(
                (sum, variant) =>
                    sum +
                    (variant.order_items?.reduce(
                        (acc, item) =>
                            acc + Number(item.quantity || 0) * Number(item.price),
                        0
                    ) ?? 0),
                0
            ) ?? 0),
        0
    ) ?? 0;

    const {
        mutate: updateCategory,
        isPending: isUpdating,
    } = useUpdate();

    useEffect(() => {
        if (!category) return;

        setForm({
            name: category.name ?? "",
            is_active: category.is_active ?? true,
        });
    }, [category]);


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };


    const handleSave = () => {
        if (!form.name.trim()) {
            alert("Category name is required.");
            return;
        }

        updateCategory(
            {
                resource: "categories",
                id,
                values: {
                    name: form.name.trim(),
                    is_active: form.is_active,
                },
            },
            {
                onSuccess: () => {
                    setIsEditing(false);
                    refetch();
                },
            }
        );
    };


    const handleCancel = () => {
        if (!category) return;

        setForm({
            name: category.name ?? "",
            is_active:
                category.is_active ?? true,
        });

        setIsEditing(false);
    };



    if (isLoading) {
        return (
            <section className="h-screen bg-[#0F172A] text-admin-text flex items-center justify-center">
                Loading category...
            </section>
        );
    }



    if (isError) {
        return (
            <section className="h-screen bg-[#0F172A] text-admin-text flex items-center justify-center">
                <div className="text-center">

                    <p className="text-red-400 mb-4">
                        Error: {error?.message}
                    </p>

                    <button
                        onClick={() =>
                            navigate(
                                "/admin/categories"
                            )
                        }
                        className="
                            px-4 py-2
                            rounded-lg
                            bg-admin-primary
                            hover:bg-admin-primary-hover
                        "
                    >
                        Back to Categories
                    </button>

                </div>
            </section>
        );
    }


    if (!category) {
        return (
            <section className="h-screen bg-[#0F172A] text-admin-text flex items-center justify-center">
                Category not found.
            </section>
        );
    }



    return (
        <main className="h-screen max-w-full font-sans bg-[#0F172A] flex gap-4">

            <header className="relative z-10 h-screen">
                <AdminSidebar />
            </header>


            <div
                className="
                    fixed inset-0
                    w-full h-full
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
                    relative z-10
                    h-screen flex-1
                    text-admin-text
                    overflow-y-auto
                    p-4
                "
            >

                <div
                    className="
                        flex items-center justify-between
                        gap-4
                        border-b border-admin-border
                        pb-3 mb-6
                    "
                >

                    <div className="flex items-center gap-3">

                        <button
                            onClick={() =>
                                navigate(
                                    "/admin/categories"
                                )
                            }
                            className="
                                p-2
                                rounded-lg
                                text-admin-muted
                                hover:text-admin-text
                                hover:bg-slate-800
                                transition-colors
                            "
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>


                        <div>

                            <h1 className="text-3xl font-semibold">
                                {isEditing
                                    ? "Edit Category"
                                    : "Category Details"}
                            </h1>

                            <p className="text-sm text-admin-muted mt-1">
                                Category ID: #{category.id}
                            </p>

                        </div>

                    </div>


                    <div className="flex gap-2">

                        {isEditing ? (
                            <>

                                <button
                                    onClick={
                                        handleCancel
                                    }
                                    disabled={
                                        isUpdating
                                    }
                                    className="
                                        flex items-center gap-2
                                        px-4 py-2
                                        rounded-xl
                                        border border-admin-border
                                        text-admin-muted
                                        hover:text-admin-text
                                        hover:bg-slate-800
                                        transition-colors
                                    "
                                >
                                    <X className="h-4 w-4" />
                                    Cancel
                                </button>


                                <button
                                    onClick={
                                        handleSave
                                    }
                                    disabled={
                                        isUpdating
                                    }
                                    className="
                                        flex items-center gap-2
                                        px-4 py-2
                                        rounded-xl
                                        bg-admin-primary
                                        border border-admin-primary-border
                                        hover:bg-admin-primary-hover
                                        transition-colors
                                        font-semibold
                                    "
                                >
                                    <Save className="h-4 w-4" />

                                    {isUpdating
                                        ? "Saving..."
                                        : "Save Changes"}
                                </button>

                            </>
                        ) : (

                            <button
                                onClick={() =>
                                    setIsEditing(true)
                                }
                                className="
                                    flex items-center gap-2
                                    px-4 py-2
                                    rounded-xl
                                    bg-admin-primary
                                    border border-admin-primary-border
                                    hover:bg-admin-primary-hover
                                    transition-colors
                                    font-semibold
                                "
                            >
                                <Edit className="h-4 w-4" />
                                Edit Category
                            </button>

                        )}

                    </div>

                </div>

                <div
                    className="
                        border border-admin-border
                        bg-admin-surface
                        rounded-2xl
                        p-6
                        mb-4
                    "
                >

                    <div className="flex items-center gap-2 mb-6">

                        <Tag className="h-5 w-5 text-admin-primary" />

                        <h2 className="text-lg font-semibold">
                            Category Information
                        </h2>

                    </div>


                    {isEditing ? (

                        <div className="space-y-6">

                            <div>

                                <label className="block text-sm text-admin-muted mb-2">
                                    Category Name
                                </label>

                                <input
                                    name="name"
                                    value={
                                        form.name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className="
                                        w-full
                                        px-4 py-3
                                        rounded-lg
                                        bg-slate-900
                                        border border-admin-border
                                        text-admin-text
                                        outline-none
                                        focus:border-admin-primary
                                    "
                                />

                            </div>

                            <div>

                                <label className="flex items-center gap-3 cursor-pointer">

                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={
                                            form.is_active
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        className="
                                            h-4 w-4
                                            cursor-pointer
                                            accent-blue-500
                                        "
                                    />

                                    <span className="text-sm">
                                        Category is active
                                    </span>

                                </label>

                            </div>

                        </div>

                    ) : (

                        <div className="space-y-6">

                            <div>

                                <p className="text-sm text-admin-muted mb-1">
                                    Name
                                </p>

                                <h2 className="text-2xl font-semibold">
                                    {category.name}
                                </h2>

                            </div>

                            <div>

                                <p className="text-sm text-admin-muted mb-2">
                                    Status
                                </p>

                                {category.is_active ? (

                                    <span className="inline-flex items-center gap-2 text-admin-active">

                                        <span className="h-1.5 w-1.5 rounded-full bg-admin-active shadow-[0_0_8px_2px_rgba(52,211,153,0.6)]" />

                                        Active

                                    </span>

                                ) : (

                                    <span className="inline-flex items-center gap-2 text-admin-inactive">

                                        <span className="h-1.5 w-1.5 rounded-full bg-minimal-red shadow-[0_0_8px_2px_rgba(248,113,113,0.6)]" />

                                        Inactive

                                    </span>

                                )}

                            </div>

                        </div>

                    )}

                </div>


                <div
                    className="
                        border border-admin-border
                        bg-admin-surface
                        rounded-2xl
                        p-6
                        min-h-[300px]
                    "
                >

                    <div className="flex items-center gap-2 mb-6">

                        <BarChart3 className="h-5 w-5 text-admin-primary" />

                        <h2 className="text-lg font-semibold">
                            Category Statistics
                        </h2>

                    </div>


                    <div
                        className="
                            grid
                            grid-cols-1
                            sm:grid-cols-3
                            gap-4
                            mb-4
                        "
                    >
                        <StatCard
                            icon={<Package className="h-6 w-6" />}
                            label="Total Products"
                            value={totalProducts}
                        />

                        <StatCard
                            icon={<ShoppingCart className="h-6 w-6" />}
                            label="Total Sales"
                            value={`${totalSales} pcs`}
                        />

                        <StatCard
                            icon={<DollarSign className="h-6 w-6" />}
                            label="Total Revenue"
                            value={`$${Number(totalRevenue || 0).toFixed(2)}`}
                        />
                    </div>

                </div>

            </section>

        </main>
    );
}



function StatCard({ icon, label, value }) {
    return (
        <div
            className="
                border border-admin-border
                bg-admin-surface
                rounded-2xl
                p-5
            "
        >
            <div
                className="
                    flex items-center gap-2
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
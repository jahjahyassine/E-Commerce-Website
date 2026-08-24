import {
    useShow,
    useUpdate,
    useList,
    useDelete,
    useApiUrl,
} from "@refinedev/core";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
    ArrowLeft,
    Edit,
    Save,
    X,
    Star,
    Package,
    Tag,
    Layers,
    DollarSign,
    ShoppingCart,
    Plus,
    Trash2,
    ImagePlus,
    Boxes,
} from "lucide-react";

import AdminSidebar from "../../components/AdminSidebar";
import DotField from "../../../../components/animation/DotField.jsx";


export function ProductVariantShow() {
    const { id, variantId } = useParams();
    const navigate = useNavigate();
    const apiUrl = useApiUrl();

    /* ============================================================
       Product editing
    ============================================================ */

    const [isEditing, setIsEditing] = useState(false);

    const [form, setForm] = useState({
        name: "",
        description: "",
        category_id: "",
        brand_id: "",
        is_active: true,
    });


    /* ============================================================
       Variant editing
    ============================================================ */

    const [editingVariantId, setEditingVariantId] = useState(null);

    const [variantForm, setVariantForm] = useState({
        sku: "",
        price: "",
        discount_percentage: "",
        attributes: [],
        is_active: true,
    });


    /* ============================================================
       Stock
    ============================================================ */

    const [isAddingStock, setIsAddingStock] = useState(false);
    const [stockAmount, setStockAmount] = useState("");
    const [isAddingStockPending, setIsAddingStockPending] =
        useState(false);


    /* ============================================================
       Attribute helpers
    ============================================================ */

    const addAttribute = () => {
        setVariantForm((prev) => ({
            ...prev,
            attributes: [
                ...prev.attributes,
                {
                    key: "",
                    value: "",
                },
            ],
        }));
    };


    const updateAttribute = (index, field, value) => {
        setVariantForm((prev) => ({
            ...prev,
            attributes: prev.attributes.map(
                (attribute, i) =>
                    i === index
                        ? {
                            ...attribute,
                            [field]: value,
                        }
                        : attribute
            ),
        }));
    };


    const removeAttribute = (index) => {
        setVariantForm((prev) => ({
            ...prev,
            attributes: prev.attributes.filter(
                (_, i) => i !== index
            ),
        }));
    };


    const buildAttributes = () => {
        const attributes = {};

        if (!Array.isArray(variantForm.attributes)) {
            return attributes;
        }

        variantForm.attributes.forEach(
            ({ key, value }) => {
                const cleanKey =
                    String(key ?? "").trim();

                const cleanValue =
                    String(value ?? "").trim();

                if (cleanKey && cleanValue) {
                    attributes[cleanKey] =
                        cleanValue;
                }
            }
        );

        return attributes;
    };


    /* ============================================================
       Product
    ============================================================ */

    const {
        query: {
            data: productResponse,
            isLoading,
            isError,
            error,
            refetch,
        },
    } = useShow({
        resource: "products",
        id,
    });

    const product = productResponse?.data;


    /* ============================================================
       Mutations
    ============================================================ */

    const {
        mutate: updateProduct,
        isPending: isUpdating,
    } = useUpdate();


    const {
        mutate: updateVariant,
        isPending: isUpdatingVariant,
    } = useUpdate();


    const {
        mutate: deleteVariant,
        isPending: isDeletingVariant,
    } = useDelete();


    /* ============================================================
       Categories
    ============================================================ */

    const {
        query: {
            data: categoriesResponse,
        },
    } = useList({
        resource: "categories",
        pagination: {
            mode: "off",
        },
    });


    /* ============================================================
       Brands
    ============================================================ */

    const {
        query: {
            data: brandsResponse,
        },
    } = useList({
        resource: "brands",
        pagination: {
            mode: "off",
        },
    });


    const categories =
        categoriesResponse?.data ?? [];

    const brands =
        brandsResponse?.data ?? [];


    /* ============================================================
       Product form
    ============================================================ */

    useEffect(() => {
        if (!product) return;

        setForm({
            name: product.name ?? "",
            description: product.description ?? "",
            category_id:
                product.category_id ?? "",
            brand_id:
                product.brand_id ?? "",
            is_active:
                product.is_active ?? true,
        });
    }, [product]);


    const handleChange = (e) => {
        const {
            name,
            value,
            type,
            checked,
        } = e.target;

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
            alert("Product name is required.");
            return;
        }

        updateProduct(
            {
                resource: "products",
                id,
                values: {
                    name: form.name.trim(),
                    description:
                        form.description,
                    category_id:
                        Number(
                            form.category_id
                        ),
                    brand_id:
                        Number(
                            form.brand_id
                        ),
                    is_active:
                        form.is_active,
                },
            },
            {
                onSuccess: () => {
                    setIsEditing(false);
                    refetch();
                },

                onError: (error) => {
                    console.error(
                        "Product update error:",
                        error
                    );

                    alert(
                        error?.message ||
                        "Failed to update product."
                    );
                },
            }
        );
    };


    const handleCancel = () => {
        if (!product) return;

        setForm({
            name: product.name ?? "",
            description:
                product.description ?? "",
            category_id:
                product.category_id ?? "",
            brand_id:
                product.brand_id ?? "",
            is_active:
                product.is_active ?? true,
        });

        setIsEditing(false);
    };


    /* ============================================================
       Selected Variant
    ============================================================ */

    const selectedVariant =
        product?.product_variants?.find(
            (variant) =>
                Number(variant.id) ===
                Number(variantId)
        );


    const currentStock =
        Number(
            selectedVariant
                ?.inventory
                ?.quantity ?? 0
        );


    /* ============================================================
       Variant form
    ============================================================ */

    const resetVariantForm = () => {
        setVariantForm({
            sku: "",
            price: "",
            discount_percentage: "",
            attributes: [],
            is_active: true,
        });
    };


    const handleVariantChange = (e) => {
        const {
            name,
            value,
            type,
            checked,
        } = e.target;

        setVariantForm((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };


    /* ============================================================
       Start editing variant
    ============================================================ */

    const handleStartEditVariant = (
        variant
    ) => {
        if (!variant) return;

        setEditingVariantId(
            variant.id
        );

        setVariantForm({
            sku: variant.sku ?? "",

            price:
                variant.price ?? "",

            discount_percentage:
                variant.discount_percentage ??
                "",

            attributes:
                variant.attributes &&
                typeof variant.attributes ===
                    "object" &&
                !Array.isArray(
                    variant.attributes
                )
                    ? Object.entries(
                        variant.attributes
                    ).map(
                        ([key, value]) => ({
                            key,
                            value: String(
                                value
                            ),
                        })
                    )
                    : [],

            is_active:
                variant.is_active ??
                true,
        });
    };


    /* ============================================================
       Cancel variant editing
    ============================================================ */

    const handleCancelVariant = () => {
        resetVariantForm();
        setEditingVariantId(null);
    };


    /* ============================================================
       Validate variant
    ============================================================ */

    const validateVariant = () => {
        if (!variantForm.sku.trim()) {
            alert("SKU is required.");
            return false;
        }

        if (
            variantForm.price === "" ||
            Number(variantForm.price) < 0
        ) {
            alert(
                "Price must be a valid positive number."
            );

            return false;
        }

        if (
            variantForm.discount_percentage ===
                "" ||
            Number(
                variantForm.discount_percentage
            ) < 0 ||
            Number(
                variantForm.discount_percentage
            ) > 100
        ) {
            alert(
                "Discount must be between 0 and 100."
            );

            return false;
        }

        return true;
    };


    /* ============================================================
       Save variant
    ============================================================ */

    const handleSaveVariant = () => {
        if (!editingVariantId) {
            return;
        }

        if (!validateVariant()) {
            return;
        }

        const attributes =
            buildAttributes();

        updateVariant(
            {
                resource:
                    `products/${id}/variants`,

                id: editingVariantId,

                values: {
                    sku:
                        variantForm.sku.trim(),

                    price:
                        Number(
                            variantForm.price
                        ),

                    discount_percentage:
                        Number(
                            variantForm.discount_percentage
                        ),

                    attributes,

                    is_active:
                        variantForm.is_active,
                },
            },
            {
                onSuccess: () => {
                    handleCancelVariant();
                    refetch();
                },

                onError: (error) => {
                    console.error(
                        "Variant update error:",
                        error
                    );

                    alert(
                        error?.message ||
                        "Failed to update variant."
                    );
                },
            }
        );
    };


    /* ============================================================
       Add Stock
    ============================================================ */

    const handleAddStock = () => {
        const amount =
            Number(stockAmount);

        if (
            !Number.isInteger(amount) ||
            amount <= 0
        ) {
            alert(
                "Stock quantity must be a whole number greater than 0."
            );

            return;
        }

        if (!selectedVariant) {
            alert("Variant not found.");
            return;
        }

        const newQuantity =
            currentStock + amount;

        setIsAddingStockPending(true);

        updateVariant(
            {
                resource:
                    `products/${id}/variants`,

                id: selectedVariant.id,

                values: {
                    quantity:
                        newQuantity,
                },
            },
            {
                onSuccess: () => {
                    setStockAmount("");
                    setIsAddingStock(false);
                    setIsAddingStockPending(
                        false
                    );

                    refetch();
                },

                onError: (error) => {
                    console.error(
                        "Stock update error:",
                        error
                    );

                    alert(
                        error?.message ||
                        "Failed to add stock."
                    );

                    setIsAddingStockPending(
                        false
                    );
                },
            }
        );
    };


    /* ============================================================
       Delete Variant
    ============================================================ */

    const handleDeleteVariant = (
        variant
    ) => {
        if (!variant) return;

        const confirmed =
            window.confirm(
                `Delete variant "${variant.sku}"?`
            );

        if (!confirmed) return;

        deleteVariant(
            {
                resource:
                    `products/${id}/variants`,

                id: variant.id,
            },
            {
                onSuccess: () => {
                    navigate(
                        `/admin/products/${id}`
                    );
                },

                onError: (error) => {
                    console.error(
                        "Variant deletion error:",
                        error
                    );

                    alert(
                        error?.message ||
                        "Failed to delete variant."
                    );
                },
            }
        );
    };


    /* ============================================================
       Statistics
    ============================================================ */

    const totalSales =
        selectedVariant?.order_items?.reduce(
            (sum, item) =>
                sum +
                Number(
                    item.quantity ?? 0
                ),
            0
        ) ?? 0;


    const totalRevenue =
        selectedVariant?.order_items?.reduce(
            (sum, item) =>
                sum +
                Number(
                    item.quantity ?? 0
                ) *
                Number(
                    item.price ?? 0
                ),
            0
        ) ?? 0;


    const category =
        categories.find(
            (category) =>
                Number(category.id) ===
                Number(
                    product?.category_id
                )
        );


    const brand =
        brands.find(
            (brand) =>
                Number(brand.id) ===
                Number(
                    product?.brand_id
                )
        );


    /* ============================================================
       Loading
    ============================================================ */

    if (isLoading) {
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
                Loading product...
            </section>
        );
    }


    /* ============================================================
       Error
    ============================================================ */

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
                        Error:{" "}
                        {error?.message}
                    </p>

                    <button
                        onClick={() =>
                            navigate(
                                "/admin/products"
                            )
                        }
                        className="
                            px-4
                            py-2
                            rounded-lg
                            bg-admin-primary
                            hover:bg-admin-primary-hover
                        "
                    >
                        Back to Products
                    </button>

                </div>
            </section>
        );
    }


    /* ============================================================
       Product Not Found
    ============================================================ */

    if (!product) {
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
                Product not found.
            </section>
        );
    }


    /* ============================================================
       Variant Not Found
    ============================================================ */

    if (!selectedVariant) {
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

                    <Layers
                        className="
                            h-10
                            w-10
                            mx-auto
                            mb-4
                            opacity-40
                        "
                    />

                    <h2 className="
                        text-xl
                        font-semibold
                        mb-2
                    ">
                        Variant not found
                    </h2>

                    <p className="
                        text-sm
                        text-admin-muted
                        mb-5
                    ">
                        This variant may have been
                        deleted or does not belong
                        to this product.
                    </p>

                    <button
                        onClick={() =>
                            navigate(
                                `/admin/products/${id}`
                            )
                        }
                        className="
                            inline-flex
                            items-center
                            gap-2
                            px-4
                            py-2
                            rounded-xl
                            bg-admin-primary
                            hover:bg-admin-primary-hover
                            font-semibold
                        "
                    >
                        <ArrowLeft
                            className="h-4 w-4"
                        />

                        Back to Product
                    </button>

                </div>
            </section>
        );
    }


    /* ============================================================
       Variant media
    ============================================================ */

    const media =
        selectedVariant.media ?? [];


    /* ============================================================
       Variant status
    ============================================================ */

    const variantActive =
        selectedVariant.is_active &&
        currentStock > 0;


    /* ============================================================
       UI
    ============================================================ */

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

            {/* ====================================================
                Sidebar
            ==================================================== */}

            <header
                className="
                    relative
                    z-10
                    h-screen
                "
            >
                <AdminSidebar />
            </header>


            {/* ====================================================
                Background
            ==================================================== */}

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


            {/* ====================================================
                Content
            ==================================================== */}

            <section
                className="
                    relative
                    z-10
                    h-screen
                    flex-1
                    text-admin-text
                    overflow-y-auto
                    p-4
                "
            >

                {/* =================================================
                    Header
                ================================================= */}

                <div
                    className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        border-b
                        border-admin-border
                        pb-3
                        mb-6
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-3
                        "
                    >

                        <button
                            onClick={() =>
                                navigate(
                                    `/admin/products/${id}`
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
                            <ArrowLeft
                                className="h-5 w-5"
                            />
                        </button>


                        <div>

                            <h1
                                className="
                                    text-3xl
                                    font-semibold
                                "
                            >
                                {isEditing
                                    ? "Edit Product"
                                    : "Product Details"}
                            </h1>

                            <p
                                className="
                                    text-sm
                                    text-admin-muted
                                    mt-1
                                "
                            >
                                Product ID: #
                                {product.id}
                                {" • "}
                                Variant ID: #
                                {selectedVariant.id}
                            </p>

                        </div>

                    </div>


                    <div className="
                        flex
                        gap-2
                    ">

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
                                        flex
                                        items-center
                                        gap-2
                                        px-4
                                        py-2
                                        rounded-xl
                                        border
                                        border-admin-border
                                        text-admin-muted
                                        hover:text-admin-text
                                        hover:bg-slate-800
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
                                        flex
                                        items-center
                                        gap-2
                                        px-4
                                        py-2
                                        rounded-xl
                                        bg-admin-primary
                                        border
                                        border-admin-primary-border
                                        hover:bg-admin-primary-hover
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
                                    setIsEditing(
                                        true
                                    )
                                }
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    px-4
                                    py-2
                                    rounded-xl
                                    bg-admin-primary
                                    border
                                    border-admin-primary-border
                                    hover:bg-admin-primary-hover
                                    font-semibold
                                "
                            >
                                <Edit className="h-4 w-4" />
                                Edit Product
                            </button>

                        )}

                    </div>

                </div>


                {/* =================================================
                    Product Information
                ================================================= */}

                <div
                    className="
                        border
                        border-admin-border
                        bg-admin-surface
                        rounded-2xl
                        p-6
                        mb-4
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                            mb-6
                        "
                    >
                        <Package
                            className="
                                h-5
                                w-5
                                text-admin-primary
                            "
                        />

                        <h2
                            className="
                                text-lg
                                font-semibold
                            "
                        >
                            Product Information
                        </h2>

                    </div>


                    {isEditing ? (

                        <div
                            className="
                                grid
                                grid-cols-1
                                md:grid-cols-2
                                gap-5
                            "
                        >

                            {/* Product Name */}

                            <div className="
                                md:col-span-2
                            ">

                                <label
                                    className="
                                        block
                                        text-sm
                                        text-admin-muted
                                        mb-2
                                    "
                                >
                                    Product Name
                                </label>

                                <input
                                    name="name"
                                    value={
                                        form.name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className={
                                        inputClass
                                    }
                                />

                            </div>


                            {/* Description */}

                            <div className="
                                md:col-span-2
                            ">

                                <label
                                    className="
                                        block
                                        text-sm
                                        text-admin-muted
                                        mb-2
                                    "
                                >
                                    Description
                                </label>

                                <textarea
                                    name="description"
                                    value={
                                        form.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    rows={5}
                                    className={`
                                        ${inputClass}
                                        resize-none
                                    `}
                                />

                            </div>


                            {/* Category */}

                            <div>

                                <label
                                    className="
                                        block
                                        text-sm
                                        text-admin-muted
                                        mb-2
                                    "
                                >
                                    Category
                                </label>

                                <select
                                    name="category_id"
                                    value={
                                        form.category_id
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className={
                                        inputClass
                                    }
                                >

                                    <option value="">
                                        Select category
                                    </option>

                                    {categories.map(
                                        (category) => (
                                            <option
                                                key={
                                                    category.id
                                                }
                                                value={
                                                    category.id
                                                }
                                            >
                                                {
                                                    category.name
                                                }
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>


                            {/* Brand */}

                            <div>

                                <label
                                    className="
                                        block
                                        text-sm
                                        text-admin-muted
                                        mb-2
                                    "
                                >
                                    Brand
                                </label>

                                <select
                                    name="brand_id"
                                    value={
                                        form.brand_id
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className={
                                        inputClass
                                    }
                                >

                                    <option value="">
                                        Select brand
                                    </option>

                                    {brands.map(
                                        (brand) => (
                                            <option
                                                key={
                                                    brand.id
                                                }
                                                value={
                                                    brand.id
                                                }
                                            >
                                                {
                                                    brand.name
                                                }
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>


                            {/* Active */}

                            <div
                                className="
                                    md:col-span-2
                                "
                            >

                                <label
                                    className="
                                        flex
                                        items-center
                                        gap-3
                                        cursor-pointer
                                    "
                                >

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
                                            h-4
                                            w-4
                                            cursor-pointer
                                            accent-blue-500
                                        "
                                    />

                                    <span className="
                                        text-sm
                                    ">
                                        Product is active
                                    </span>

                                </label>

                            </div>

                        </div>

                    ) : (

                        <div className="
                            space-y-6
                        ">

                            <div>

                                <p
                                    className="
                                        text-sm
                                        text-admin-muted
                                        mb-1
                                    "
                                >
                                    Name
                                </p>

                                <h2
                                    className="
                                        text-2xl
                                        font-semibold
                                    "
                                >
                                    {product.name}
                                </h2>

                            </div>


                            <div>

                                <p
                                    className="
                                        text-sm
                                        text-admin-muted
                                        mb-2
                                    "
                                >
                                    Description
                                </p>

                                <p
                                    className="
                                        text-sm
                                        leading-7
                                        text-slate-300
                                    "
                                >
                                    {product.description ||
                                        "No description available."}
                                </p>

                            </div>


                            <div
                                className="
                                    grid
                                    grid-cols-1
                                    md:grid-cols-4
                                    gap-4
                                "
                            >

                                <InfoCard
                                    icon={
                                        <Tag className="h-5 w-5" />
                                    }
                                    label="Category"
                                    value={
                                        category?.name ??
                                        product.category?.name ??
                                        "—"
                                    }
                                />


                                <InfoCard
                                    icon={
                                        <Layers className="h-5 w-5" />
                                    }
                                    label="Brand"
                                    value={
                                        brand?.name ??
                                        product.brand?.name ??
                                        "—"
                                    }
                                />


                                <InfoCard
                                    icon={
                                        <Star className="h-5 w-5" />
                                    }
                                    label="Rating"
                                    value={`${Number(
                                        product.average_rating ||
                                        0
                                    ).toFixed(1)} / 5`}
                                />


                                <InfoCard
                                    icon={
                                        <Package className="h-5 w-5" />
                                    }
                                    label="Status"
                                    value={
                                        product.is_active
                                            ? "Active"
                                            : "Inactive"
                                    }
                                />

                            </div>

                        </div>

                    )}

                </div>


                {/* =================================================
                    Statistics
                ================================================= */}

                <div
                    className="
                        grid
                        grid-cols-1
                        md:grid-cols-4
                        gap-4
                        mb-4
                    "
                >

                    <StatCard
                        icon={
                            <Boxes className="h-6 w-6" />
                        }
                        label="Current Stock"
                        value={`${currentStock} pcs`}
                    />


                    <StatCard
                        icon={
                            <ShoppingCart className="h-6 w-6" />
                        }
                        label="Units Sold"
                        value={`${totalSales} pcs`}
                    />


                    <StatCard
                        icon={
                            <DollarSign className="h-6 w-6" />
                        }
                        label="Revenue"
                        value={`$${totalRevenue.toFixed(
                            2
                        )}`}
                    />


                    <StatCard
                        icon={
                            <Package className="h-6 w-6" />
                        }
                        label="Status"
                        value={
                            selectedVariant.is_active
                                ? currentStock > 0
                                    ? "Active"
                                    : "Out of Stock"
                                : "Inactive"
                        }
                    />

                </div>


                {/* =================================================
                    Variant
                ================================================= */}

                <div
                    className="
                        border
                        border-admin-border
                        bg-admin-surface
                        rounded-2xl
                        overflow-hidden
                    "
                >

                    {/* =================================================
                        Variant Header
                    ================================================= */}

                    <div
                        className="
                            p-6
                            border-b
                            border-admin-border
                            flex
                            items-center
                            justify-between
                            gap-4
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                gap-3
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-center
                                    h-10
                                    w-10
                                    rounded-xl
                                    bg-admin-primary/10
                                    border
                                    border-admin-border
                                "
                            >
                                <Layers
                                    className="
                                        h-5
                                        w-5
                                        text-admin-primary
                                    "
                                />
                            </div>


                            <div>

                                <h2
                                    className="
                                        text-lg
                                        font-semibold
                                    "
                                >
                                    Variant
                                </h2>

                                <p
                                    className="
                                        text-xs
                                        text-admin-muted
                                        mt-1
                                    "
                                >
                                    SKU:{" "}
                                    {selectedVariant.sku}
                                </p>

                            </div>

                        </div>


                        {!editingVariantId && (
                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                "
                            >

                                {/* PRIMARY ACTION */}

                                <button
                                    onClick={() =>
                                        setIsAddingStock(
                                            true
                                        )
                                    }
                                    disabled={
                                        isAddingStock
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        px-4
                                        py-2
                                        rounded-xl
                                        bg-admin-primary
                                        border
                                        border-admin-primary-border
                                        hover:bg-admin-primary-hover
                                        font-semibold
                                        disabled:opacity-50
                                        disabled:cursor-not-allowed
                                    "
                                >
                                    <Plus
                                        className="h-4 w-4"
                                    />

                                    Add Stock
                                </button>


                                {/* SECONDARY ACTION */}

                                <button
                                    onClick={() =>
                                        handleStartEditVariant(
                                            selectedVariant
                                        )
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        px-4
                                        py-2
                                        rounded-xl
                                        border
                                        border-admin-border
                                        text-admin-muted
                                        hover:text-admin-text
                                        hover:bg-slate-800
                                        font-medium
                                    "
                                >
                                    <Edit
                                        className="h-4 w-4"
                                    />

                                    Edit Variant
                                </button>

                            </div>
                        )}

                    </div>


                    {/* =================================================
                        Add Stock
                    ================================================= */}

                    {isAddingStock && (
                        <div
                            className="
                                p-6
                                border-b
                                border-admin-border
                                bg-slate-900/40
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    mb-5
                                "
                            >

                                <div>

                                    <h3
                                        className="
                                            font-semibold
                                        "
                                    >
                                        Add Stock
                                    </h3>

                                    <p
                                        className="
                                            text-xs
                                            text-admin-muted
                                            mt-1
                                        "
                                    >
                                        Add inventory to{" "}
                                        <span className="
                                            text-admin-text
                                            font-medium
                                        ">
                                            {selectedVariant.sku}
                                        </span>
                                        .
                                    </p>

                                </div>


                                <button
                                    onClick={() => {
                                        setIsAddingStock(
                                            false
                                        );
                                        setStockAmount(
                                            ""
                                        );
                                    }}
                                    className="
                                        p-2
                                        rounded-lg
                                        text-admin-muted
                                        hover:text-admin-text
                                        hover:bg-slate-800
                                    "
                                >
                                    <X
                                        className="h-4 w-4"
                                    />
                                </button>

                            </div>


                            <div
                                className="
                                    grid
                                    grid-cols-1
                                    md:grid-cols-3
                                    gap-4
                                    items-end
                                "
                            >

                                {/* Current Stock */}

                                <div>

                                    <label
                                        className="
                                            block
                                            text-sm
                                            text-admin-muted
                                            mb-2
                                        "
                                    >
                                        Current Stock
                                    </label>

                                    <div
                                        className="
                                            px-4
                                            py-3
                                            rounded-lg
                                            bg-slate-900
                                            border
                                            border-admin-border
                                            text-admin-text
                                        "
                                    >
                                        {currentStock} pcs
                                    </div>

                                </div>


                                {/* Quantity */}

                                <div>

                                    <label
                                        className="
                                            block
                                            text-sm
                                            text-admin-muted
                                            mb-2
                                        "
                                    >
                                        Quantity to Add
                                    </label>

                                    <div
                                        className="
                                            relative
                                        "
                                    >

                                        <Boxes
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
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={
                                                stockAmount
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setStockAmount(
                                                    e
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="e.g. 50"
                                            className="
                                                w-full
                                                px-4
                                                py-3
                                                pl-10
                                                rounded-lg
                                                bg-slate-900
                                                border
                                                border-admin-border
                                                text-admin-text
                                                outline-none
                                                focus:border-admin-primary
                                            "
                                        />

                                    </div>

                                </div>


                                {/* Buttons */}

                                <div
                                    className="
                                        flex
                                        gap-2
                                    "
                                >

                                    <button
                                        onClick={() => {
                                            setIsAddingStock(
                                                false
                                            );
                                            setStockAmount(
                                                ""
                                            );
                                        }}
                                        disabled={
                                            isAddingStockPending
                                        }
                                        className="
                                            flex-1
                                            px-4
                                            py-3
                                            rounded-xl
                                            border
                                            border-admin-border
                                            text-admin-muted
                                            hover:text-admin-text
                                            hover:bg-slate-800
                                        "
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        onClick={
                                            handleAddStock
                                        }
                                        disabled={
                                            isAddingStockPending
                                        }
                                        className="
                                            flex-1
                                            px-4
                                            py-3
                                            rounded-xl
                                            bg-admin-primary
                                            border
                                            border-admin-primary-border
                                            hover:bg-admin-primary-hover
                                            font-semibold
                                            disabled:opacity-50
                                            disabled:cursor-not-allowed
                                        "
                                    >
                                        {isAddingStockPending
                                            ? "Adding..."
                                            : `Add ${
                                                stockAmount ||
                                                "0"
                                            } pcs`}
                                    </button>

                                </div>

                            </div>

                        </div>
                    )}


                    {/* =================================================
                        Edit Variant Form
                    ================================================= */}

                    {editingVariantId && (
                        <div
                            className="
                                p-6
                                border-b
                                border-admin-border
                                bg-slate-900/40
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    mb-5
                                "
                            >

                                <div>

                                    <h3
                                        className="
                                            font-semibold
                                        "
                                    >
                                        Edit Variant
                                    </h3>

                                    <p
                                        className="
                                            text-xs
                                            text-admin-muted
                                            mt-1
                                        "
                                    >
                                        Update the
                                        variant
                                        information.
                                    </p>

                                </div>


                                <button
                                    onClick={
                                        handleCancelVariant
                                    }
                                    className="
                                        p-2
                                        rounded-lg
                                        text-admin-muted
                                        hover:text-admin-text
                                        hover:bg-slate-800
                                    "
                                >
                                    <X
                                        className="h-4 w-4"
                                    />
                                </button>

                            </div>


                            <div
                                className="
                                    grid
                                    grid-cols-1
                                    md:grid-cols-2
                                    gap-5
                                "
                            >

                                {/* SKU */}

                                <FormField label="SKU">

                                    <input
                                        name="sku"
                                        value={
                                            variantForm.sku
                                        }
                                        onChange={
                                            handleVariantChange
                                        }
                                        placeholder="e.g. IP15-BLK-128"
                                        className={
                                            inputClass
                                        }
                                    />

                                </FormField>


                                {/* Price */}

                                <FormField label="Price">

                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        name="price"
                                        value={
                                            variantForm.price
                                        }
                                        onChange={
                                            handleVariantChange
                                        }
                                        placeholder="0.00"
                                        className={
                                            inputClass
                                        }
                                    />

                                </FormField>


                                {/* Discount */}

                                <FormField
                                    label="Discount %"
                                >

                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        name="discount_percentage"
                                        value={
                                            variantForm.discount_percentage
                                        }
                                        onChange={
                                            handleVariantChange
                                        }
                                        placeholder="0"
                                        className={
                                            inputClass
                                        }
                                    />

                                </FormField>


                                {/* Active */}

                                <div
                                    className="
                                        flex
                                        items-end
                                    "
                                >

                                    <label
                                        className="
                                            flex
                                            items-center
                                            gap-3
                                            cursor-pointer
                                            pb-3
                                        "
                                    >

                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            checked={
                                                variantForm.is_active
                                            }
                                            onChange={
                                                handleVariantChange
                                            }
                                            className="
                                                h-4
                                                w-4
                                                cursor-pointer
                                                accent-blue-500
                                            "
                                        />

                                        <span className="
                                            text-sm
                                        ">
                                            Variant is active
                                        </span>

                                    </label>

                                </div>


                                {/* Attributes */}

                                <div
                                    className="
                                        md:col-span-2
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            items-center
                                            justify-between
                                            mb-3
                                        "
                                    >

                                        <div>

                                            <label
                                                className="
                                                    block
                                                    text-sm
                                                    text-admin-muted
                                                "
                                            >
                                                Variant
                                                Attributes
                                            </label>

                                            <p
                                                className="
                                                    text-xs
                                                    text-admin-muted
                                                    mt-1
                                                "
                                            >
                                                Specifications
                                                such as
                                                RAM,
                                                storage,
                                                color,
                                                or
                                                processor.
                                            </p>

                                        </div>


                                        <button
                                            type="button"
                                            onClick={
                                                addAttribute
                                            }
                                            className="
                                                flex
                                                items-center
                                                gap-1.5
                                                px-3
                                                py-2
                                                rounded-lg
                                                border
                                                border-admin-border
                                                text-sm
                                                text-admin-muted
                                                hover:text-admin-text
                                                hover:bg-slate-800
                                            "
                                        >
                                            <Plus
                                                className="h-4 w-4"
                                            />

                                            Add Attribute
                                        </button>

                                    </div>


                                    <div
                                        className="
                                            rounded-xl
                                            border
                                            border-admin-border
                                            bg-slate-900/50
                                            overflow-hidden
                                        "
                                    >

                                        {variantForm.attributes.length ===
                                        0 ? (

                                            <div
                                                className="
                                                    px-4
                                                    py-8
                                                    text-center
                                                    text-sm
                                                    text-admin-muted
                                                "
                                            >
                                                No attributes
                                                added yet.
                                            </div>

                                        ) : (

                                            <div
                                                className="
                                                    divide-y
                                                    divide-slate-800
                                                "
                                            >

                                                {variantForm.attributes.map(
                                                    (
                                                        attribute,
                                                        index
                                                    ) => (

                                                        <div
                                                            key={
                                                                index
                                                            }
                                                            className="
                                                                flex
                                                                items-center
                                                                gap-3
                                                                p-3
                                                            "
                                                        >

                                                            <input
                                                                type="text"
                                                                value={
                                                                    attribute.key
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) =>
                                                                    updateAttribute(
                                                                        index,
                                                                        "key",
                                                                        e
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="Attribute name"
                                                                className="
                                                                    w-1/3
                                                                    px-3
                                                                    py-2.5
                                                                    rounded-lg
                                                                    bg-slate-900
                                                                    border
                                                                    border-admin-border
                                                                    text-admin-text
                                                                    text-sm
                                                                    outline-none
                                                                    focus:border-admin-primary
                                                                "
                                                            />


                                                            <input
                                                                type="text"
                                                                value={
                                                                    attribute.value
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) =>
                                                                    updateAttribute(
                                                                        index,
                                                                        "value",
                                                                        e
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                placeholder="Value"
                                                                className="
                                                                    flex-1
                                                                    px-3
                                                                    py-2.5
                                                                    rounded-lg
                                                                    bg-slate-900
                                                                    border
                                                                    border-admin-border
                                                                    text-admin-text
                                                                    text-sm
                                                                    outline-none
                                                                    focus:border-admin-primary
                                                                "
                                                            />


                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeAttribute(
                                                                        index
                                                                    )
                                                                }
                                                                className="
                                                                    p-2
                                                                    rounded-lg
                                                                    text-red-400
                                                                    hover:text-red-300
                                                                    hover:bg-red-500/10
                                                                "
                                                            >
                                                                <Trash2
                                                                    className="h-4 w-4"
                                                                />
                                                            </button>

                                                        </div>

                                                    )
                                                )}

                                            </div>

                                        )}

                                    </div>

                                </div>

                            </div>


                            {/* Edit buttons */}

                            <div
                                className="
                                    flex
                                    justify-between
                                    items-center
                                    gap-2
                                    mt-6
                                "
                            >

                                <button
                                    onClick={() =>
                                        handleDeleteVariant(
                                            selectedVariant
                                        )
                                    }
                                    disabled={
                                        isDeletingVariant ||
                                        isUpdatingVariant
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        px-4
                                        py-2
                                        rounded-xl
                                        text-red-400
                                        border
                                        border-red-500/20
                                        hover:bg-red-500/10
                                        disabled:opacity-50
                                    "
                                >
                                    <Trash2
                                        className="h-4 w-4"
                                    />

                                    {isDeletingVariant
                                        ? "Deleting..."
                                        : "Delete Variant"}
                                </button>


                                <div
                                    className="
                                        flex
                                        gap-2
                                    "
                                >

                                    <button
                                        onClick={
                                            handleCancelVariant
                                        }
                                        disabled={
                                            isUpdatingVariant
                                        }
                                        className="
                                            flex
                                            items-center
                                            gap-2
                                            px-4
                                            py-2
                                            rounded-xl
                                            border
                                            border-admin-border
                                            text-admin-muted
                                            hover:text-admin-text
                                            hover:bg-slate-800
                                        "
                                    >
                                        <X
                                            className="h-4 w-4"
                                        />

                                        Cancel
                                    </button>


                                    <button
                                        onClick={
                                            handleSaveVariant
                                        }
                                        disabled={
                                            isUpdatingVariant
                                        }
                                        className="
                                            flex
                                            items-center
                                            gap-2
                                            px-4
                                            py-2
                                            rounded-xl
                                            bg-admin-primary
                                            border
                                            border-admin-primary-border
                                            hover:bg-admin-primary-hover
                                            font-semibold
                                            disabled:opacity-50
                                        "
                                    >

                                        <Save
                                            className="h-4 w-4"
                                        />

                                        {isUpdatingVariant
                                            ? "Saving..."
                                            : "Save Variant"}

                                    </button>

                                </div>

                            </div>

                        </div>
                    )}


                    {/* =================================================
                        Variant Details
                    ================================================= */}

                    {!editingVariantId && (
                        <div
                            className="
                                p-6
                            "
                        >

                            <div
                                className="
                                    grid
                                    grid-cols-1
                                    md:grid-cols-2
                                    lg:grid-cols-4
                                    gap-4
                                    mb-6
                                "
                            >

                                {/* SKU */}

                                <InfoCard
                                    icon={
                                        <Tag className="h-5 w-5" />
                                    }
                                    label="SKU"
                                    value={
                                        selectedVariant.sku ||
                                        "—"
                                    }
                                />


                                {/* Price */}

                                <InfoCard
                                    icon={
                                        <DollarSign className="h-5 w-5" />
                                    }
                                    label="Price"
                                    value={`$${Number(
                                        selectedVariant.price ||
                                        0
                                    ).toFixed(2)}`}
                                />


                                {/* Discount */}

                                <InfoCard
                                    icon={
                                        <Tag className="h-5 w-5" />
                                    }
                                    label="Discount"
                                    value={`${Number(
                                        selectedVariant.discount_percentage ||
                                        0
                                    )}%`}
                                />


                                {/* Stock */}

                                <InfoCard
                                    icon={
                                        <Boxes className="h-5 w-5" />
                                    }
                                    label="Stock"
                                    value={`${currentStock} pcs`}
                                />

                            </div>


                            {/* Images */}

                            <div className="
                                mb-6
                            ">

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        mb-3
                                    "
                                >

                                    <ImagePlus
                                        className="
                                            h-5
                                            w-5
                                            text-admin-primary
                                        "
                                    />

                                    <h3
                                        className="
                                            font-semibold
                                        "
                                    >
                                        Images
                                    </h3>

                                </div>


                                {media.length > 0 ? (

                                    <div
                                        className="
                                            grid
                                            grid-cols-2
                                            sm:grid-cols-3
                                            md:grid-cols-4
                                            lg:grid-cols-5
                                            gap-4
                                        "
                                    >

                                        {media.map(
                                            (
                                                image,
                                                index
                                            ) => (

                                                <div
                                                    key={
                                                        image.id ??
                                                        index
                                                    }
                                                    className="
                                                        aspect-square
                                                        rounded-xl
                                                        overflow-hidden
                                                        border
                                                        border-admin-border
                                                        bg-slate-900
                                                    "
                                                >

                                                    <img
                                                        src={
                                                            image.media_url
                                                        }
                                                        alt={`${selectedVariant.sku} ${index + 1}`}
                                                        className="
                                                            w-full
                                                            h-full
                                                            object-cover
                                                        "
                                                    />

                                                </div>

                                            )
                                        )}

                                    </div>

                                ) : (

                                    <div
                                        className="
                                            flex
                                            items-center
                                            gap-3
                                            px-4
                                            py-5
                                            rounded-xl
                                            bg-slate-900/50
                                            border
                                            border-admin-border
                                            text-admin-muted
                                        "
                                    >

                                        <ImagePlus
                                            className="
                                                h-5
                                                w-5
                                            "
                                        />

                                        <span className="
                                            text-sm
                                        ">
                                            No images available
                                            for this variant.
                                        </span>

                                    </div>

                                )}

                            </div>


                            {/* Attributes */}

                            <div
                                className="
                                    mb-6
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        mb-3
                                    "
                                >

                                    <Layers
                                        className="
                                            h-5
                                            w-5
                                            text-admin-primary
                                        "
                                    />

                                    <h3
                                        className="
                                            font-semibold
                                        "
                                    >
                                        Attributes
                                    </h3>

                                </div>


                                {selectedVariant.attributes &&
                                typeof selectedVariant.attributes ===
                                    "object" &&
                                !Array.isArray(
                                    selectedVariant.attributes
                                ) &&
                                Object.keys(
                                    selectedVariant.attributes
                                ).length > 0 ? (

                                    <div
                                        className="
                                            grid
                                            grid-cols-1
                                            sm:grid-cols-2
                                            md:grid-cols-3
                                            gap-3
                                        "
                                    >

                                        {Object.entries(
                                            selectedVariant.attributes
                                        ).map(
                                            ([
                                                key,
                                                value,
                                            ]) => (

                                                <div
                                                    key={
                                                        key
                                                    }
                                                    className="
                                                        px-4
                                                        py-3
                                                        rounded-xl
                                                        bg-slate-900/50
                                                        border
                                                        border-admin-border
                                                    "
                                                >

                                                    <p
                                                        className="
                                                            text-xs
                                                            text-admin-muted
                                                            mb-1
                                                        "
                                                    >
                                                        {key}
                                                    </p>

                                                    <p
                                                        className="
                                                            text-sm
                                                            font-medium
                                                        "
                                                    >
                                                        {String(
                                                            value
                                                        )}
                                                    </p>

                                                </div>

                                            )
                                        )}

                                    </div>

                                ) : (

                                    <div
                                        className="
                                            px-4
                                            py-5
                                            rounded-xl
                                            bg-slate-900/50
                                            border
                                            border-admin-border
                                            text-sm
                                            text-admin-muted
                                        "
                                    >
                                        No attributes defined.
                                    </div>

                                )}

                            </div>


                            {/* Status */}

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    gap-4
                                    pt-5
                                    border-t
                                    border-admin-border
                                "
                            >

                                <div>

                                    <p
                                        className="
                                            text-sm
                                            text-admin-muted
                                            mb-1
                                        "
                                    >
                                        Variant Status
                                    </p>

                                    <div
                                        className="
                                            flex
                                            items-center
                                            gap-2
                                        "
                                    >

                                        <span
                                            className={`
                                                h-2
                                                w-2
                                                rounded-full
                                                ${
                                                    variantActive
                                                        ? "bg-admin-active"
                                                        : "bg-minimal-red"
                                                }
                                            `}
                                        />

                                        <span
                                            className={`
                                                text-sm
                                                font-medium
                                                ${
                                                    variantActive
                                                        ? "text-admin-active"
                                                        : "text-admin-inactive"
                                                }
                                            `}
                                        >
                                            {selectedVariant.is_active
                                                ? currentStock >
                                                  0
                                                    ? "Active"
                                                    : "Out of Stock"
                                                : "Inactive"}
                                        </span>

                                    </div>

                                </div>


                                <button
                                    onClick={() =>
                                        handleDeleteVariant(
                                            selectedVariant
                                        )
                                    }
                                    disabled={
                                        isDeletingVariant
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        px-4
                                        py-2
                                        rounded-xl
                                        text-red-400
                                        border
                                        border-red-500/20
                                        hover:bg-red-500/10
                                        disabled:opacity-50
                                    "
                                >

                                    <Trash2
                                        className="h-4 w-4"
                                    />

                                    {isDeletingVariant
                                        ? "Deleting..."
                                        : "Delete Variant"}

                                </button>

                            </div>

                        </div>
                    )}

                </div>

            </section>

        </main>
    );
}


/* ============================================================
   Form Field
============================================================ */

function FormField({
    label,
    children,
}) {
    return (
        <div>

            <label
                className="
                    block
                    text-sm
                    text-admin-muted
                    mb-2
                "
            >
                {label}
            </label>

            {children}

        </div>
    );
}


/* ============================================================
   Shared input class
============================================================ */

const inputClass = `
    w-full
    px-4
    py-3
    rounded-lg
    bg-slate-900
    border
    border-admin-border
    text-admin-text
    outline-none
    focus:border-admin-primary
`;


/* ============================================================
   Info Card
============================================================ */

function InfoCard({
    icon,
    label,
    value,
}) {
    return (
        <div
            className="
                p-4
                rounded-xl
                bg-slate-900/60
                border
                border-admin-border
            "
        >

            <div
                className="
                    flex
                    items-center
                    gap-2
                    text-admin-muted
                    mb-2
                "
            >
                {icon}

                <span className="text-xs">
                    {label}
                </span>

            </div>


            <p className="font-semibold">
                {value}
            </p>

        </div>
    );
}


/* ============================================================
   Stat Card
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


            <p
                className="
                    text-2xl
                    font-bold
                "
            >
                {value}
            </p>

        </div>
    );
}
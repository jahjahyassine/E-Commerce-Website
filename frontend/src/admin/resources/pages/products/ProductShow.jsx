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
    Upload,
    Boxes,
} from "lucide-react";

import AdminSidebar from "../../components/AdminSidebar";
import DotField from "../../../../components/animation/DotField.jsx";


export function ProductShow() {
    const { id } = useParams();
    const navigate = useNavigate();
    const apiUrl = useApiUrl();

    /* -----------------------------------------------------------
       Product editing
    ----------------------------------------------------------- */

    const [isEditing, setIsEditing] = useState(false);

    const [form, setForm] = useState({
        name: "",
        description: "",
        category_id: "",
        brand_id: "",
        is_active: true,
    });

    /* -----------------------------------------------------------
       Variant editing
    ----------------------------------------------------------- */

    const [editingVariantId, setEditingVariantId] = useState(null);
    const [isAddingVariant, setIsAddingVariant] = useState(false);

    const [variantForm, setVariantForm] = useState({
        sku: "",
        price: "",
        discount_percentage: "",
        quantity: "",
        attributes: [],
        is_active: true,
    });

    const [variantMedia, setVariantMedia] = useState([]);
    const [variantMediaPreviews, setVariantMediaPreviews] = useState([]);

    const [isUploadingVariant, setIsUploadingVariant] = useState(false);


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

        variantForm.attributes.forEach(
            ({ key, value }) => {
                const cleanKey = key.trim();

                if (cleanKey && value.trim()) {
                    attributes[cleanKey] =
                        value.trim();
                }
            }
        );

        return attributes;
    };

    /* -----------------------------------------------------------
       Product
    ----------------------------------------------------------- */

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

    /* -----------------------------------------------------------
       Mutations
    ----------------------------------------------------------- */

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

    /* -----------------------------------------------------------
       Categories
    ----------------------------------------------------------- */

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

    /* -----------------------------------------------------------
       Brands
    ----------------------------------------------------------- */

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

    const categories = categoriesResponse?.data ?? [];
    const brands = brandsResponse?.data ?? [];

    /* -----------------------------------------------------------
       Product form
    ----------------------------------------------------------- */

    useEffect(() => {
        if (!product) return;

        setForm({
            name: product.name ?? "",
            description: product.description ?? "",
            category_id: product.category_id ?? "",
            brand_id: product.brand_id ?? "",
            is_active: product.is_active ?? true,
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
                    description: form.description,
                    category_id: Number(form.category_id),
                    brand_id: Number(form.brand_id),
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
        if (!product) return;

        setForm({
            name: product.name ?? "",
            description: product.description ?? "",
            category_id: product.category_id ?? "",
            brand_id: product.brand_id ?? "",
            is_active: product.is_active ?? true,
        });

        setIsEditing(false);
    };

    /* -----------------------------------------------------------
       Variant form
    ----------------------------------------------------------- */

    const resetVariantForm = () => {
        variantMediaPreviews.forEach((preview) => {
            if (preview.url) {
                URL.revokeObjectURL(preview.url);
            }
        });

        setVariantForm({
            sku: "",
            price: "",
            discount_percentage: "",
            quantity: "",
            attributes: [],
            is_active: true,
        });

        setVariantMedia([]);
        setVariantMediaPreviews([]);
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

    /* -----------------------------------------------------------
       Variant media
    ----------------------------------------------------------- */

    const handleVariantMediaChange = (e) => {
        const files = Array.from(
            e.target.files || []
        );

        if (!files.length) return;

        const validFiles = files.filter((file) => {
            if (!file.type.startsWith("image/")) {
                alert(
                    `${file.name} is not an image.`
                );

                return false;
            }

            if (file.size > 10 * 1024 * 1024) {
                alert(
                    `${file.name} is larger than 10MB.`
                );

                return false;
            }

            return true;
        });

        setVariantMedia((prev) => [
            ...prev,
            ...validFiles,
        ]);

        const newPreviews = validFiles.map(
            (file) => ({
                file,
                url: URL.createObjectURL(file),
            })
        );

        setVariantMediaPreviews((prev) => [
            ...prev,
            ...newPreviews,
        ]);

        e.target.value = "";
    };

    const handleRemoveVariantMedia = (index) => {
        setVariantMedia((prev) =>
            prev.filter((_, i) => i !== index)
        );

        setVariantMediaPreviews((prev) => {
            const removed = prev[index];

            if (removed?.url) {
                URL.revokeObjectURL(
                    removed.url
                );
            }

            return prev.filter(
                (_, i) => i !== index
            );
        });
    };

    /* -----------------------------------------------------------
       Start adding variant
    ----------------------------------------------------------- */

    const handleStartAddVariant = () => {
        resetVariantForm();

        setEditingVariantId(null);
        setIsAddingVariant(true);
    };

    /* -----------------------------------------------------------
       Start editing variant
    ----------------------------------------------------------- */

    const handleStartEditVariant = (variant) => {
        setEditingVariantId(variant.id);
        setIsAddingVariant(false);

        setVariantForm({
            sku: variant.sku ?? "",

            price:
                variant.price ?? "",

            discount_percentage:
                variant.discount_percentage ?? "",

            quantity:
                variant.inventory?.quantity ?? 0,

            attributes: Object.entries(
                variant.attributes ?? {}
            ).map(([key, value]) => ({
                key,
                value: String(value),
            })),

            is_active:
                variant.is_active ?? true,
        });

        /*
         * Existing Cloudinary images are URLs,
         * not Files, so they remain displayed
         * in the variant table.
         */
        setVariantMedia([]);
        setVariantMediaPreviews([]);
    };

    /* -----------------------------------------------------------
       Cancel variant
    ----------------------------------------------------------- */

    const handleCancelVariant = () => {
        variantMediaPreviews.forEach(
            (preview) => {
                if (preview.url) {
                    URL.revokeObjectURL(
                        preview.url
                    );
                }
            }
        );

        resetVariantForm();

        setEditingVariantId(null);
        setIsAddingVariant(false);
    };



    /* -----------------------------------------------------------
       Validate variant
    ----------------------------------------------------------- */

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
            variantForm.discount_percentage === "" ||
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

        if (
            variantForm.quantity === "" ||
            Number(variantForm.quantity) < 0 ||
            !Number.isInteger(
                Number(variantForm.quantity)
            )
        ) {
            alert(
                "Stock quantity must be a whole number greater than or equal to 0."
            );

            return false;
        }

        return true;
    };

    /* -----------------------------------------------------------
       Create variant
    ----------------------------------------------------------- */

    const handleCreateVariant = async (
        attributes
    ) => {
        setIsUploadingVariant(true);

        try {
            const formData = new FormData();

            formData.append(
                "variant",
                JSON.stringify({
                    sku: variantForm.sku.trim(),

                    price: Number(
                        variantForm.price
                    ),

                    discount_percentage:
                        Number(
                            variantForm.discount_percentage
                        ),

                    quantity: Number(
                        variantForm.quantity
                    ),

                    attributes,

                    is_active:
                        variantForm.is_active,
                })
            );

            variantMedia.forEach((file) => {
                formData.append(
                    "media",
                    file
                );
            });

            const token =
                localStorage.getItem(
                    "access_token"
                ) ||
                localStorage.getItem(
                    "token"
                );

            const headers = {};

            if (token) {
                headers.Authorization =
                    `Bearer ${token}`;
            }

            const response = await fetch(
                `${apiUrl}/admin/products/${id}/variants`,
                {
                    method: "POST",
                    headers,
                    body: formData,
                }
            );

            if (!response.ok) {
                let errorMessage =
                    "Failed to create variant.";

                try {
                    const errorData =
                        await response.json();

                    errorMessage =
                        errorData.detail ||
                        errorMessage;
                } catch {
                    // Ignore invalid JSON
                }

                throw new Error(
                    errorMessage
                );
            }

            await response.json();

            handleCancelVariant();

            await refetch();
        } catch (err) {
            console.error(
                "Variant creation error:",
                err
            );

            alert(
                err?.message ||
                "Failed to create variant."
            );
        } finally {
            setIsUploadingVariant(false);
        }
    };

    /* -----------------------------------------------------------
       Save variant
    ----------------------------------------------------------- */

    const handleSaveVariant = () => {
        if (!validateVariant()) {
            return;
        }

        const attributes =
            buildAttributes();

        if (attributes === null) {
            return;
        }

        /* -----------------------------------------
           Edit existing variant
        ----------------------------------------- */

        if (editingVariantId) {
            updateVariant(
                {
                    resource:
                        `products/${id}/variants`,

                    id: editingVariantId,

                    values: {
                        sku: variantForm.sku.trim(),

                        price: Number(
                            variantForm.price
                        ),

                        discount_percentage:
                            Number(
                                variantForm.discount_percentage
                            ),

                        quantity: Number(
                            variantForm.quantity
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

            return;
        }

        /* -----------------------------------------
           Create new variant
        ----------------------------------------- */

        handleCreateVariant(attributes);
    };

    /* -----------------------------------------------------------
       Delete variant
    ----------------------------------------------------------- */

    const handleDeleteVariant = (
        variant
    ) => {
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
                    if (
                        editingVariantId ===
                        variant.id
                    ) {
                        handleCancelVariant();
                    }

                    refetch();
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

    /* -----------------------------------------------------------
       Calculations
    ----------------------------------------------------------- */

    const variants =
        product?.product_variants ?? [];

    const totalStock =
        variants.reduce(
            (total, variant) =>
                total +
                Number(
                    variant.inventory
                        ?.quantity || 0
                ),
            0
        );

    const totalSales =
        variants.reduce(
            (total, variant) =>
                total +
                (
                    variant.order_items
                        ?.reduce(
                            (
                                sum,
                                item
                            ) =>
                                sum +
                                Number(
                                    item.quantity ||
                                    0
                                ),
                            0
                        ) ?? 0
                ),
            0
        );

    const totalRevenue =
        variants.reduce(
            (total, variant) =>
                total +
                (
                    variant.order_items
                        ?.reduce(
                            (
                                sum,
                                item
                            ) =>
                                sum +
                                Number(
                                    item.quantity ||
                                    0
                                ) *
                                Number(
                                    item.price ||
                                    0
                                ),
                            0
                        ) ?? 0
                ),
            0
        );

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

    /* -----------------------------------------------------------
       Loading
    ----------------------------------------------------------- */

    if (isLoading) {
        return (
            <section className="
                h-screen
                bg-[#0F172A]
                text-admin-text
                flex
                items-center
                justify-center
            ">
                Loading product...
            </section>
        );
    }

    /* -----------------------------------------------------------
       Error
    ----------------------------------------------------------- */

    if (isError) {
        return (
            <section className="
                h-screen
                bg-[#0F172A]
                text-admin-text
                flex
                items-center
                justify-center
            ">
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
                            px-4 py-2
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

    /* -----------------------------------------------------------
       Not found
    ----------------------------------------------------------- */

    if (!product) {
        return (
            <section className="
                h-screen
                bg-[#0F172A]
                text-admin-text
                flex
                items-center
                justify-center
            ">
                Product not found.
            </section>
        );
    }

    /* -----------------------------------------------------------
       UI
    ----------------------------------------------------------- */

    return (
        <main className="
            h-screen
            max-w-full
            font-sans
            bg-[#0F172A]
            flex
            gap-4
        ">

            {/* Sidebar */}

            <header className="
                relative
                z-10
                h-screen
            ">
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


            {/* Content */}

            <section className="
                relative
                z-10
                h-screen
                flex-1
                text-admin-text
                overflow-y-auto
                p-4
            ">

                {/* Header */}

                <div className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    border-b
                    border-admin-border
                    pb-3
                    mb-6
                ">

                    <div className="
                        flex
                        items-center
                        gap-3
                    ">

                        <button
                            onClick={() =>
                                navigate(
                                    "/admin/products"
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

                            <h1 className="
                                text-3xl
                                font-semibold
                            ">
                                {isEditing
                                    ? "Edit Product"
                                    : "Product Details"}
                            </h1>

                            <p className="
                                text-sm
                                text-admin-muted
                                mt-1
                            ">
                                Product ID: #{product.id}
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


                {/* Product Information */}

                <div className="
                    border
                    border-admin-border
                    bg-admin-surface
                    rounded-2xl
                    p-6
                    mb-4
                ">

                    <div className="
                        flex
                        items-center
                        gap-2
                        mb-6
                    ">
                        <Package className="
                            h-5
                            w-5
                            text-admin-primary
                        " />

                        <h2 className="
                            text-lg
                            font-semibold
                        ">
                            Product Information
                        </h2>
                    </div>


                    {isEditing ? (

                        <div className="
                            grid
                            grid-cols-1
                            md:grid-cols-2
                            gap-5
                        ">

                            <div className="
                                md:col-span-2
                            ">
                                <label className="
                                    block
                                    text-sm
                                    text-admin-muted
                                    mb-2
                                ">
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
                                    className="
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
                                    "
                                />
                            </div>


                            <div className="
                                md:col-span-2
                            ">
                                <label className="
                                    block
                                    text-sm
                                    text-admin-muted
                                    mb-2
                                ">
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
                                    className="
                                        w-full
                                        px-4
                                        py-3
                                        rounded-lg
                                        bg-slate-900
                                        border
                                        border-admin-border
                                        text-admin-text
                                        outline-none
                                        resize-none
                                        focus:border-admin-primary
                                    "
                                />
                            </div>


                            <div>

                                <label className="
                                    block
                                    text-sm
                                    text-admin-muted
                                    mb-2
                                ">
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
                                    className="
                                        w-full
                                        px-4
                                        py-3
                                        rounded-lg
                                        bg-slate-900
                                        border
                                        border-admin-border
                                        text-admin-text
                                        outline-none
                                    "
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


                            <div>

                                <label className="
                                    block
                                    text-sm
                                    text-admin-muted
                                    mb-2
                                ">
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
                                    className="
                                        w-full
                                        px-4
                                        py-3
                                        rounded-lg
                                        bg-slate-900
                                        border
                                        border-admin-border
                                        text-admin-text
                                        outline-none
                                    "
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


                            <div className="
                                md:col-span-2
                            ">

                                <label className="
                                    flex
                                    items-center
                                    gap-3
                                    cursor-pointer
                                ">

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

                                    <span className="text-sm">
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

                                <p className="
                                    text-sm
                                    text-admin-muted
                                    mb-1
                                ">
                                    Name
                                </p>

                                <h2 className="
                                    text-2xl
                                    font-semibold
                                ">
                                    {product.name}
                                </h2>

                            </div>


                            <div>

                                <p className="
                                    text-sm
                                    text-admin-muted
                                    mb-2
                                ">
                                    Description
                                </p>

                                <p className="
                                    text-sm
                                    leading-7
                                    text-slate-300
                                ">
                                    {product.description ||
                                        "No description available."}
                                </p>

                            </div>


                            <div className="
                                grid
                                grid-cols-1
                                md:grid-cols-4
                                gap-4
                            ">

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


                {/* Statistics */}

                <div className="
                    grid
                    grid-cols-1
                    md:grid-cols-4
                    gap-4
                    mb-4
                ">

                    <StatCard
                        icon={
                            <Layers className="h-6 w-6" />
                        }
                        label="Variants"
                        value={variants.length}
                    />

                    <StatCard
                        icon={
                            <Package className="h-6 w-6" />
                        }
                        label="Stock"
                        value={`${totalStock} pcs`}
                    />

                    <StatCard
                        icon={
                            <ShoppingCart className="h-6 w-6" />
                        }
                        label="Sales"
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

                </div>


                {/* Variants */}

                <div className="
                    border
                    border-admin-border
                    bg-admin-surface
                    rounded-2xl
                    overflow-hidden
                ">

                    {/* Variant Header */}

                    <div className="
                        p-6
                        border-b
                        border-admin-border
                        flex
                        items-center
                        justify-between
                    ">

                        <div className="
                            flex
                            items-center
                            gap-2
                        ">

                            <Layers className="
                                h-5
                                w-5
                                text-admin-primary
                            " />

                            <h2 className="
                                text-lg
                                font-semibold
                            ">
                                Product Variants
                            </h2>

                        </div>


                        {!isAddingVariant &&
                            !editingVariantId && (

                                <button
                                    onClick={
                                        handleStartAddVariant
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
                                    <Plus className="h-4 w-4" />
                                    Add Variant
                                </button>

                            )}

                    </div>


                    {/* Variant Form */}

                    {(isAddingVariant ||
                        editingVariantId) && (

                            <div className="
                            p-6
                            border-b
                            border-admin-border
                            bg-slate-900/40
                        ">

                                <div className="
                                flex
                                items-center
                                justify-between
                                mb-5
                            ">

                                    <div>

                                        <h3 className="
                                        font-semibold
                                    ">
                                            {editingVariantId
                                                ? "Edit Variant"
                                                : "Add Variant"}
                                        </h3>

                                        {!editingVariantId && (
                                            <p className="
                                            text-xs
                                            text-admin-muted
                                            mt-1
                                        ">
                                                Add variant,
                                                inventory and
                                                product images.
                                            </p>
                                        )}

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
                                        <X className="h-4 w-4" />
                                    </button>

                                </div>


                                <div className="
                                grid
                                grid-cols-1
                                md:grid-cols-2
                                gap-5
                            ">

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
                                            className={inputClass}
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
                                            className={inputClass}
                                        />

                                    </FormField>


                                    {/* Discount */}

                                    <FormField label="Discount %">

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
                                            className={inputClass}
                                        />

                                    </FormField>


                                    {/* Inventory */}

                                    <FormField
                                        label="Stock Quantity"
                                    >

                                        <div className="
                                        relative
                                    ">

                                            <Boxes className="
                                            absolute
                                            left-3
                                            top-1/2
                                            -translate-y-1/2
                                            h-4
                                            w-4
                                            text-admin-muted
                                        " />

                                            <input
                                                type="number"
                                                min="0"
                                                step="1"
                                                name="quantity"
                                                value={
                                                    variantForm.quantity
                                                }
                                                onChange={
                                                    handleVariantChange
                                                }
                                                placeholder="0"
                                                className={`
                                                ${inputClass}
                                                pl-10
                                            `}
                                            />

                                        </div>

                                    </FormField>


                                    {/* Attributes */}

                                    <div className="md:col-span-2">
                                        <div className="
        flex
        items-center
        justify-between
        mb-3
    ">
                                            <div>
                                                <label className="
                block
                text-sm
                text-admin-muted
            ">
                                                    Variant Attributes
                                                </label>

                                                <p className="
                text-xs
                text-admin-muted
                mt-1
            ">
                                                    Add specifications such as RAM,
                                                    storage, color, or processor.
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={addAttribute}
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
                transition-colors
            "
                                            >
                                                <Plus className="h-4 w-4" />
                                                Add Attribute
                                            </button>
                                        </div>

                                        <div className="
        rounded-xl
        border
        border-admin-border
        bg-slate-900/50
        overflow-hidden
    ">

                                            {variantForm.attributes.length === 0 ? (
                                                <div className="
                px-4
                py-8
                text-center
                text-sm
                text-admin-muted
            ">
                                                    No attributes added yet.
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-slate-800">

                                                    {variantForm.attributes.map(
                                                        (attribute, index) => (
                                                            <div
                                                                key={index}
                                                                className="
                                flex
                                items-center
                                gap-3
                                p-3
                            "
                                                            >

                                                                <input
                                                                    type="text"
                                                                    value={attribute.key}
                                                                    onChange={(e) =>
                                                                        updateAttribute(
                                                                            index,
                                                                            "key",
                                                                            e.target.value
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
                                                                    value={attribute.value}
                                                                    onChange={(e) =>
                                                                        updateAttribute(
                                                                            index,
                                                                            "value",
                                                                            e.target.value
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
                                                                        removeAttribute(index)
                                                                    }
                                                                    className="
                                    p-2
                                    rounded-lg
                                    text-red-400
                                    hover:text-red-300
                                    hover:bg-red-500/10
                                "
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>

                                                            </div>
                                                        )
                                                    )}

                                                </div>
                                            )}

                                        </div>
                                    </div>


                                    {/* Images */}

                                    {!editingVariantId && (

                                        <div className="
                                        md:col-span-2
                                    ">

                                            <label className="
                                            block
                                            text-sm
                                            text-admin-muted
                                            mb-2
                                        ">
                                                Variant Images
                                            </label>

                                            <label className="
                                            group
                                            flex
                                            flex-col
                                            items-center
                                            justify-center
                                            w-full
                                            min-h-[180px]
                                            rounded-xl
                                            border-2
                                            border-dashed
                                            border-admin-border
                                            bg-slate-900/50
                                            hover:bg-slate-900
                                            hover:border-admin-primary
                                            cursor-pointer
                                            transition-all
                                        ">

                                                <ImagePlus className="
                                                h-10
                                                w-10
                                                text-admin-muted
                                                group-hover:text-admin-primary
                                                mb-3
                                            " />

                                                <span className="
                                                text-sm
                                                font-medium
                                            ">
                                                    Click to upload images
                                                </span>

                                                <span className="
                                                text-xs
                                                text-admin-muted
                                                mt-1
                                            ">
                                                    PNG, JPG, WEBP up to 10MB
                                                </span>

                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={
                                                        handleVariantMediaChange
                                                    }
                                                    className="hidden"
                                                />

                                            </label>


                                            {/* Previews */}

                                            {variantMediaPreviews.length >
                                                0 && (

                                                    <div className="
                                                grid
                                                grid-cols-2
                                                sm:grid-cols-3
                                                md:grid-cols-4
                                                lg:grid-cols-5
                                                gap-4
                                                mt-4
                                            ">

                                                        {variantMediaPreviews.map(
                                                            (
                                                                preview,
                                                                index
                                                            ) => (

                                                                <div
                                                                    key={`${preview.file.name}-${index}`}
                                                                    className="
                                                                group
                                                                relative
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
                                                                            preview.url
                                                                        }
                                                                        alt={
                                                                            preview.file.name
                                                                        }
                                                                        className="
                                                                    w-full
                                                                    h-full
                                                                    object-cover
                                                                "
                                                                    />

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleRemoveVariantMedia(
                                                                                index
                                                                            )
                                                                        }
                                                                        className="
                                                                    absolute
                                                                    top-2
                                                                    right-2
                                                                    p-1.5
                                                                    rounded-lg
                                                                    bg-black/70
                                                                    text-white
                                                                    opacity-0
                                                                    group-hover:opacity-100
                                                                    hover:bg-red-500
                                                                "
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </button>


                                                                    {index ===
                                                                        0 && (

                                                                            <span className="
                                                                    absolute
                                                                    bottom-2
                                                                    left-2
                                                                    px-2
                                                                    py-1
                                                                    rounded-md
                                                                    bg-black/70
                                                                    text-xs
                                                                    text-white
                                                                ">
                                                                                Main image
                                                                            </span>

                                                                        )}

                                                                </div>

                                                            )
                                                        )}

                                                    </div>

                                                )}

                                        </div>

                                    )}


                                    {/* Active */}

                                    <div className="
                                    md:col-span-2
                                ">

                                        <label className="
                                        flex
                                        items-center
                                        gap-3
                                        cursor-pointer
                                    ">

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

                                </div>


                                {/* Buttons */}

                                <div className="
                                flex
                                justify-end
                                gap-2
                                mt-6
                            ">

                                    <button
                                        onClick={
                                            handleCancelVariant
                                        }
                                        disabled={
                                            isUploadingVariant ||
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
                                        <X className="h-4 w-4" />
                                        Cancel
                                    </button>


                                    <button
                                        onClick={
                                            handleSaveVariant
                                        }
                                        disabled={
                                            isUploadingVariant ||
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
                                        disabled:cursor-not-allowed
                                    "
                                    >

                                        {isUploadingVariant ? (
                                            <>
                                                <Upload className="
                                                h-4
                                                w-4
                                                animate-pulse
                                            " />
                                                Uploading...
                                            </>
                                        ) : isUpdatingVariant ? (
                                            <>
                                                <Save className="h-4 w-4" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4" />
                                                Save Variant
                                            </>
                                        )}

                                    </button>

                                </div>

                            </div>

                        )}


                    {/* Variant table */}

                    {variants.length > 0 ? (

                        <div className="
                            overflow-x-auto
                        ">

                            <table className="
                                w-full
                                text-left
                            ">

                                <thead className="
                                    bg-slate-900
                                    border-b
                                    border-admin-border
                                ">

                                    <tr>

                                        <TableHeader>
                                            SKU
                                        </TableHeader>

                                        <TableHeader>
                                            Images
                                        </TableHeader>

                                        <TableHeader>
                                            Attributes
                                        </TableHeader>

                                        <TableHeader>
                                            Price
                                        </TableHeader>

                                        <TableHeader>
                                            Discount
                                        </TableHeader>

                                        <TableHeader>
                                            Stock
                                        </TableHeader>

                                        <TableHeader>
                                            Status
                                        </TableHeader>

                                        <TableHeader align="right">
                                            Actions
                                        </TableHeader>

                                    </tr>

                                </thead>


                                <tbody>

                                    {variants.map(
                                        (variant) => {

                                            const stock =
                                                Number(
                                                    variant
                                                        .inventory
                                                        ?.quantity ||
                                                    0
                                                );

                                            const active =
                                                variant.is_active &&
                                                stock > 0;

                                            const isCurrentVariant =
                                                editingVariantId ===
                                                variant.id;

                                            const media =
                                                variant.media ??
                                                [];

                                            return (

                                                <tr
                                                    key={
                                                        variant.id
                                                    }
                                                    className={`
                                                        border-b
                                                        border-slate-700/70
                                                        hover:bg-slate-800/50
                                                        transition-colors
                                                        ${isCurrentVariant
                                                            ? "bg-slate-800/70"
                                                            : ""
                                                        }
                                                    `}
                                                >

                                                    {/* SKU */}

                                                    <td className="
                                                        px-6
                                                        py-5
                                                        text-sm
                                                        font-medium
                                                    ">
                                                        {
                                                            variant.sku
                                                        }
                                                    </td>


                                                    {/* Images */}

                                                    <td className="
                                                        px-6
                                                        py-5
                                                    ">

                                                        {media.length >
                                                            0 ? (

                                                            <div className="
                                                                flex
                                                                items-center
                                                                -space-x-2
                                                            ">

                                                                {media
                                                                    .slice(
                                                                        0,
                                                                        3
                                                                    )
                                                                    .map(
                                                                        (
                                                                            image,
                                                                            index
                                                                        ) => (

                                                                            <img
                                                                                key={
                                                                                    image.id ??
                                                                                    index
                                                                                }
                                                                                src={
                                                                                    image.media_url
                                                                                }
                                                                                alt={`${variant.sku} ${index + 1}`}
                                                                                className="
                                                                                    h-10
                                                                                    w-10
                                                                                    rounded-lg
                                                                                    object-cover
                                                                                    border-2
                                                                                    border-slate-800
                                                                                    bg-slate-900
                                                                                "
                                                                            />

                                                                        )
                                                                    )}

                                                                {media.length >
                                                                    3 && (

                                                                        <span className="
                                                                        flex
                                                                        items-center
                                                                        justify-center
                                                                        h-10
                                                                        w-10
                                                                        rounded-lg
                                                                        bg-slate-700
                                                                        border-2
                                                                        border-slate-800
                                                                        text-xs
                                                                        font-medium
                                                                    ">
                                                                            +
                                                                            {media.length -
                                                                                3}
                                                                        </span>

                                                                    )}

                                                            </div>

                                                        ) : (

                                                            <div className="
                                                                flex
                                                                items-center
                                                                justify-center
                                                                h-10
                                                                w-10
                                                                rounded-lg
                                                                bg-slate-900
                                                                border
                                                                border-admin-border
                                                                text-admin-muted
                                                            ">
                                                                <ImagePlus className="h-4 w-4" />
                                                            </div>

                                                        )}

                                                    </td>


                                                    {/* Attributes */}

                                                    <td className="
                                                        px-6
                                                        py-5
                                                        text-sm
                                                        text-admin-muted
                                                    ">

                                                        {variant.attributes &&
                                                            Object.keys(
                                                                variant.attributes
                                                            ).length >
                                                            0
                                                            ? Object.entries(
                                                                variant.attributes
                                                            )
                                                                .map(
                                                                    ([
                                                                        key,
                                                                        value,
                                                                    ]) =>
                                                                        `${key}: ${value}`
                                                                )
                                                                .join(
                                                                    ", "
                                                                )
                                                            : "—"}

                                                    </td>


                                                    {/* Price */}

                                                    <td className="
                                                        px-6
                                                        py-5
                                                        text-sm
                                                    ">
                                                        $
                                                        {Number(
                                                            variant.price ||
                                                            0
                                                        ).toFixed(
                                                            2
                                                        )}
                                                    </td>


                                                    {/* Discount */}

                                                    <td className="
                                                        px-6
                                                        py-5
                                                        text-sm
                                                    ">
                                                        {Number(
                                                            variant.discount_percentage ||
                                                            0
                                                        )}
                                                        %
                                                    </td>


                                                    {/* Stock */}

                                                    <td className="
                                                        px-6
                                                        py-5
                                                        text-sm
                                                    ">

                                                        <div className="
                                                            flex
                                                            items-center
                                                            gap-2
                                                        ">

                                                            <Package className="
                                                                h-4
                                                                w-4
                                                                text-admin-muted
                                                            " />

                                                            <span>
                                                                {stock} pcs
                                                            </span>

                                                        </div>

                                                    </td>


                                                    {/* Status */}

                                                    <td className="
                                                        px-6
                                                        py-5
                                                    ">

                                                        {active ? (

                                                            <span className="
                                                                flex
                                                                items-center
                                                                gap-2
                                                                text-admin-active
                                                            ">

                                                                <span className="
                                                                    h-1.5
                                                                    w-1.5
                                                                    rounded-full
                                                                    bg-admin-active
                                                                " />

                                                                Active

                                                            </span>

                                                        ) : (

                                                            <span className="
                                                                flex
                                                                items-center
                                                                gap-2
                                                                text-admin-inactive
                                                            ">

                                                                <span className="
                                                                    h-1.5
                                                                    w-1.5
                                                                    rounded-full
                                                                    bg-minimal-red
                                                                " />

                                                                {stock === 0
                                                                    ? "Out of Stock"
                                                                    : "Inactive"}

                                                            </span>

                                                        )}

                                                    </td>


                                                    {/* Actions */}

                                                    <td className="
                                                        px-6
                                                        py-5
                                                    ">

                                                        <div className="
                                                            flex
                                                            justify-end
                                                            gap-2
                                                        ">

                                                            <button
                                                                onClick={() =>
                                                                    handleStartEditVariant(
                                                                        variant
                                                                    )
                                                                }
                                                                disabled={
                                                                    isDeletingVariant
                                                                }
                                                                className="
                                                                    p-2
                                                                    rounded-lg
                                                                    text-admin-muted
                                                                    hover:text-admin-text
                                                                    hover:bg-slate-700
                                                                    transition-colors
                                                                "
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </button>


                                                            <button
                                                                onClick={() =>
                                                                    handleDeleteVariant(
                                                                        variant
                                                                    )
                                                                }
                                                                disabled={
                                                                    isDeletingVariant
                                                                }
                                                                className="
                                                                    p-2
                                                                    rounded-lg
                                                                    text-red-400
                                                                    hover:text-red-300
                                                                    hover:bg-red-500/10
                                                                    transition-colors
                                                                "
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>

                                            );
                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>

                    ) : (

                        <div className="
                            px-6
                            py-12
                            text-center
                            text-admin-muted
                        ">

                            <Layers className="
                                h-10
                                w-10
                                mx-auto
                                mb-3
                                opacity-40
                            " />

                            <p className="mb-4">
                                No variants found.
                            </p>

                            {!isAddingVariant && (

                                <button
                                    onClick={
                                        handleStartAddVariant
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
                                    <Plus className="h-4 w-4" />
                                    Add Variant
                                </button>

                            )}

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
            <label className="
                block
                text-sm
                text-admin-muted
                mb-2
            ">
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
   Table Header
============================================================ */

function TableHeader({
    children,
    align = "left",
}) {
    return (
        <th
            className={`
                px-6
                py-4
                text-sm
                text-admin-muted
                ${align === "right"
                    ? "text-right"
                    : "text-left"
                }
            `}
        >
            {children}
        </th>
    );
}


/* ============================================================
   Info Card
============================================================ */

function InfoCard({
    icon,
    label,
    value,
}) {
    return (
        <div className="
            p-4
            rounded-xl
            bg-slate-900/60
            border
            border-admin-border
        ">

            <div className="
                flex
                items-center
                gap-2
                text-admin-muted
                mb-2
            ">
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
        <div className="
            border
            border-admin-border
            bg-admin-surface
            rounded-2xl
            p-5
        ">

            <div className="
                flex
                items-center
                gap-2
                text-admin-muted
                mb-3
            ">
                {icon}

                <span className="text-sm">
                    {label}
                </span>
            </div>

            <p className="
                text-2xl
                font-bold
            ">
                {value}
            </p>

        </div>
    );
}
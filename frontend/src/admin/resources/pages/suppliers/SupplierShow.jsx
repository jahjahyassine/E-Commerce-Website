import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

import {
    ArrowLeft,
    Building2,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Edit3,
    Save,
    X,
    Activity,
} from "lucide-react";

import { useQuery, useMutation } from "@tanstack/react-query";

import AdminSidebar from "../../components/AdminSidebar";
import DotField from "../../../../components/animation/DotField.jsx";
import { StatusModal } from "../../../../modals/StatusModal";


// ============================================================
// SUPPLIER SHOW
// ============================================================

export function SupplierShow() {
    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const { id } = useParams();
    const navigate = useNavigate();

    // ========================================================
    // STATE
    // ========================================================

    const [isEditing, setIsEditing] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    // ========================================================
    // FETCH SUPPLIER
    // ========================================================

    const {
        data: supplier,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ["supplier", id],
        queryFn: async () => {
            const response = await fetch(
                `${BASE_URL}/admin/suppliers/${id}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                        data.message ||
                        "Failed to fetch supplier"
                );
            }

            return data;
        },
        enabled: !!id,
    });

    // ========================================================
    // UPDATE SUPPLIER
    // ========================================================

    const {
        mutate: updateSupplier,
        isPending: isUpdating,
        isSuccess: isUpdateSuccess,
        isError: isUpdateError,
        error: updateError,
        reset: resetUpdateMutation,
    } = useMutation({
        mutationFn: async (supplierData) => {
            const response = await fetch(
                `${BASE_URL}/admin/suppliers/${id}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(supplierData),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                        data.message ||
                        "Failed to update supplier"
                );
            }

            return data;
        },

        onSuccess: async (data) => {
            setIsEditing(false);

            setName(data.name ?? "");
            setEmail(data.email ?? "");
            setPhone(data.phone ?? "");
            setAddress(data.address ?? "");

            await refetch();
        },
    });

    // ========================================================
    // DEACTIVATE SUPPLIER
    // ========================================================

    const {
        mutate: deactivateSupplier,
        isPending: isDeactivating,
        isSuccess: isDeactivateSuccess,
        isError: isDeactivateError,
        error: deactivateError,
        reset: resetDeactivateMutation,
    } = useMutation({
        mutationFn: async () => {
            const response = await fetch(
                `${BASE_URL}/admin/suppliers/${id}/deactivate`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                        data.message ||
                        "Failed to deactivate supplier"
                );
            }

            return data;
        },

        onSuccess: async () => {
            await refetch();
        },
    });

    // ========================================================
    // INITIALIZE EDIT FORM
    // ========================================================

    const handleStartEditing = () => {
        setName(supplier?.name ?? "");
        setEmail(supplier?.email ?? "");
        setPhone(supplier?.phone ?? "");
        setAddress(supplier?.address ?? "");

        setIsEditing(true);
    };

    // ========================================================
    // DISCARD EDITS
    // ========================================================

    const handleDiscard = () => {
        setName(supplier?.name ?? "");
        setEmail(supplier?.email ?? "");
        setPhone(supplier?.phone ?? "");
        setAddress(supplier?.address ?? "");

        setIsEditing(false);
    };

    // ========================================================
    // SAVE EDITS
    // ========================================================

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name.trim()) {
            return;
        }

        updateSupplier({
            name: name.trim(),
            email: email.trim() || null,
            phone: phone.trim() || null,
            address: address.trim() || null,
        });
    };

    // ========================================================
    // DEACTIVATE
    // ========================================================

    const handleDeactivate = () => {
        if (!supplier) {
            return;
        }

        if (!supplier.is_active) {
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to deactivate ${supplier.name}?`
        );

        if (!confirmed) {
            return;
        }

        deactivateSupplier();
    };

    // ========================================================
    // HELPERS
    // ========================================================

    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        return new Date(date).toLocaleString("en-GB", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };

    // ========================================================
    // LOADING
    // ========================================================

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
                Loading supplier...
            </section>
        );
    }

    // ========================================================
    // ERROR
    // ========================================================

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
                        onClick={() =>
                            navigate("/admin/suppliers")
                        }
                        className="
                            px-4
                            py-2
                            rounded-lg
                            bg-admin-primary
                            hover:bg-admin-primary-hover
                            transition-colors
                        "
                    >
                        Back to Suppliers
                    </button>
                </div>
            </section>
        );
    }

    // ========================================================
    // NOT FOUND
    // ========================================================

    if (!supplier) {
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
                Supplier not found.
            </section>
        );
    }

    // ========================================================
    // MAIN
    // ========================================================

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
            {/* ==================================================
                SIDEBAR
            ================================================== */}

            <header
                className="
                    relative
                    z-10
                    h-screen
                "
            >
                <AdminSidebar />
            </header>

            {/* ==================================================
                BACKGROUND
            ================================================== */}

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

            {/* ==================================================
                MAIN CONTENT
            ================================================== */}

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
                {/* ==================================================
                    MODALS
                ================================================== */}

                {isUpdating && (
                    <StatusModal
                        type="pending"
                        onClose={() => {}}
                    />
                )}

                {isDeactivating && (
                    <StatusModal
                        type="pending"
                        onClose={() => {}}
                    />
                )}

                {isUpdateSuccess && (
                    <StatusModal
                        type="success"
                        onClose={resetUpdateMutation}
                    />
                )}

                {isUpdateError && (
                    <StatusModal
                        type="error"
                        message={updateError?.message}
                        onClose={resetUpdateMutation}
                    />
                )}

                {isDeactivateSuccess && (
                    <StatusModal
                        type="success"
                        onClose={resetDeactivateMutation}
                    />
                )}

                {isDeactivateError && (
                    <StatusModal
                        type="error"
                        message={deactivateError?.message}
                        onClose={resetDeactivateMutation}
                    />
                )}

                {/* ==================================================
                    HEADER
                ================================================== */}

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
                            type="button"
                            onClick={() =>
                                navigate("/admin/suppliers")
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
                            <h1
                                className="
                                    text-3xl
                                    font-semibold
                                "
                            >
                                Supplier Details
                            </h1>

                            <p
                                className="
                                    text-sm
                                    text-admin-muted
                                    mt-1
                                "
                            >
                                Supplier #{supplier.id}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* DEACTIVATE */}

                        {supplier.is_active && !isEditing && (
                            <button
                                type="button"
                                onClick={handleDeactivate}
                                disabled={
                                    isDeactivating ||
                                    isUpdating
                                }
                                className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    px-4
                                    py-2
                                    rounded-lg
                                    border
                                    border-minimal-red/40
                                    bg-minimal-red/10
                                    text-minimal-red
                                    text-sm
                                    font-semibold
                                    hover:bg-minimal-red/20
                                    disabled:opacity-50
                                    disabled:cursor-not-allowed
                                    transition-colors
                                "
                            >
                                <Activity className="h-4 w-4" />

                                {isDeactivating
                                    ? "Deactivating..."
                                    : "Deactivate"}
                            </button>
                        )}

                        {/* EDIT */}

                        {!isEditing && (
                            <button
                                type="button"
                                onClick={handleStartEditing}
                                className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    px-4
                                    py-2
                                    rounded-lg
                                    bg-admin-primary
                                    hover:bg-admin-primary-hover
                                    text-admin-text
                                    text-sm
                                    font-semibold
                                    transition-colors
                                "
                            >
                                <Edit3 className="h-4 w-4" />
                                Edit Supplier
                            </button>
                        )}

                        {/* STATUS */}

                        <StatusBadge
                            value={
                                supplier.is_active
                                    ? "ACTIVE"
                                    : "INACTIVE"
                            }
                            active={supplier.is_active}
                        />
                    </div>
                </div>

                {/* ==================================================
                    EDIT FORM
                ================================================== */}

                {isEditing ? (
                    <form onSubmit={handleSubmit}>
                        {/* ACTIONS */}

                        <section
                            className="
                                flex
                                justify-end
                                gap-2
                                mb-4
                            "
                        >
                            <button
                                type="button"
                                onClick={handleDiscard}
                                disabled={isUpdating}
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    bg-white/10
                                    backdrop-blur-xl
                                    border
                                    border-admin-danger
                                    text-admin-danger
                                    hover:bg-admin-danger-hover
                                    hover:text-admin-text
                                    disabled:opacity-50
                                    disabled:cursor-not-allowed
                                    duration-300
                                    py-2
                                    px-4
                                    rounded-xl
                                    font-semibold
                                "
                            >
                                <X className="h-4 w-4" />
                                Discard Changes
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    isUpdating ||
                                    !name.trim()
                                }
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    bg-admin-primary
                                    hover:bg-admin-primary-hover
                                    disabled:opacity-50
                                    disabled:cursor-not-allowed
                                    text-admin-text
                                    duration-300
                                    py-2
                                    px-4
                                    rounded-xl
                                    font-bold
                                "
                            >
                                <Save className="h-4 w-4" />

                                {isUpdating
                                    ? "Saving..."
                                    : "Save Changes"}
                            </button>
                        </section>

                        {/* FORM GRID */}

                        <section
                            className="
                                grid
                                grid-cols-1
                                lg:grid-cols-3
                                gap-4
                            "
                        >
                            {/* GENERAL INFORMATION */}

                            <section
                                className="
                                    lg:col-span-2
                                    bg-admin-surface
                                    border
                                    border-admin-border
                                    p-6
                                    rounded-2xl
                                "
                            >
                                <SectionTitle
                                    icon={
                                        <Building2 className="h-5 w-5" />
                                    }
                                    title="General Information"
                                />

                                {/* NAME */}

                                <div className="flex flex-col gap-1 mb-5">
                                    <label
                                        htmlFor="supplierName"
                                        className="
                                            text-sm
                                            font-bold
                                            text-admin-muted
                                        "
                                    >
                                        Supplier Name
                                    </label>

                                    <input
                                        id="supplierName"
                                        type="text"
                                        value={name}
                                        onChange={(e) =>
                                            setName(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter supplier name"
                                        maxLength={100}
                                        required
                                        className="
                                            bg-admin-input
                                            border
                                            border-admin-input-border
                                            rounded-lg
                                            outline-none
                                            py-2
                                            px-3
                                            text-admin-text
                                            placeholder:text-admin-muted
                                            focus:border-admin-primary
                                            transition-colors
                                        "
                                    />
                                </div>

                                {/* ADDRESS */}

                                <div className="flex flex-col gap-1">
                                    <label
                                        htmlFor="address"
                                        className="
                                            text-sm
                                            font-bold
                                            text-admin-muted
                                        "
                                    >
                                        Address
                                    </label>

                                    <textarea
                                        id="address"
                                        value={address}
                                        onChange={(e) =>
                                            setAddress(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter supplier address"
                                        rows={5}
                                        className="
                                            bg-admin-input
                                            border
                                            border-admin-input-border
                                            rounded-lg
                                            outline-none
                                            resize-y
                                            py-2
                                            px-3
                                            text-admin-text
                                            placeholder:text-admin-muted
                                            focus:border-admin-primary
                                            transition-colors
                                        "
                                    />
                                </div>
                            </section>

                            {/* CONTACT INFORMATION */}

                            <section
                                className="
                                    bg-admin-surface
                                    border
                                    border-admin-border
                                    p-6
                                    rounded-2xl
                                "
                            >
                                <SectionTitle
                                    icon={
                                        <Phone className="h-5 w-5" />
                                    }
                                    title="Contact Information"
                                />

                                {/* EMAIL */}

                                <div className="flex flex-col gap-1 mb-5">
                                    <label
                                        htmlFor="email"
                                        className="
                                            flex
                                            items-center
                                            gap-2
                                            text-sm
                                            font-bold
                                            text-admin-muted
                                        "
                                    >
                                        <Mail className="h-4 w-4" />
                                        Email
                                    </label>

                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(
                                                e.target.value
                                            )
                                        }
                                        placeholder="supplier@example.com"
                                        maxLength={255}
                                        className="
                                            bg-admin-input
                                            border
                                            border-admin-input-border
                                            rounded-lg
                                            outline-none
                                            py-2
                                            px-3
                                            text-admin-text
                                            placeholder:text-admin-muted
                                            focus:border-admin-primary
                                            transition-colors
                                        "
                                    />
                                </div>

                                {/* PHONE */}

                                <div className="flex flex-col gap-1">
                                    <label
                                        htmlFor="phone"
                                        className="
                                            flex
                                            items-center
                                            gap-2
                                            text-sm
                                            font-bold
                                            text-admin-muted
                                        "
                                    >
                                        <Phone className="h-4 w-4" />
                                        Phone
                                    </label>

                                    <input
                                        id="phone"
                                        type="tel"
                                        value={phone}
                                        onChange={(e) =>
                                            setPhone(
                                                e.target.value
                                            )
                                        }
                                        placeholder="0612345678"
                                        maxLength={20}
                                        className="
                                            bg-admin-input
                                            border
                                            border-admin-input-border
                                            rounded-lg
                                            outline-none
                                            py-2
                                            px-3
                                            text-admin-text
                                            placeholder:text-admin-muted
                                            focus:border-admin-primary
                                            transition-colors
                                        "
                                    />
                                </div>
                            </section>
                        </section>
                    </form>
                ) : (
                    <>
                        {/* ==================================================
                            SUPPLIER HERO
                        ================================================== */}

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
                                    flex-col
                                    md:flex-row
                                    md:items-center
                                    justify-between
                                    gap-6
                                "
                            >
                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-5
                                    "
                                >
                                    <div
                                        className="
                                            h-20
                                            w-20
                                            rounded-2xl
                                            bg-slate-900
                                            border
                                            border-admin-border
                                            flex
                                            items-center
                                            justify-center
                                            shrink-0
                                        "
                                    >
                                        <Building2
                                            className="
                                                h-9
                                                w-9
                                                text-admin-primary
                                            "
                                        />
                                    </div>

                                    <div>
                                        <h2
                                            className="
                                                text-2xl
                                                font-semibold
                                            "
                                        >
                                            {supplier.name}
                                        </h2>

                                        <p
                                            className="
                                                text-sm
                                                text-admin-muted
                                                mt-1
                                            "
                                        >
                                            Supplier #{supplier.id}
                                        </p>

                                        <div
                                            className="
                                                flex
                                                flex-wrap
                                                items-center
                                                gap-2
                                                mt-3
                                            "
                                        >
                                            <StatusBadge
                                                value={
                                                    supplier.is_active
                                                        ? "ACTIVE"
                                                        : "INACTIVE"
                                                }
                                                active={
                                                    supplier.is_active
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className="
                                        grid
                                        grid-cols-1
                                        sm:grid-cols-2
                                        gap-x-8
                                        gap-y-3
                                    "
                                >
                                    <QuickInfo
                                        icon={
                                            <Mail className="h-4 w-4" />
                                        }
                                        label="Email"
                                        value={
                                            supplier.email || "—"
                                        }
                                    />

                                    <QuickInfo
                                        icon={
                                            <Phone className="h-4 w-4" />
                                        }
                                        label="Phone"
                                        value={
                                            supplier.phone || "—"
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ==================================================
                            INFORMATION
                        ================================================== */}

                        <div
                            className="
                                grid
                                grid-cols-1
                                lg:grid-cols-2
                                gap-4
                                mb-4
                            "
                        >
                            {/* CONTACT */}

                            <div
                                className="
                                    border
                                    border-admin-border
                                    bg-admin-surface
                                    rounded-2xl
                                    p-6
                                "
                            >
                                <SectionTitle
                                    icon={
                                        <Building2 className="h-5 w-5" />
                                    }
                                    title="Supplier Information"
                                />

                                <div className="space-y-5">
                                    <InfoRow
                                        icon={
                                            <Building2 className="h-4 w-4" />
                                        }
                                        label="Supplier Name"
                                        value={
                                            supplier.name || "—"
                                        }
                                    />

                                    <InfoRow
                                        icon={
                                            <Mail className="h-4 w-4" />
                                        }
                                        label="Email"
                                        value={
                                            supplier.email || "—"
                                        }
                                    />

                                    <InfoRow
                                        icon={
                                            <Phone className="h-4 w-4" />
                                        }
                                        label="Phone"
                                        value={
                                            supplier.phone || "—"
                                        }
                                    />
                                </div>
                            </div>

                            {/* ADDRESS */}

                            <div
                                className="
                                    border
                                    border-admin-border
                                    bg-admin-surface
                                    rounded-2xl
                                    p-6
                                "
                            >
                                <SectionTitle
                                    icon={
                                        <MapPin className="h-5 w-5" />
                                    }
                                    title="Address"
                                />

                                <div className="space-y-5">
                                    <AddressBlock
                                        label="Address"
                                        value={
                                            supplier.address ||
                                            "—"
                                        }
                                    />

                                    <AddressBlock
                                        label="Supplier Status"
                                        value={
                                            supplier.is_active
                                                ? "Active"
                                                : "Inactive"
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ==================================================
                            ACCOUNT INFORMATION
                        ================================================== */}

                        <div
                            className="
                                border
                                border-admin-border
                                bg-admin-surface
                                rounded-2xl
                                p-6
                                mb-6
                            "
                        >
                            <SectionTitle
                                icon={
                                    <Calendar className="h-5 w-5" />
                                }
                                title="Supplier Information"
                            />

                            <div
                                className="
                                    grid
                                    grid-cols-1
                                    md:grid-cols-3
                                    gap-4
                                "
                            >
                                <InfoCard
                                    icon={
                                        <Building2 className="h-5 w-5" />
                                    }
                                    label="Supplier ID"
                                    value={`#${supplier.id}`}
                                />

                                <InfoCard
                                    icon={
                                        <Activity className="h-5 w-5" />
                                    }
                                    label="Account Status"
                                    value={
                                        supplier.is_active
                                            ? "Active"
                                            : "Inactive"
                                    }
                                />

                                <InfoCard
                                    icon={
                                        <Calendar className="h-5 w-5" />
                                    }
                                    label="Created At"
                                    value={formatDate(
                                        supplier.created_at
                                    )}
                                />
                            </div>
                        </div>
                    </>
                )}
            </section>
        </main>
    );
}


// ============================================================
// SECTION TITLE
// ============================================================

function SectionTitle({
    icon,
    title,
    noMargin = false,
}) {
    return (
        <div
            className={`
                flex
                items-center
                gap-2
                ${noMargin ? "" : "mb-6"}
            `}
        >
            <span className="text-admin-primary">
                {icon}
            </span>

            <h2
                className="
                    text-lg
                    font-semibold
                "
            >
                {title}
            </h2>
        </div>
    );
}


// ============================================================
// INFO ROW
// ============================================================

function InfoRow({
    icon,
    label,
    value,
}) {
    return (
        <div
            className="
                flex
                items-start
                gap-3
            "
        >
            <div
                className="
                    mt-0.5
                    text-admin-muted
                "
            >
                {icon}
            </div>

            <div>
                <p
                    className="
                        text-xs
                        text-admin-muted
                        mb-1
                    "
                >
                    {label}
                </p>

                <p
                    className="
                        text-sm
                        font-medium
                    "
                >
                    {value}
                </p>
            </div>
        </div>
    );
}


// ============================================================
// QUICK INFO
// ============================================================

function QuickInfo({
    icon,
    label,
    value,
}) {
    return (
        <div className="min-w-0">
            <div
                className="
                    flex
                    items-center
                    gap-2
                    text-admin-muted
                    mb-1
                "
            >
                {icon}

                <span className="text-xs">
                    {label}
                </span>
            </div>

            <p
                className="
                    text-sm
                    font-medium
                    truncate
                    max-w-[220px]
                "
            >
                {value}
            </p>
        </div>
    );
}


// ============================================================
// ADDRESS BLOCK
// ============================================================

function AddressBlock({
    label,
    value,
}) {
    return (
        <div>
            <p
                className="
                    text-xs
                    text-admin-muted
                    mb-1
                "
            >
                {label}
            </p>

            <p
                className="
                    text-sm
                    font-medium
                    leading-relaxed
                "
            >
                {value}
            </p>
        </div>
    );
}


// ============================================================
// INFO CARD
// ============================================================

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


// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({
    value,
    active,
}) {
    const style =
        active
            ? "text-success bg-success/10 border-success/40"
            : "text-minimal-red bg-minimal-red/10 border-minimal-red/40";

    return (
        <span
            className={`
                inline-flex
                items-center
                px-3
                py-1.5
                rounded-lg
                border
                text-xs
                font-semibold
                whitespace-nowrap
                ${style}
            `}
        >
            {value || "—"}
        </span>
    );
}
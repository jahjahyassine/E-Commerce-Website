import AdminSidebar from "../../components/AdminSidebar";
import DotField from "../../../../components/animation/DotField.jsx";

import { useState } from "react";
import {
    Building2,
    Mail,
    Phone,
    MapPin,
    Save,
    X,
} from "lucide-react";

import { useMutation } from "@tanstack/react-query";
import { StatusModal } from "../../../../modals/StatusModal";

export function SupplierCreate() {
    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    const createSupplierFunction = async (supplierData) => {
        const response = await fetch(
            `${BASE_URL}/admin/suppliers`,
            {
                method: "POST",
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
                "Failed to create supplier"
            );
        }

        return data;
    };

    const {
        mutate: createSupplier,
        isPending,
        isError,
        isSuccess,
        error,
        reset,
    } = useMutation({
        mutationFn: createSupplierFunction,

        onSuccess: (data) => {
            console.log("Supplier created:", data);
        },

        onError: (error) => {
            console.error("Failed to create supplier:", error);
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name.trim()) {
            return;
        }

        createSupplier({
            name: name.trim(),
            email: email.trim() || null,
            phone: phone.trim() || null,
            address: address.trim() || null,
        });
    };

    const handleDiscard = () => {
        setName("");
        setEmail("");
        setPhone("");
        setAddress("");
    };

    return (
        <main className="h-screen max-w-full font-sans bg-[#0F172A] flex gap-4">

            {/* ==================================================
                SIDEBAR
            ================================================== */}

            <header className="relative z-10 h-screen">
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

                {isPending && (
                    <StatusModal
                        type="pending"
                        onClose={() => {}}
                    />
                )}

                {isSuccess && (
                    <StatusModal
                        type="success"
                        onClose={reset}
                    />
                )}

                {isError && (
                    <StatusModal
                        type="error"
                        message={error?.message}
                        onClose={reset}
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
                        border-b
                        border-admin-border
                        pb-3
                        mb-6
                    "
                >
                    <div>
                        <h1 className="text-3xl font-bold">
                            Create Supplier
                        </h1>

                        <p className="text-sm text-admin-muted mt-1">
                            Add a new supplier to your inventory system.
                        </p>
                    </div>
                </div>

                {/* ==================================================
                    FORM
                ================================================== */}

                <form onSubmit={handleSubmit}>

                    {/* ==================================================
                        ACTIONS
                    ================================================== */}

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
                            disabled={isPending || !name.trim()}
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

                            Save Supplier
                        </button>

                    </section>

                    {/* ==================================================
                        FORM GRID
                    ================================================== */}

                    <section className="grid grid-cols-3 gap-4">

                        {/* ==================================================
                            GENERAL INFORMATION
                        ================================================== */}

                        <section
                            className="
                                col-span-2
                                bg-admin-surface
                                p-5
                                rounded-xl
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    mb-5
                                "
                            >
                                <Building2 className="h-5 w-5 text-admin-primary" />

                                <h2 className="text-lg font-bold">
                                    General Information
                                </h2>
                            </div>

                            {/* Supplier Name */}

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
                                        setName(e.target.value)
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

                            {/* Address */}

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
                                        setAddress(e.target.value)
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

                        {/* ==================================================
                            CONTACT INFORMATION
                        ================================================== */}

                        <section
                            className="
                                col-span-1
                                bg-admin-surface
                                p-5
                                rounded-xl
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    mb-5
                                "
                            >
                                <Phone className="h-5 w-5 text-admin-primary" />

                                <h2 className="text-lg font-bold">
                                    Contact Information
                                </h2>
                            </div>

                            {/* Email */}

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
                                        setEmail(e.target.value)
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

                            {/* Phone */}

                            <div className="flex flex-col gap-1 mb-5">

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
                                        setPhone(e.target.value)
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

                            {/* Address hint */}

                            <div
                                className="
                                    flex
                                    gap-3
                                    p-3
                                    rounded-lg
                                    bg-slate-900/60
                                    border
                                    border-admin-border
                                "
                            >
                                <MapPin
                                    className="
                                        h-4
                                        w-4
                                        text-admin-muted
                                        mt-0.5
                                        shrink-0
                                    "
                                />

                                <p
                                    className="
                                        text-xs
                                        text-admin-muted
                                        leading-relaxed
                                    "
                                >
                                    Supplier contact information is
                                    optional. You can add or update it
                                    later.
                                </p>
                            </div>

                        </section>

                        {/* ==================================================
                            SUPPLIER STATUS
                        ================================================== */}

                        <section
                            className="
                                col-span-3
                                bg-admin-surface
                                p-5
                                rounded-xl
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                "
                            >

                                <div>

                                    <h2 className="text-lg font-bold">
                                        Supplier Status
                                    </h2>

                                    <p
                                        className="
                                            text-sm
                                            text-admin-muted
                                            mt-1
                                        "
                                    >
                                        New suppliers are automatically
                                        created as active.
                                    </p>

                                </div>

                                <span
                                    className="
                                        inline-flex
                                        items-center
                                        px-3
                                        py-1.5
                                        rounded-lg
                                        border
                                        text-xs
                                        font-semibold
                                        text-success
                                        bg-success/10
                                        border-success/40
                                    "
                                >
                                    ACTIVE
                                </span>

                            </div>

                        </section>

                    </section>

                </form>

            </section>

        </main>
    );
}
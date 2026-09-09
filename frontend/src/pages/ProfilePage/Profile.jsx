import { useMutation, useQuery } from "@tanstack/react-query";

import Navbar from "../../components/Navbar";
import ProfileSidebar from "../../components/ProfileSidebar";
import CursorGrid from "../../components/animation/CursorGrid";
import getCurrentUser from "../../hooks/CurrentUser";

import { useNavigate } from "react-router-dom";

import { Upload, Edit3Icon } from "lucide-react";

import { useState, useEffect } from "react";

import ProfilePictureModal from "../../modals/ProfilePictureModal";

import { queryClient } from "../../lib/queryClient";

function Profile() {
    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const token = localStorage.getItem("access_token");

    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    const [editingField, setEditingField] = useState("");

    const [showPictureModal, setShowPictureModal] = useState(false);

    /* ---------------- AUTH CHECK ---------------- */

    useEffect(() => {
        const token = localStorage.getItem("access_token");

        if (!token) {
            navigate("/login");
        }
    }, [navigate]);

    /* ---------------- GET CURRENT USER ---------------- */

    const {
        data: currentUser,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["user"],
        queryFn: getCurrentUser,
        enabled: !!localStorage.getItem("access_token"),
    });

    useEffect(() => {
        if (isError) {
            navigate("/login");
        }
    }, [isError, navigate]);

    /* ---------------- SET FORM DATA ---------------- */

    useEffect(() => {
        if (currentUser) {
            setUsername(currentUser.username || "");
            setFullName(currentUser.full_name || "");
            setEmail(currentUser.email || "");
            setPhone(currentUser.phone || "");
            setAddress(currentUser.address || "");
        }
    }, [currentUser]);

    /* ---------------- UPDATE USER ---------------- */

    const updateUserInfosFunction = async (new_infos) => {
        const response = await fetch(`${BASE_URL}/profile`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(new_infos),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Failed to update Infos"
            );
        }

        return data;
    };

    const {
        mutate: updateUserInfos,
        error: errorPatch,
        isPending,
    } = useMutation({
        mutationFn: updateUserInfosFunction,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["user"],
            });

            setEditingField("");
        },
    });

    /* ---------------- FORM SUBMIT ---------------- */

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!currentUser) return;

        const changedFields = {};

        if (username !== currentUser.username) {
            changedFields.username = username;
        }

        if (fullName !== currentUser.full_name) {
            changedFields.full_name = fullName;
        }

        if (email !== currentUser.email) {
            changedFields.email = email;
        }

        if (phone !== currentUser.phone) {
            changedFields.phone = phone;
        }

        if (address !== currentUser.address) {
            changedFields.address = address;
        }

        if (Object.keys(changedFields).length === 0) {
            return;
        }

        updateUserInfos(changedFields);
    };

    const handleCancel = () => {
        if (!currentUser) return;

        setUsername(currentUser.username || "");
        setFullName(currentUser.full_name || "");
        setEmail(currentUser.email || "");
        setPhone(currentUser.phone || "");
        setAddress(currentUser.address || "");

        setEditingField("");
    };

    if (isLoading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <p className="text-base text-muted">
                    Loading...
                </p>
            </main>
        );
    }

    /* ---------------- UI ---------------- */

    return (
        <main className="relative min-h-screen">

            {/* NAVBAR */}

            <header className="fixed top-0 left-0 w-full z-50">
                <Navbar />
            </header>

            {/* BACKGROUND */}
<div
    className="
        fixed
        inset-0
        z-0
        w-screen
        h-screen
        pointer-events-none
        overflow-hidden
    "
    aria-hidden="true"
>
    <div className="relative w-full h-full">
        <CursorGrid
            cellSize={70}
            color="#567C8D"
            radius={140}
            falloff="smooth"
            holdTime={400}
            fadeDuration={800}
            lineWidth={1.2}
            maxOpacity={1}
            fillOpacity={0}
            gridOpacity={0}
            cellRadius={0}
            clickPulse
            pulseSpeed={600}
        />
    </div>
</div>

            {/* MAIN CONTENT */}

            <section className="relative z-10 h-screen flex">

                {/* SIDEBAR */}

                <ProfileSidebar user={currentUser} />

                {/* ACCOUNT CONTENT */}

                <section
                    className="
                        flex-1
                        flex
                        flex-col
                        gap-10
                        items-center
                        pt-20
                        p-8
                        overflow-y-auto
                    "
                >

                    {/* TITLE */}

                    <h2
                        className="
                            text-3xl
                            self-start
                            w-full
                            font-semibold
                            border-b
                            border-border
                            pb-2
                        "
                    >
                        Account
                    </h2>

                    {/* PROFILE PICTURE */}

                    <div className="mt-6 flex gap-5">

                        <div className="h-25 w-25 rounded-full overflow-hidden border border-border-soft">

                            <img
                                src={currentUser?.profile_pic_path}
                                alt="Profile"
                                className="h-full w-full object-cover"
                            />

                        </div>

                        <div className="flex flex-col justify-around">

                            <p className="text-lg font-semibold tracking-wide">
                                Profile Picture
                            </p>

                            <div className="flex gap-2">

                                {/* UPLOAD */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPictureModal(true)
                                    }
                                    className="
                                        flex
                                        items-center
                                        bg-primary
                                        px-4
                                        py-2
                                        rounded-xl
                                        gap-2
                                        hover:bg-primary-hover
                                        duration-300
                                        ease-in-out
                                        cursor-pointer
                                        text-base
                                    "
                                >
                                    <Upload
                                        className="w-5 h-5 text-inverse"
                                    />

                                    <p className="text-inverse">
                                        Upload Image
                                    </p>
                                </button>

                                <ProfilePictureModal
                                    isOpen={showPictureModal}
                                    onClose={() =>
                                        setShowPictureModal(false)
                                    }
                                    currentImage={
                                        currentUser?.profile_pic_path
                                    }
                                />

                                {/* REMOVE */}

                                <button
                                    type="button"
                                    className="
                                        flex
                                        items-center
                                        bg-card
                                        text-foreground
                                        px-4
                                        py-2
                                        rounded-xl
                                        gap-2
                                        border
                                        border-border-soft
                                        hover:bg-chip
                                        duration-300
                                        ease-in-out
                                        cursor-pointer
                                        text-base
                                    "
                                >
                                    Remove
                                </button>

                            </div>

                        </div>

                    </div>

                    {/* FORM */}

                    <form
                        onSubmit={handleSubmit}
                        className="
                            w-[40vw]
                            flex
                            flex-col
                            gap-5
                        "
                    >

                        {/* USERNAME */}

                        <div className="flex flex-col gap-2">

                            <label
                                htmlFor="username"
                                className="
                                    text-sm
                                    font-medium
                                    text-muted
                                "
                            >
                                Username
                            </label>

                            <div className="relative bg-chip rounded-xl px-4 py-3">

                                <input
                                    id="username"
                                    type="text"
                                    disabled={
                                        editingField !== "username"
                                    }
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    className="
                                        w-full
                                        pr-8
                                        text-lg
                                        font-medium
                                        bg-transparent
                                        outline-none
                                    "
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setEditingField("username")
                                    }
                                >
                                    <Edit3Icon
                                        className="
                                            absolute
                                            right-4
                                            top-1/2
                                            -translate-y-1/2
                                            w-5
                                            h-5
                                            text-muted
                                            cursor-pointer
                                        "
                                    />
                                </button>

                            </div>

                        </div>

                        {/* FULL NAME */}

                        <div className="flex flex-col gap-2">

                            <label
                                htmlFor="fullName"
                                className="
                                    text-sm
                                    font-medium
                                    text-muted
                                "
                            >
                                Full Name
                            </label>

                            <div className="relative bg-chip rounded-xl px-4 py-3">

                                <input
                                    id="fullName"
                                    type="text"
                                    disabled={
                                        editingField !== "fullname"
                                    }
                                    value={fullName}
                                    onChange={(e) =>
                                        setFullName(e.target.value)
                                    }
                                    className="
                                        w-full
                                        pr-8
                                        text-lg
                                        font-medium
                                        bg-transparent
                                        outline-none
                                    "
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setEditingField("fullname")
                                    }
                                >
                                    <Edit3Icon
                                        className="
                                            absolute
                                            right-4
                                            top-1/2
                                            -translate-y-1/2
                                            w-5
                                            h-5
                                            text-muted
                                            cursor-pointer
                                        "
                                    />
                                </button>

                            </div>

                        </div>

                        {/* EMAIL */}

                        <div className="flex flex-col gap-2">

                            <label
                                htmlFor="email"
                                className="
                                    text-sm
                                    font-medium
                                    text-muted
                                "
                            >
                                Email
                            </label>

                            <div className="relative bg-chip rounded-xl px-4 py-3">

                                <input
                                    id="email"
                                    type="text"
                                    disabled={
                                        editingField !== "email"
                                    }
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    className="
                                        w-full
                                        pr-8
                                        text-lg
                                        font-medium
                                        bg-transparent
                                        outline-none
                                    "
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setEditingField("email")
                                    }
                                >
                                    <Edit3Icon
                                        className="
                                            absolute
                                            right-4
                                            top-1/2
                                            -translate-y-1/2
                                            w-5
                                            h-5
                                            text-muted
                                            cursor-pointer
                                        "
                                    />
                                </button>

                            </div>

                        </div>

                        {/* PHONE */}

                        <div className="flex flex-col gap-2">

                            <label
                                htmlFor="phone"
                                className="
                                    text-sm
                                    font-medium
                                    text-muted
                                "
                            >
                                Phone
                            </label>

                            <div className="relative bg-chip rounded-xl px-4 py-3">

                                <input
                                    id="phone"
                                    type="text"
                                    disabled={
                                        editingField !== "phone"
                                    }
                                    value={phone}
                                    onChange={(e) =>
                                        setPhone(e.target.value)
                                    }
                                    className="
                                        w-full
                                        pr-8
                                        text-lg
                                        font-medium
                                        bg-transparent
                                        outline-none
                                    "
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setEditingField("phone")
                                    }
                                >
                                    <Edit3Icon
                                        className="
                                            absolute
                                            right-4
                                            top-1/2
                                            -translate-y-1/2
                                            w-5
                                            h-5
                                            text-muted
                                            cursor-pointer
                                        "
                                    />
                                </button>

                            </div>

                        </div>

                        {/* ADDRESS */}

                        <div className="lg:col-span-2 flex flex-col gap-2">

                            <label
                                htmlFor="address"
                                className="
                                    text-sm
                                    font-medium
                                    text-muted
                                "
                            >
                                Main Address
                            </label>

                            <div className="relative bg-chip rounded-xl px-4 py-3">

                                <input
                                    id="address"
                                    type="text"
                                    disabled={
                                        editingField !== "address"
                                    }
                                    value={address}
                                    onChange={(e) =>
                                        setAddress(e.target.value)
                                    }
                                    className="
                                        w-full
                                        pr-8
                                        text-lg
                                        font-medium
                                        bg-transparent
                                        outline-none
                                    "
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setEditingField("address")
                                    }
                                >
                                    <Edit3Icon
                                        className="
                                            absolute
                                            right-4
                                            top-1/2
                                            -translate-y-1/2
                                            w-5
                                            h-5
                                            text-muted
                                            cursor-pointer
                                        "
                                    />
                                </button>

                            </div>

                        </div>

                        {/* ERROR */}

                        {errorPatch && (
                            <p
                                className="
                                    lg:col-span-3
                                    md:col-span-2
                                    text-base
                                    font-medium
                                    text-danger
                                "
                            >
                                {errorPatch.message}
                            </p>
                        )}

                        {/* ACTIONS */}

                        <div
                            className="
                                lg:col-span-3
                                md:col-span-2
                                flex
                                justify-end
                                gap-3
                                mt-4
                            "
                        >

                            {/* CANCEL */}

                            <button
                                type="button"
                                className="
                                    px-5
                                    py-2
                                    rounded-xl
                                    bg-card
                                    text-muted
                                    border
                                    border-border-soft
                                    hover:bg-chip
                                    duration-300
                                    ease-in-out
                                    cursor-pointer
                                    text-base
                                    font-semibold
                                "
                                onClick={handleCancel}
                            >
                                Cancel
                            </button>

                            {/* SAVE */}

                            <button
                                type="submit"
                                disabled={isPending}
                                className="
                                    px-8
                                    py-2
                                    rounded-xl
                                    bg-primary
                                    hover:bg-primary-hover
                                    duration-300
                                    ease-in-out
                                    cursor-pointer
                                    text-inverse
                                    text-base
                                    font-semibold
                                    disabled:opacity-50
                                    disabled:cursor-not-allowed
                                "
                            >
                                {isPending ? "Saving..." : "Save"}
                            </button>

                        </div>

                    </form>

                </section>

            </section>

        </main>
    );
}

export default Profile;
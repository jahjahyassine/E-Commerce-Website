import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminSidebar from "../../components/AdminSidebar";
import DotField from "../../../../components/animation/DotField";
import getCurrentUser from "../../../../hooks/CurrentUser";
import { useNavigate } from "react-router-dom";
import { Upload, Edit3Icon } from "lucide-react";
import { useState, useEffect } from "react";
import ProfilePictureModal from "../../../../modals/ProfilePictureModal";

function AdminProfile() {

    const BASE_URL = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem("access_token");
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useEffect(() => {
        const token = localStorage.getItem("access_token");

        if (!token) {
            navigate("/login");
        }
    }, [navigate]);


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


    const [username, setUsername] = useState("");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [editingField, setEditingField] = useState("");

    const [showPictureModal, setShowPictureModal] = useState(false);


    useEffect(() => {
        if (currentUser) {
            setUsername(currentUser.username || "");
            setFullName(currentUser.full_name || "");
            setEmail(currentUser.email || "");
            setPhone(currentUser.phone || "");
            setAddress(currentUser.address || "");
        }
    }, [currentUser]);


    const updateUserInfosFunction = async (new_infos) => {

        const response = await fetch(
            `${BASE_URL}/profile`,
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(new_infos),
            }
        );

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


    const handleSubmit = (e) => {
        e.preventDefault();

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


    if (isLoading) {
        return (
            <main className="h-screen bg-[#0F172A] text-admin-text flex items-center justify-center">
                Loading...
            </main>
        );
    }


    return (
        <main className="relative h-screen max-w-full font-sans bg-[#0F172A] flex">

            {/* Background */}
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


            {/* Sidebar */}
            <header className="relative z-10 h-screen">
                <AdminSidebar user={currentUser} />
            </header>


            {/* Content */}
            <section className="relative z-10 flex-1 h-screen overflow-y-auto text-admin-text p-8">

                <h2 className="text-3xl font-bold border-b border-admin-border pb-2">
                    Account
                </h2>


                {/* Profile Picture */}
                <section className="mt-6 bg-admin-surface rounded-xl p-5">

                    <h3 className="text-lg font-bold mb-4">
                        Profile Picture
                    </h3>

                    <div className="flex gap-5 items-center">

                        <div className="h-24 w-24 rounded-full overflow-hidden border border-admin-border shrink-0">
                            <img
                                src={currentUser?.profile_pic_path}
                                alt="Profile"
                                className="h-full w-full object-cover"
                            />
                        </div>


                        <div className="flex flex-col gap-3">

                            <p className="text-sm text-admin-muted font-semibold">
                                Upload a new profile picture
                            </p>

                            <div className="flex gap-2">

                                <button
                                    type="button"
                                    onClick={() => setShowPictureModal(true)}
                                    className="
                                        flex
                                        items-center
                                        bg-admin-primary
                                        px-4
                                        py-2
                                        rounded-xl
                                        gap-2
                                        hover:bg-admin-primary-hover
                                        duration-300
                                        ease-in-out
                                        cursor-pointer
                                        font-semibold
                                    "
                                >
                                    <Upload className="w-5 h-5" />

                                    Upload Image
                                </button>


                                <ProfilePictureModal
                                    isOpen={showPictureModal}
                                    onClose={() => setShowPictureModal(false)}
                                    currentImage={currentUser?.profile_pic_path}
                                    dark={true}
                                />


                                <button
                                    type="button"
                                    className="
                                        px-4
                                        py-2
                                        rounded-xl
                                        bg-admin-surface-hover
                                        text-admin-muted
                                        border
                                        border-admin-border
                                        hover:bg-admin-surface-hover/70
                                        hover:text-admin-text
                                        duration-300
                                        ease-in-out
                                        cursor-pointer
                                        font-semibold
                                    "
                                >
                                    Remove
                                </button>

                            </div>
                        </div>
                    </div>
                </section>


                {/* Account Information */}
                <form
                    onSubmit={handleSubmit}
                    className="
                        mt-6
                        bg-admin-surface
                        rounded-xl
                        p-5
                        grid
                        grid-cols-1
                        md:grid-cols-2
                        lg:grid-cols-3
                        gap-x-5
                        gap-y-6
                    "
                >

                    {/* Username */}
                    <div className="flex flex-col gap-2">

                        <label
                            htmlFor="username"
                            className="text-sm font-bold text-admin-muted"
                        >
                            Username
                        </label>

                        <div className="relative">

                            <input
                                id="username"
                                type="text"
                                disabled={editingField !== "username"}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="
                                    w-full
                                    pr-12
                                    bg-admin-input
                                    border
                                    border-admin-input-border
                                    rounded-lg
                                    outline-none
                                    py-2
                                    px-3
                                    text-admin-text
                                    disabled:opacity-70
                                    focus:border-admin-primary
                                    transition-colors
                                "
                            />

                            <button
                                type="button"
                                onClick={() => setEditingField("username")}
                            >
                                <Edit3Icon
                                    className="
                                        absolute
                                        right-3
                                        top-1/2
                                        -translate-y-1/2
                                        w-5
                                        h-5
                                        text-admin-muted
                                        hover:text-admin-text
                                        cursor-pointer
                                        transition-colors
                                    "
                                />
                            </button>

                        </div>
                    </div>


                    {/* Full Name */}
                    <div className="flex flex-col gap-2">

                        <label
                            htmlFor="fullName"
                            className="text-sm font-bold text-admin-muted"
                        >
                            Full Name
                        </label>

                        <div className="relative">

                            <input
                                id="fullName"
                                type="text"
                                disabled={editingField !== "fullname"}
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="
                                    w-full
                                    pr-12
                                    bg-admin-input
                                    border
                                    border-admin-input-border
                                    rounded-lg
                                    outline-none
                                    py-2
                                    px-3
                                    text-admin-text
                                    disabled:opacity-70
                                    focus:border-admin-primary
                                    transition-colors
                                "
                            />

                            <button
                                type="button"
                                onClick={() => setEditingField("fullname")}
                            >
                                <Edit3Icon
                                    className="
                                        absolute
                                        right-3
                                        top-1/2
                                        -translate-y-1/2
                                        w-5
                                        h-5
                                        text-admin-muted
                                        hover:text-admin-text
                                        cursor-pointer
                                        transition-colors
                                    "
                                />
                            </button>

                        </div>
                    </div>


                    {/* Email */}
                    <div className="flex flex-col gap-2">

                        <label
                            htmlFor="email"
                            className="text-sm font-bold text-admin-muted"
                        >
                            Email
                        </label>

                        <div className="relative">

                            <input
                                id="email"
                                type="email"
                                disabled={editingField !== "email"}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="
                                    w-full
                                    pr-12
                                    bg-admin-input
                                    border
                                    border-admin-input-border
                                    rounded-lg
                                    outline-none
                                    py-2
                                    px-3
                                    text-admin-text
                                    disabled:opacity-70
                                    focus:border-admin-primary
                                    transition-colors
                                "
                            />

                            <button
                                type="button"
                                onClick={() => setEditingField("email")}
                            >
                                <Edit3Icon
                                    className="
                                        absolute
                                        right-3
                                        top-1/2
                                        -translate-y-1/2
                                        w-5
                                        h-5
                                        text-admin-muted
                                        hover:text-admin-text
                                        cursor-pointer
                                        transition-colors
                                    "
                                />
                            </button>

                        </div>
                    </div>


                    {/* Phone */}
                    <div className="flex flex-col gap-2">

                        <label
                            htmlFor="phone"
                            className="text-sm font-bold text-admin-muted"
                        >
                            Phone
                        </label>

                        <div className="relative">

                            <input
                                id="phone"
                                type="text"
                                disabled={editingField !== "phone"}
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="
                                    w-full
                                    pr-12
                                    bg-admin-input
                                    border
                                    border-admin-input-border
                                    rounded-lg
                                    outline-none
                                    py-2
                                    px-3
                                    text-admin-text
                                    disabled:opacity-70
                                    focus:border-admin-primary
                                    transition-colors
                                "
                            />

                            <button
                                type="button"
                                onClick={() => setEditingField("phone")}
                            >
                                <Edit3Icon
                                    className="
                                        absolute
                                        right-3
                                        top-1/2
                                        -translate-y-1/2
                                        w-5
                                        h-5
                                        text-admin-muted
                                        hover:text-admin-text
                                        cursor-pointer
                                        transition-colors
                                    "
                                />
                            </button>

                        </div>
                    </div>


                    {/* Address */}
                    <div className="lg:col-span-2 flex flex-col gap-2">

                        <label
                            htmlFor="address"
                            className="text-sm font-bold text-admin-muted"
                        >
                            Main Address
                        </label>

                        <div className="relative">

                            <input
                                id="address"
                                type="text"
                                disabled={editingField !== "address"}
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="
                                    w-full
                                    pr-12
                                    bg-admin-input
                                    border
                                    border-admin-input-border
                                    rounded-lg
                                    outline-none
                                    py-2
                                    px-3
                                    text-admin-text
                                    disabled:opacity-70
                                    focus:border-admin-primary
                                    transition-colors
                                "
                            />

                            <button
                                type="button"
                                onClick={() => setEditingField("address")}
                            >
                                <Edit3Icon
                                    className="
                                        absolute
                                        right-3
                                        top-1/2
                                        -translate-y-1/2
                                        w-5
                                        h-5
                                        text-admin-muted
                                        hover:text-admin-text
                                        cursor-pointer
                                        transition-colors
                                    "
                                />
                            </button>

                        </div>
                    </div>


                    {/* Error */}
                    {errorPatch && (
                        <p className="lg:col-span-3 font-bold text-admin-inactive">
                            {errorPatch.message}
                        </p>
                    )}


                    {/* Actions */}
                    <div
                        className="
                            lg:col-span-3
                            flex
                            justify-end
                            gap-3
                            pt-4
                            border-t
                            border-admin-border
                        "
                    >

                        <button
                            type="button"
                            onClick={() => {
                                setUsername(currentUser.username || "");
                                setFullName(currentUser.full_name || "");
                                setEmail(currentUser.email || "");
                                setPhone(currentUser.phone || "");
                                setAddress(currentUser.address || "");
                                setEditingField("");
                            }}
                            className="
                                px-5
                                py-2
                                rounded-xl
                                bg-admin-surface-hover
                                text-admin-muted
                                border
                                border-admin-border
                                hover:bg-admin-surface-hover/70
                                hover:text-admin-text
                                duration-300
                                ease-in-out
                                cursor-pointer
                                font-bold
                            "
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            disabled={isPending}
                            className="
                                px-8
                                py-2
                                rounded-xl
                                bg-admin-primary
                                hover:bg-admin-primary-hover
                                disabled:opacity-50
                                duration-300
                                ease-in-out
                                cursor-pointer
                                text-admin-text
                                font-bold
                            "
                        >
                            {isPending ? "Saving..." : "Save"}
                        </button>

                    </div>

                </form>

            </section>
        </main>
    );
}

export default AdminProfile;
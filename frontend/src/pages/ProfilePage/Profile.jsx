import { useMutation, useQuery } from "@tanstack/react-query";
import Navbar from "../../components/Navbar";
import ProfileSidebar from "../../components/ProfileSidebar";
import DotField from "../../components/animation/DotField";
import getCurrentUser from "../../hooks/CurrentUser";
import { data, useNavigate } from "react-router-dom";
import { Upload, Edit3Icon } from "lucide-react";
import { useState, useEffect } from "react";
import ProfilePictureModal from "../../modals/ProfilePictureModal";
import { queryClient } from "../../lib/queryClient";

function Profile() {

    const BASE_URL = import.meta.env.VITE_BASE_URL
    const token = localStorage.getItem("access_token")
    const navigate = useNavigate()

    const {
        data: currentUser,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["user"],
        queryFn: getCurrentUser,
        enabled: !!localStorage.getItem("access_token"),
    });

    if (isError) {
        navigate("/login")
    }


    const [username, setUsername] = useState("")
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [address, setAddress] = useState("")
    const [editingField, setEditingField] = useState("")


    useEffect(() => {
        if (currentUser) {
            setUsername(currentUser.username || "");
            setFullName(currentUser.full_name || "");
            setEmail(currentUser.email || "");
            setPhone(currentUser.phone || "");
            setAddress(currentUser.address || "");
        }
    }, [currentUser])



    const updateUserInfosFunction = async (new_infos) => {
        const response = await fetch(
            `${BASE_URL}/profile`,
            {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(new_infos)
            }
        )

        const data = await response.json()

        if (!response.ok) throw new Error(data.detail || "Failed to update Infos")

        return data
    }

    const {
        mutate: updateUserInfos,
        error: errorPatch
    } = useMutation({
        mutationFn: updateUserInfosFunction,
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["user"]
            })
        }
    })


    const handleSubmit = async (e) => {
        e.preventDefault()

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

    const [showPictureModal, setShowPictureModal] = useState(false);


    return (
        <main className="relative min-h-screen">
            <header className="fixed top-0 left-0 w-full z-50">
                <Navbar />
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

            <section className="relative z-10 h-screen bg-card/20 backdrop-blur-xl flex">
                <ProfileSidebar user={currentUser} />

                <section className="flex-1 flex flex-col pt-20 p-8">
                    <h2 className="text-3xl border-b border-border pb-2">
                        Account
                    </h2>

                    <div className="mt-6 flex gap-5">
                        <div className="h-25 w-25 rounded-full overflow-hidden border border-border-soft">
                            <img
                                src={currentUser?.profile_pic_path}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="flex flex-col justify-around">
                            <p className="text-lg font-bold tracking-wide">
                                Profile Picture
                            </p>

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPictureModal(true)}
                                    className="
                                        flex
                                        bg-primary
                                        px-4 py-2
                                        rounded-xl
                                        gap-2
                                        hover:bg-primary-hover
                                        duration-300
                                        ease-in-out
                                        cursor-pointer
                                        shadow-inner
                                    "
                                >
                                    <Upload className="text-inverse" />

                                    <p className="text-inverse">
                                        Upload Image
                                    </p>
                                </button>

                                <ProfilePictureModal
                                    isOpen={showPictureModal}
                                    onClose={() => setShowPictureModal(false)}
                                    currentImage={currentUser?.profile_pic_path}
                                />

                                <button className="flex bg-card text-foreground px-4 py-2 rounded-xl gap-2 border border-border-soft hover:bg-chip duration-300 ease-in-out cursor-pointer shadow-inner">
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="
                            mt-12
                            grid
                            grid-cols-1
                            md:grid-cols-2
                            lg:grid-cols-3
                            gap-x-5
                            gap-y-8
                        "
                    >
                        {/* Username */}
                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="username"
                                className="text-sm font-medium text-muted"
                            >
                                Username
                            </label>

                            <div className="relative bg-chip rounded-xl shadow-inner px-4 py-3">
                                <input
                                    id="username"
                                    type="text"
                                    disabled={editingField !== "username"}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="
                                        w-full
                                        pr-8
                                        text-xl
                                        font-semibold
                                        bg-transparent
                                        outline-none
                                    "
                                />

                                <button type="button" onClick={() => setEditingField("username")}>
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


                        {/* Full Name */}
                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="fullName"
                                className="text-sm font-medium text-muted"
                            >
                                Full Name
                            </label>

                            <div className="relative bg-chip rounded-xl shadow-inner px-4 py-3">
                                <input
                                    id="fullName"
                                    type="text"
                                    disabled={editingField !== "fullname"}
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="
                                        w-full
                                        pr-8
                                        text-xl
                                        font-semibold
                                        bg-transparent
                                        outline-none
                                    "
                                />

                                <button type="button" onClick={() => setEditingField("fullname")}>
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


                        {/* Email */}
                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="email"
                                className="text-sm font-medium text-muted"
                            >
                                Email
                            </label>

                            <div className="relative bg-chip rounded-xl shadow-inner px-4 py-3">
                                <input
                                    id="email"
                                    type="text"
                                    disabled={editingField !== "email"}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="
                                        w-full
                                        pr-8
                                        text-xl
                                        font-semibold
                                        bg-transparent
                                        outline-none
                                    "
                                />

                                <button type="button" onClick={() => setEditingField("email")}>
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


                        <div className="flex flex-col gap-2">
                            <label
                                htmlFor="phone"
                                className="text-sm font-medium text-muted"
                            >
                                Phone
                            </label>

                            <div className="relative bg-chip rounded-xl shadow-inner px-4 py-3">
                                <input
                                    id="phone"
                                    type="text"
                                    disabled={editingField !== "phone"}
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="
                                        w-full
                                        pr-8
                                        text-xl
                                        font-semibold
                                        bg-transparent
                                        outline-none
                                    "
                                />

                                <button type="button" onClick={() => setEditingField("phone")}>
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


                        <div className="lg:col-span-2 flex flex-col gap-2">
                            <label
                                htmlFor="address"
                                className="text-sm font-medium text-muted"
                            >
                                Main Address
                            </label>

                            <div className="relative bg-chip rounded-xl shadow-inner px-4 py-3">
                                <input
                                    id="address"
                                    type="text"
                                    disabled={editingField !== "address"}
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="
                                        w-full
                                        pr-8
                                        text-xl
                                        font-semibold
                                        bg-transparent
                                        outline-none
                                    "
                                />

                                <button type="button" onClick={() => setEditingField("address")}>
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

                        {
                            errorPatch &&
                            <p className="font-bold text-minimal-red">
                                {errorPatch.message}
                            </p>
                        }


                        {/* Actions */}
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
                                    shadow-inner
                                    text-lg
                                    font-bold
                                "
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="
                                    px-10
                                    py-2
                                    rounded-xl
                                    bg-primary
                                    hover:bg-primary-hover
                                    duration-300
                                    ease-in-out
                                    cursor-pointer
                                    shadow-inner
                                    text-inverse
                                    text-lg
                                    font-bold
                                "
                            >
                                Save
                            </button>
                        </div>
                    </form>

                </section>
            </section>
        </main>
    )
}


export default Profile;
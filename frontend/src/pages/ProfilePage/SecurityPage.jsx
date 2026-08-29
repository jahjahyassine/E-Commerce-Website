import { useMutation, useQuery } from "@tanstack/react-query";

import Navbar from "../../components/Navbar";
import ProfileSidebar from "../../components/ProfileSidebar";
import DotField from "../../components/animation/DotField";
import getCurrentUser from "../../hooks/CurrentUser";

import { useNavigate } from "react-router-dom";

import { useState, useEffect } from "react";

function SecurityPage() {
    const BASE_URL = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem("access_token");

    const navigate = useNavigate();

    /* ---------------- AUTH CHECK ---------------- */

    useEffect(() => {
        const token = localStorage.getItem("access_token");

        if (!token) {
            navigate("/login");
        }
    }, [navigate]);


    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const passwordMismatch =
        confirmPassword.length > 0 &&
        newPassword !== confirmPassword;


    const changePasswordFunction = async (password_data) => {
        const response = await fetch(
            `${BASE_URL}/user/change-password`,
            {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(password_data),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Failed to update password"
            );
        }

        return data;
    };

    const {
        mutate: changePassword,
        isError: isErrorPassword,
        error: errorPassword,
        isPending,
        isSuccess,
    } = useMutation({
        mutationFn: changePasswordFunction,

        mutationKey: ["password"],

        onSuccess: () => {
            console.log("Password changed successfully");

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        },
    });



    const {
        data: currentUser,
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


    const handleSubmit = (e) => {
        e.preventDefault();

        if (passwordMismatch) {
            return;
        }

        changePassword({
            current_password: currentPassword,
            new_password: newPassword,
        });
    };

    return (
        <main className="relative min-h-screen">


            <header className="fixed top-0 left-0 w-full z-50">
                <Navbar />
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
                    bg-card/20
                    backdrop-blur-xl
                    flex
                "
            >

                <ProfileSidebar user={currentUser} />


                <section
                    className="
                        flex-1
                        flex
                        flex-col
                        pt-20
                        p-8
                        overflow-y-auto
                        scrollbar-none
                        scroll-smooth
                    "
                >


                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            border-b
                            border-border
                            pb-3
                        "
                    >
                        <h2 className="text-2xl font-semibold">
                            Security
                        </h2>
                    </div>


                    <section
                        className="
                            mt-8
                            flex-1
                            min-h-0
                            rounded-3xl
                            bg-chip
                            p-3
                            overflow-y-auto
                            scrollbar-none
                        "
                    >


                        <section
                            className="
                                rounded-2xl
                                bg-card
                                p-5
                                transition
                                duration-300
                                ease-in-out
                                hover:shadow-sm
                            "
                        >
                            <h3 className="text-lg font-semibold">
                                Change Password
                            </h3>

                            <form
                                onSubmit={handleSubmit}
                                className="
                                    mt-8
                                    flex
                                    flex-col
                                    gap-4
                                "
                            >


                                <div className="flex flex-col gap-2">

                                    <label
                                        htmlFor="currentPassword"
                                        className="
                                            text-sm
                                            font-medium
                                            text-muted
                                        "
                                    >
                                        Current Password
                                    </label>

                                    <input
                                        id="currentPassword"
                                        name="currentPassword"
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) =>
                                            setCurrentPassword(
                                                e.target.value
                                            )
                                        }
                                        required
                                        autoComplete="current-password"
                                        placeholder="Enter your current password"
                                        className={`
                                            bg-chip
                                            px-4
                                            py-2
                                            w-full
                                            text-base
                                            font-medium
                                            outline-none
                                            rounded-lg
                                            border
                                            transition-all
                                            ${isErrorPassword
                                                ? "border-danger focus:ring-1 focus:ring-danger/30"
                                                : "border-border-soft focus:border-primary focus:ring-1 focus:ring-primary/30"
                                            }
                                        `}
                                    />


                                    {isErrorPassword && (
                                        <p className="text-sm text-danger">
                                            {errorPassword?.message || "Failed to change password"}
                                        </p>
                                    )}

                                </div>

                                {/* NEW PASSWORD */}

                                <div className="flex flex-col gap-2">

                                    <label
                                        htmlFor="newPassword"
                                        className="
                                            text-sm
                                            font-medium
                                            text-muted
                                        "
                                    >
                                        New Password
                                    </label>

                                    <input
                                        id="newPassword"
                                        name="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) =>
                                            setNewPassword(
                                                e.target.value
                                            )
                                        }
                                        required
                                        minLength={8}
                                        autoComplete="new-password"
                                        placeholder="Enter your new password"
                                        className="
                                            bg-chip
                                            px-4
                                            py-2
                                            w-full
                                            text-base
                                            font-medium
                                            outline-none
                                            rounded-lg
                                            border
                                            border-border-soft
                                            focus:border-primary
                                            focus:ring-1
                                            focus:ring-primary/30
                                            transition-all
                                        "
                                    />

                                    <p className="text-xs text-muted">
                                        Minimum 8 characters
                                    </p>

                                </div>

                                {/* CONFIRM PASSWORD */}

                                <div className="flex flex-col gap-2">

                                    <label
                                        htmlFor="confirmPassword"
                                        className="
                                            text-sm
                                            font-medium
                                            text-muted
                                        "
                                    >
                                        Confirm New Password
                                    </label>

                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(
                                                e.target.value
                                            )
                                        }
                                        required
                                        minLength={8}
                                        autoComplete="new-password"
                                        placeholder="Confirm your new password"
                                        className={`
                                            bg-chip
                                            px-4
                                            py-2
                                            w-full
                                            text-base
                                            font-medium
                                            outline-none
                                            rounded-lg
                                            border
                                            transition-all
                                            ${passwordMismatch
                                                ? "border-danger focus:ring-1 focus:ring-danger/30"
                                                : "border-border-soft focus:border-primary focus:ring-1 focus:ring-primary/30"
                                            }
                                        `}
                                    />

                                    {passwordMismatch && (
                                        <p className="text-sm text-danger">
                                            Passwords do not match
                                        </p>
                                    )}

                                </div>

                                {/* SUCCESS */}

                                {isSuccess && (
                                    <p className="text-sm text-success">
                                        Password changed successfully.
                                    </p>
                                )}

                                {/* SAVE */}

                                <button
                                    type="submit"
                                    disabled={
                                        passwordMismatch ||
                                        isPending
                                    }
                                    className="
                                        self-end
                                        px-8
                                        py-2
                                        rounded-xl
                                        bg-primary
                                        hover:bg-primary-hover
                                        duration-300
                                        ease-in-out
                                        cursor-pointer
                                        text-inverse
                                        text-sm
                                        font-semibold
                                        disabled:opacity-50
                                        disabled:cursor-not-allowed
                                    "
                                >
                                    {isPending
                                        ? "Saving..."
                                        : "Save"}
                                </button>

                            </form>
                        </section>
                    </section>
                </section>
            </section>
        </main>
    );
}

export default SecurityPage;

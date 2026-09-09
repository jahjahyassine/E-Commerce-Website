import { useState } from "react";

import Navbar from "../components/Navbar";
import DotField from "../components/animation/DotField";
import loginImage from "../assets/bg1.jpg";

import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

function Register() {
    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [checked, setChecked] = useState(false);

    const [validationError, setValidationError] = useState("");

    const registerUser = async (data) => {
        const response = await fetch(
            `${BASE_URL}/auth/register`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify(data),
            }
        );

        if (!response.ok) {
            const error = await response.json();

            throw new Error(
                error.detail || "Registration failed"
            );
        }

        return response.json();
    };

    const {
        mutate: register,
        isPending,
        isError,
        error,
    } = useMutation({
        mutationFn: registerUser,

        onSuccess: () => {
            navigate("/login");
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        setValidationError("");

        const cleanFirstName = firstName.trim();
        const cleanLastName = lastName.trim();
        const cleanUsername = username.trim();
        const cleanEmail = email.trim();

        // First name validation
        if (cleanFirstName.length < 2) {
            setValidationError(
                "First name must contain at least 2 characters."
            );
            return;
        }

        // Last name validation
        if (cleanLastName.length < 2) {
            setValidationError(
                "Last name must contain at least 2 characters."
            );
            return;
        }

        // Full name database limit
        const fullName = `${cleanFirstName} ${cleanLastName}`;

        if (fullName.length > 100) {
            setValidationError(
                "First name and last name together cannot exceed 100 characters."
            );
            return;
        }

        // Username validation
        if (cleanUsername.length < 3) {
            setValidationError(
                "Username must contain at least 3 characters."
            );
            return;
        }

        // Password confirmation
        if (password !== confirmPassword) {
            setValidationError(
                "Passwords do not match."
            );
            return;
        }

        // Terms validation
        if (!checked) {
            setValidationError(
                "You must agree to the Terms of Service and Privacy Policy."
            );
            return;
        }

        register({
            username: cleanUsername,
            full_name: fullName,
            email: cleanEmail,
            password,
        });
    };

    return (
        <main className="bg-background min-h-screen">
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
            
                        <div
                            className="
                    fixed
                    inset-0
                    z-[1]
                    pointer-events-none
                    flex
                    items-center
                    justify-center
                    overflow-hidden
                "
                            aria-hidden="true"
                        >
                            <img
                                src={loginImage}
                                alt=""
                                className="
                        w-full
                        h-full
                        object-cover
                        select-none
                        mix-blend-darken
                    "
                            />
                        </div>

            <section className="relative z-10 min-h-screen w-full flex flex-col items-center justify-center px-4 pt-20">
                <section className="flex flex-col justify-between items-center bg-card/20 py-8 px-10 md:px-18 rounded-3xl backdrop-blur-xl shadow-product w-full max-w-lg">

                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold">
                            Create Your Account
                        </h2>

                        <p className="text-foreground font-bold mt-2">
                            Shop smarter with ByteStore.
                            <br />
                            Your account keeps everything in one place.
                        </p>
                    </div>

                    <form
                        className="flex flex-col gap-4 items-center w-full"
                        onSubmit={handleSubmit}
                    >
                        {/* First + Last Name */}
                        <div className="flex gap-3 w-full">
                            <input
                                type="text"
                                className="bg-chip placeholder:text-muted text-foreground font-bold text-lg py-2 px-4 rounded-xl focus:outline-0 border border-border focus:shadow-product w-full"
                                placeholder="First name"
                                value={firstName}
                                onChange={(e) =>
                                    setFirstName(e.target.value)
                                }
                                minLength={2}
                                maxLength={50}
                                required
                                autoComplete="given-name"
                            />

                            <input
                                type="text"
                                className="bg-chip placeholder:text-muted text-foreground font-bold text-lg py-2 px-4 rounded-xl focus:outline-0 border border-border focus:shadow-product w-full"
                                placeholder="Last name"
                                value={lastName}
                                onChange={(e) =>
                                    setLastName(e.target.value)
                                }
                                minLength={2}
                                maxLength={50}
                                required
                                autoComplete="family-name"
                            />
                        </div>

                        {/* Username */}
                        <input
                            type="text"
                            className="bg-chip placeholder:text-muted text-foreground font-bold text-lg py-2 px-4 rounded-xl focus:outline-0 border border-border focus:shadow-product w-full"
                            placeholder="Username"
                            value={username}
                            onChange={(e) =>
                                setUsername(e.target.value)
                            }
                            minLength={3}
                            maxLength={100}
                            required
                            autoComplete="username"
                        />

                        {/* Email */}
                        <input
                            type="email"
                            className="bg-chip placeholder:text-muted text-foreground font-bold text-lg py-2 px-4 rounded-xl focus:outline-0 border border-border focus:shadow-product w-full"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            maxLength={255}
                            required
                            autoComplete="email"
                        />

                        {/* Password */}
                        <input
                            type="password"
                            className="bg-chip placeholder:text-muted text-foreground font-bold text-lg py-2 px-4 rounded-xl focus:outline-0 border border-border focus:shadow-product w-full"
                            placeholder="Password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            minLength={8}
                            maxLength={128}
                            required
                            autoComplete="new-password"
                        />

                        {/* Confirm Password */}
                        <input
                            type="password"
                            className="bg-chip placeholder:text-muted text-foreground font-bold text-lg py-2 px-4 rounded-xl focus:outline-0 border border-border focus:shadow-product w-full"
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(e) =>
                                setConfirmPassword(e.target.value)
                            }
                            minLength={8}
                            maxLength={128}
                            required
                            autoComplete="new-password"
                        />

                        {/* Terms */}
                        <div className="flex items-start gap-2 w-full text-sm text-foreground">
                            <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) =>
                                    setChecked(e.target.checked)
                                }
                                className="mt-1"
                                required
                            />

                            <label>
                                I agree to the Terms of Service and
                                Privacy Policy
                            </label>
                        </div>

                        {/* Error */}
                        {(validationError || isError) && (
                            <p className="text-minimal-red text-sm font-bold text-center">
                                {validationError ||
                                    error?.message ||
                                    "Registration failed."}
                            </p>
                        )}

                        {/* Submit */}
                        <button
                            className="bg-primary text-xl text-inverse font-bold px-5 py-2 rounded-2xl cursor-pointer hover:scale-[1.02] duration-300 hover:bg-primary-hover w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            type="submit"
                            disabled={isPending}
                        >
                            {isPending
                                ? "Creating Account..."
                                : "Create Account"}
                        </button>
                    </form>

                    <p className="mt-6">
                        Already have an account?

                        <Link
                            to="/login"
                            className="text-emerald/80 font-bold"
                        >
                            {" "}
                            Sign in
                        </Link>
                    </p>
                </section>
            </section>
        </main>
    );
}

export default Register;

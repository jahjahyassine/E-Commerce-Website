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
        <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
            <header className="fixed top-0 left-0 z-50 w-full">
                <Navbar />
            </header>

            {/* Ambient background */}
            <div
                className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
                aria-hidden="true"
            >
                <div className="absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full bg-accent/10 blur-[120px]" />
                <div className="absolute top-1/3 -right-48 h-[480px] w-[480px] rounded-full bg-secondary/10 blur-[140px]" />

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
                    gradientFrom="#A8AEC040"
                    gradientTo="#6FA7A330"
                    glowColor="#6FA7A320"
                />
            </div>

            {/* Background image */}
            <div
                className="pointer-events-none fixed inset-0 z-[1] overflow-hidden"
                aria-hidden="true"
            >
                <img
                    src={loginImage}
                    alt=""
                    className="h-full w-full select-none object-cover opacity-25 mix-blend-screen"
                />

                <div className="absolute inset-0 bg-background/75" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,transparent_0%,rgba(13,17,32,0.35)_55%,rgba(13,17,32,0.78)_100%)]" />
            </div>

            <section className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-4 py-24">
                <section className="w-full max-w-lg rounded-3xl border border-border-soft bg-card-dark/80 px-6 py-8 shadow-elevated backdrop-blur-2xl sm:px-10 md:px-12">

                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 h-px w-12 bg-accent/70" />

                        <h2 className="text-3xl font-bold tracking-tight text-foreground">
                            Create Your Account
                        </h2>

                        <p className="mx-auto mt-3 max-w-sm text-sm font-normal leading-6 text-muted">
                            Shop smarter with ByteStore.
                            <br />
                            Your account keeps everything in one place.
                        </p>

                        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                    </div>

                    <form
                        className="flex w-full flex-col gap-4"
                        onSubmit={handleSubmit}
                    >
                        {/* First + Last Name */}
                        <div className="flex w-full flex-col gap-4 sm:flex-row">
                            <input
                                type="text"
                                className="w-full rounded-2xl border border-border bg-surface/80 px-5 py-3.5 text-base font-medium text-foreground shadow-inner outline-none backdrop-blur-xl placeholder:text-subtle transition-colors hover:border-accent/40 focus:border-accent focus:ring-2 focus:ring-accent/30"
                                aria-label="First name"
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
                                className="w-full rounded-2xl border border-border bg-surface/80 px-5 py-3.5 text-base font-medium text-foreground shadow-inner outline-none backdrop-blur-xl placeholder:text-subtle transition-colors hover:border-accent/40 focus:border-accent focus:ring-2 focus:ring-accent/30"
                                aria-label="Last name"
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
                            className="w-full rounded-2xl border border-border bg-surface/80 px-5 py-3.5 text-base font-medium text-foreground shadow-inner outline-none backdrop-blur-xl placeholder:text-subtle transition-colors hover:border-accent/40 focus:border-accent focus:ring-2 focus:ring-accent/30"
                            aria-label="Username"
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
                            className="w-full rounded-2xl border border-border bg-surface/80 px-5 py-3.5 text-base font-medium text-foreground shadow-inner outline-none backdrop-blur-xl placeholder:text-subtle transition-colors hover:border-accent/40 focus:border-accent focus:ring-2 focus:ring-accent/30"
                            aria-label="Email address"
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
                            className="w-full rounded-2xl border border-border bg-surface/80 px-5 py-3.5 text-base font-medium text-foreground shadow-inner outline-none backdrop-blur-xl placeholder:text-subtle transition-colors hover:border-accent/40 focus:border-accent focus:ring-2 focus:ring-accent/30"
                            aria-label="Password"
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
                            className="w-full rounded-2xl border border-border bg-surface/80 px-5 py-3.5 text-base font-medium text-foreground shadow-inner outline-none backdrop-blur-xl placeholder:text-subtle transition-colors hover:border-accent/40 focus:border-accent focus:ring-2 focus:ring-accent/30"
                            aria-label="Confirm password"
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
                        <div className="flex w-full items-start gap-3 pt-1 text-sm leading-5 text-muted">
                            <input
                                type="checkbox"
                                id="accept-terms"
                                checked={checked}
                                onChange={(e) =>
                                    setChecked(e.target.checked)
                                }
                                className="mt-1 h-4 w-4 shrink-0 accent-accent"
                                required
                            />

                            <label htmlFor="accept-terms" className="cursor-pointer">
                                I agree to the Terms of Service and
                                Privacy Policy
                            </label>
                        </div>

                        {/* Error */}
                        {(validationError || isError) && (
                            <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-center text-sm font-medium text-danger">
                                {validationError ||
                                    error?.message ||
                                    "Registration failed."}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            className="mt-2 w-full cursor-pointer rounded-2xl bg-accent px-5 py-3.5 text-base font-bold text-inverse shadow-[0_8px_24px_rgba(111,167,163,0.18)] transition-all duration-300 hover:bg-accent-hover hover:shadow-[0_10px_30px_rgba(111,167,163,0.25)] disabled:cursor-not-allowed disabled:opacity-50"
                            type="submit"
                            disabled={isPending}
                        >
                            {isPending
                                ? "Creating Account..."
                                : "Create Account"}
                        </button>
                    </form>

                    <p className="mt-7 text-center text-sm text-muted">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="font-semibold text-accent transition-colors hover:text-accent-hover"
                        >
                            Sign in
                        </Link>
                    </p>
                </section>
            </section>
        </main>
    );
}

export default Register;
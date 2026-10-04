import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import DotField from "../components/animation/DotField";
import loginImage from "../assets/bg1.jpg";

import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

function Login() {
    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const navigate = useNavigate();

    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [rememberOption, setRememberOption] = useState(false);

    const loginUser = async (data) => {
        const response = await fetch(
            `${BASE_URL}/auth/login`,
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
                error.detail || "Login failed"
            );
        }

        return response.json();
    };

    const {
        mutate: login,
        isPending,
        isError,
        error,
    } = useMutation({
        mutationFn: loginUser,

        onSuccess: (data) => {
            localStorage.setItem(
                "access_token",
                data.access_token
            );

            navigate("/products");
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        const cleanIdentifier = identifier.trim();

        if (!cleanIdentifier) {
            return;
        }

        login({
            identifier: cleanIdentifier,
            password,
            rememberOption,
        });
    };

    useEffect(() => {
        const token = localStorage.getItem("access_token");

        if (token) {
            navigate("/profile");
        }
    }, [navigate]);

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

            <section className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-4 pt-20">
                <section className="w-full max-w-lg rounded-3xl border border-border-soft bg-card-dark/80 px-6 py-8 shadow-elevated backdrop-blur-2xl sm:px-10 md:px-12">

                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 h-px w-12 bg-accent/70" />

                        <h2 className="text-3xl font-bold tracking-tight text-foreground">
                            Welcome Back
                        </h2>

                        <p className="mx-auto mt-3 max-w-sm text-sm font-normal leading-6 text-muted">
                            Sign in to your ByteStore account.
                            <br />
                            Your favorite products are waiting.
                        </p>

                        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                    </div>

                    <form
                        className="flex w-full flex-col gap-4"
                        onSubmit={handleSubmit}
                    >
                        <input
                            type="text"
                            className="w-full rounded-2xl border border-border bg-surface/80 px-5 py-3.5 text-base font-medium text-foreground shadow-inner outline-none backdrop-blur-xl placeholder:text-subtle transition-colors hover:border-accent/40 focus:border-accent focus:ring-2 focus:ring-accent/30"
                            placeholder="Username or email address"
                            value={identifier}
                            onChange={(e) =>
                                setIdentifier(e.target.value)
                            }
                            minLength={3}
                            maxLength={255}
                            required
                            autoComplete="username"
                        />

                        <input
                            type="password"
                            className="w-full rounded-2xl border border-border bg-surface/80 px-5 py-3.5 text-base font-medium text-foreground shadow-inner outline-none backdrop-blur-xl placeholder:text-subtle transition-colors hover:border-accent/40 focus:border-accent focus:ring-2 focus:ring-accent/30"
                            placeholder="Password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            minLength={8}
                            maxLength={128}
                            required
                            autoComplete="current-password"
                        />

                        <div className="flex w-full items-center justify-end gap-2 pt-1 text-sm text-muted">
                            <input
                                type="checkbox"
                                checked={rememberOption}
                                onChange={(e) =>
                                    setRememberOption(
                                        e.target.checked
                                    )
                                }
                                className="mt-0.5 h-4 w-4 accent-accent"
                            />

                            <label className="cursor-pointer">
                                Remember me
                            </label>
                        </div>

                        {isError && (
                            <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-center text-sm font-medium text-danger">
                                {error?.message ||
                                    "Login failed."}
                            </div>
                        )}

                        <button
                            className="mt-2 w-full cursor-pointer rounded-2xl bg-accent px-5 py-3.5 text-base font-bold text-inverse shadow-[0_8px_24px_rgba(111,167,163,0.18)] transition-all duration-300 hover:bg-accent-hover hover:shadow-[0_10px_30px_rgba(111,167,163,0.25)] disabled:cursor-not-allowed disabled:opacity-50"
                            type="submit"
                            disabled={isPending}
                        >
                            {isPending
                                ? "Logging..."
                                : "Login"}
                        </button>
                    </form>

                    <p className="mt-7 text-center text-sm text-muted">
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            className="font-semibold text-accent transition-colors hover:text-accent-hover"
                        >
                            Register
                        </Link>
                    </p>
                </section>
            </section>
        </main>
    );
}

export default Login;
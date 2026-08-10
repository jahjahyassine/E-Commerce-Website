import { useState } from "react";
import Navbar from "../components/Navbar";
import DotField from "../components/animation/DotField";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

function Register() {

    const BASE_URL = import.meta.env.VITE_BASE_URL

    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [checked, setChecked] = useState(false)

    const registerUser = async () => {
        const response = await fetch(
            `${BASE_URL}/auth/register`,
            {
                method: POST,
                body: {
                    full_name: firstName + " " + lastName,
                    email: email,
                    password: password
                }
            }
        )
    }

    const { isLoading } = useQuery({
        queryKey: ["register"],
        queryFn: registerUser
    })

    const handleSubmit = (e) => {
        e.preventDefault();
    }

    return (
        <main className="bg-background">
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

            <main className="relative z-10 h-screen w-full flex flex-col items-center justify-center">

                <section className="flex justify-around items-center flex-col bg-card/20 py-6 px-18 rounded-3xl backdrop-blur-xl shadow-product h-[70vh]">
                    <div>
                        <h2 className="text-3xl font-bold">
                            Create Your Account
                        </h2>
                        <p className="text-muted font-bold text-center">
                            Shop smarter with ByteStore.
                            <br />Your account keeps everything in one place.
                        </p>
                    </div>


                    <form
                        className="flex flex-col justify-center gap-4 items-center gap-2"
                        onSubmit={(e) => handleSubmit(e)}
                    >

                        <input
                            type="text"
                            className="bg-chip placeholder:text-muted text-foreground font-bold text-xl py-1 px-4 rounded-xl focus:outline-0 border border-border focus:shadow-product w-full"
                            placeholder="First name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                        />


                        <input
                            type="text"
                            className="bg-chip placeholder:text-muted text-foreground font-bold text-xl py-1 px-4 rounded-xl focus:outline-0 border border-border focus:shadow-product w-full"
                            placeholder="Last name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                        />

                        <input
                            type="text"
                            className="bg-chip placeholder:text-muted text-foreground font-bold text-xl py-1 px-4 rounded-xl focus:outline-0 border border-border focus:shadow-product w-full"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <input
                            type="password" 
                            className="bg-chip placeholder:text-muted text-foreground font-bold text-xl py-1 px-4 rounded-xl focus:outline-0 border border-border focus:shadow-product w-full"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <input
                            type="password" 
                            className="bg-chip placeholder:text-muted text-foreground font-bold text-xl py-1 px-4 rounded-xl focus:outline-0 border border-border focus:shadow-product w-full"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />

                        <div className="flex gap-1">
                            <input
                                type="checkbox" required
                                value={checked}
                                onChange={(e) => setTerms(checked)}
                            />
                            <label className="">I agree to the Terms of Service and Privacy Policy</label>
                        </div>

                        <button className="bg-primary text-xl text-inverse font-bold px-5 py-2 rounded-2xl cursor-pointer hover:scale-[1.02] duration-300 hover:bg-primary-hover"
                        type="submit"
                        >
                            Create Account
                        </button>


                    </form>

                    <p>Already have an account?
                        <Link to="/login" className="text-emerald/80 font-bold"> Sign in</Link>
                    </p>
                </section>
            </main>
        </main>
    )
}


export default Register;
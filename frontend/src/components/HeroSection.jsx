import { useMemo } from "react";

import { ArrowRight, Sparkles } from "lucide-react";

import { useNavigate } from "react-router-dom";

import DriftWall from "./animation/DriftWall";

import "./HeroSection.css";

import asusLaptop from "../assets/asuslaptop.png";
import bg from "../assets/bg.jpg";
import console from "../assets/console.png";
import dellLaptop from "../assets/delllaptop.png";
import footer from "../assets/footer.jpg";
import headphones from "../assets/headphones.png";
import instagram from "../assets/Instagram.jpg";
import blenderRender from "../assets/It's a wrap for 2024_ ✨_Here are my 9 favorite 3D renders created among many.__From commercial and non-commercial projects. Pretty happy with how far I could push Blender's cycles.jpg";
import itsgeedee from "../assets/itsgeedee - 1676564399234 – SAVEE.jpg";
import macbook from "../assets/macbook.png";
import mouse from "../assets/mouse.png";
import postSilence from "../assets/Post III _A new layer of silence.jpg";
import samsungPhone from "../assets/samsungphone.png";
import dual from "../assets/DualSense - PS5.jpg"
import camera from "../assets/Elevate Your Business with Custom 3D Rendering Services.jpg"

const HERO_PRODUCTS = [
    {
        image: asusLaptop,
        title: "Laptops",
    },
    {
        image: macbook,
        title: "MacBooks",
    },
    {
        image: bg,
        title: "Digital Life",
    },
    {
        image: dual,
        title: "Headphones  "
    },
    {
        image: footer,
        title: "ByteStore",
    },
    {
        image: instagram,
        title: "Lifestyle",
    },
    {
        image: blenderRender,
        title: "Innovation",
    },
    {
        image: itsgeedee,
        title: "Design",
    },
    {
        image: postSilence,
        title: "Experience",
    },
    {
        image: samsungPhone,
        title: "Smartphones",
    },
    {
        image: dellLaptop,
        title: "Computing",
    },
    {
        image: camera,
        title: "Camera"
    },
    {
        image: console,
        title: "Gaming",
    },
    {
        image: headphones,
        title: "Audio",
    },
    {
        image: mouse,
        title: "Accessories",
    },
];

function HeroSection() {
    const navigate = useNavigate();

    const wallItems = useMemo(
        () =>
            HERO_PRODUCTS.map((product, index) => ({
                image: product.image,
                title: product.title,
                href: undefined,
                id: index,
            })),
        []
    );

    return (
        <section
            id="hero"
            className="hero-section"
        >
            {/* =====================================================
                BACKGROUND
            ====================================================== */}

            <div
                className="hero-background"
                aria-hidden="true"
            >
                <div className="hero-glow hero-glow-left" />
                <div className="hero-glow hero-glow-right" />
                <div className="hero-grid" />
            </div>

            {/* =====================================================
                HERO CONTENT
            ====================================================== */}

            <div className="hero-container">

                {/* =================================================
                    LEFT — MESSAGE
                ================================================= */}

                <div className="hero-content">

                    <div className="hero-eyebrow">
                        <span className="hero-eyebrow-dot" />

                        <span>
                            Your technology, simplified
                        </span>
                    </div>

                    <h1 className="hero-title">
                        Everything
                        <br />

                        <span className="hero-title-muted">
                            you need.
                        </span>

                        <br />

                        <span className="hero-title-accent">
                            All in one place.
                        </span>
                    </h1>

                    <p className="hero-description">
                        Discover technology worth bringing home.
                        Explore, compare and find the products that
                        fit the way you live, work and play.
                    </p>

                    <div className="hero-actions">
                        <button
                            type="button"
                            onClick={() => navigate("/products")}
                            className="hero-primary-button group"
                        >
                            Explore ByteStore

                            <ArrowRight
                                size={17}
                                strokeWidth={1.8}
                                className="transition-transform duration-300 group-hover:translate-x-1"
                            />
                        </button>
                    </div>

                    {/* =================================================
                        TRUST / VALUE
                    ================================================== */}

                    <div className="hero-values">

                        <div className="hero-value">
                            <span className="hero-value-line" />

                            <div>
                                <p className="font-semibold">
                                    🚚 Delivery
                                </p>

                                <p className="text-sm text-muted">
                                    Fast shipping
                                </p>
                            </div>
                        </div>

                        <div className="hero-value">
                            <span className="hero-value-line" />

                            <div>
                                <p className="font-semibold">
                                    ↩ Returns
                                </p>

                                <p className="text-sm text-muted">
                                    30 days
                                </p>
                            </div>
                        </div>

                        <div className="hero-value">
                            <span className="hero-value-line" />

                            <div>
                                <p className="font-semibold">
                                    🛡 Warranty
                                </p>

                                <p className="text-sm text-muted">
                                    Official warranty
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* =================================================
                        SMALL BRAND STATEMENT
                    ================================================== */}

                    <div className="hero-bottom">
                        <Sparkles
                            size={15}
                            strokeWidth={1.5}
                        />

                        <span>
                            Built for people who expect more
                            from their technology.
                        </span>
                    </div>

                </div>

                {/* =================================================
                    RIGHT — DRIFT WALL
                ================================================== */}

                <div className="hero-visual">

                    {/* Left blending edge */}

                    <div
                        className="hero-wall-fade-left"
                        aria-hidden="true"
                    />

                    {/* Bottom blending edge */}

                    <div
                        className="hero-wall-fade-bottom"
                        aria-hidden="true"
                    />

                    {/* Top blending edge */}

                    <div
                        className="hero-wall-fade-top"
                        aria-hidden="true"
                    />

                    {/* Drift Wall */}

                    <div className="hero-wall">
                        <DriftWall
                            items={wallItems}
                            columns={5}
                            tileWidth={220}
                            tileHeight={150}
                            gap={20}
                            radius={18}
                            tilt={11}
                            turn={-9}
                            roll={0}
                            perspective={1400}
                            depth={100}
                            speed={28}
                            direction="up"
                            variance={0.4}
                            parallax={0.35}
                            pauseOnHover={false}
                            lift={45}
                            fade={0.72}
                            dim={0.8}
                            overlayColor="#ffffff"
                            grayscale={false}
                        />
                    </div>

                </div>

            </div>
        </section>
    );
}

export default HeroSection;
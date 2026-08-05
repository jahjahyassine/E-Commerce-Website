import { FaStar } from "react-icons/fa6";
import { products } from "./products";
import { useEffect, useState } from "react";
import {
    SiApple, SiSamsung, SiGoogle, SiSony, SiJbl, SiDell, SiLenovo, SiAsus,
    SiAcer, SiHp, SiRazer, SiIntel, SiAmd, SiNvidia, SiMsi, SiCorsair,
    SiLg, SiXiaomi, SiBose, SiSonos,
} from "react-icons/si";

const BRAND_ICONS = [
    SiApple, SiSamsung, SiGoogle, SiSony, SiJbl, SiDell, SiLenovo, SiAsus,
    SiAcer, SiHp, SiRazer, SiIntel, SiAmd, SiNvidia, SiMsi, SiCorsair,
    SiLg, SiXiaomi, SiBose, SiSonos,
];

function BrandTickerGroup({ ariaHidden = false }) {
    return (
        <div className="flex gap-4 sm:gap-6 shrink-0 IconsGroup" aria-hidden={ariaHidden || undefined}>
            {BRAND_ICONS.map((Icon, i) => (
                <Icon key={i} aria-hidden="true" />
            ))}
        </div>
    );
}

function StarRating({ rating }) {
    const filled = Math.round(rating);
    return (
        <div className="flex items-center gap-1 text-minimal-yellow text-xs sm:text-sm" aria-label={`${rating} out of 5 stars`}>
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <FaStar
                        key={i}
                        className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${i < filled ? "opacity-100" : "opacity-25"}`}
                        aria-hidden="true"
                    />
                ))}
            </div>
        </div>
    );
}

function HeroSection() {
    const [currentProduct, setCurrentProduct] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        let timeoutId;
        const interval = setInterval(() => {
            setFade(false);
            timeoutId = setTimeout(() => {
                setCurrentProduct((prev) => (prev + 1) % products.length);
                setFade(true);
            }, 500);
        }, 6000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeoutId);
        };
    }, []);

    const product = products[currentProduct];
    const animation = fade
        ? "opacity-100 translate-y-0"
        : "opacity-0 translate-y-2";

    return (
        <section
            id="hero"
            className="w-full min-h-dvh text-foreground flex flex-col justify-between pt-16"
            aria-label="Featured products"
        >
            <div
                className="
                    w-full flex-1 min-h-0
                    flex flex-col justify-between p-4 sm:p-6
                    md:grid md:grid-cols-12 md:grid-rows-6 md:gap-4 md:p-8
                    lg:grid lg:grid-cols-8 lg:grid-rows-8 lg:gap-0 lg:p-6 lg:px-12
                "
            >
                <h1
                    className={`
                        text-center font-extrabold tracking-tight leading-none text-foreground
                        text-[clamp(1.75rem,5vw,2.5rem)]
                        transition-all duration-500 ${animation}
                        md:col-span-7 md:row-span-1 md:text-left md:text-[clamp(2.25rem,4vw,3.25rem)] md:self-center
                        lg:col-span-2 lg:col-start-1 lg:row-span-2 lg:row-start-2
                        lg:text-end lg:text-[clamp(2.5rem,3.5vw,4rem)] lg:self-center lg:pt-4
                    `}
                >
                    {product.name}
                </h1>

                <div
                    className={`
                        flex justify-center items-center gap-3 text-xs sm:text-sm text-muted italic tracking-widest
                        transition-all duration-500 ${animation}
                        md:col-span-5 md:row-span-1 md:justify-start
                        lg:hidden
                    `}
                >
                    <span>//{product.brand}.</span>
                    <span className="text-border-soft" aria-hidden="true">•</span>
                    <span>//{product.category}.</span>
                </div>

                <p
                    className={`
                        hidden lg:block
                        lg:col-span-2 lg:col-start-1 lg:row-span-1 lg:row-start-4
                        tracking-widest text-muted text-base xl:text-lg italic
                        text-end border-b border-border-soft pb-1 self-start justify-self-end
                        transition-all duration-500 ${animation}
                    `}
                >
                    //{product.brand}.
                </p>

                <p
                    className={`
                        hidden lg:block
                        lg:col-span-2 lg:col-start-7 lg:row-span-1 lg:row-start-3
                        tracking-wider text-muted text-base xl:text-lg italic
                        text-start self-start
                        transition-all duration-500 ${animation}
                    `}
                >
                    //{product.category}.
                </p>

                <div
                    className="
                        w-full flex-1 min-h-0 flex items-center justify-center py-2
                        md:col-span-5 md:col-start-8 md:row-span-5 md:row-start-1 md:py-0
                        lg:col-span-4 lg:col-start-3 lg:row-span-6 lg:row-start-2 lg:px-6
                    "
                >
                    <img
                        src={product.image}
                        alt={product.name}
                        className={`
                            max-h-[32vh] md:max-h-[55vh] lg:max-h-[60vh]
                            w-full object-contain drop-shadow-2xl
                            transition-all duration-700
                            ${fade ? "opacity-100 scale-100" : "opacity-0 scale-95"}
                        `}
                    />
                </div>

                <div
                    className={`
                        hidden sm:flex flex-col justify-center gap-1.5 sm:gap-3
                        border-l-2 border-border pl-3 sm:pl-4
                        transition-all duration-500 ${animation}
                        md:col-span-7 md:row-span-2 md:row-start-2 md:self-center
                        lg:col-span-2 lg:col-start-1 lg:row-span-3 lg:row-start-5
                        lg:justify-self-end lg:text-end lg:border-l-0 lg:border-r-2 lg:pl-0 lg:pr-4
                    `}
                >
                    {product.highlights.map((item) => (
                        <p
                            key={item}
                            className="
                                text-muted font-playfair hover:text-foreground duration-300
                                text-xs sm:text-base md:text-xl lg:text-2xl xl:text-3xl
                                line-clamp-1
                            "
                        >
                            {item}
                        </p>
                    ))}
                </div>

                {product.badge && (
                    <p
                        className={`
                            hidden lg:block
                            lg:col-span-2 lg:col-start-7 lg:row-span-1 lg:row-start-2
                            text-xl xl:text-2xl tracking-wider font-cormorant font-bold text-foreground
                            self-center
                            transition-all duration-500 ${animation}
                        `}
                    >
                        {product.badge}
                    </p>
                )}

                <div
                    className={`
                        flex flex-col gap-1 sm:gap-3 font-cormorant
                        text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl
                        transition-all duration-500 ${animation}
                        md:col-span-7 md:row-span-2 md:row-start-4 md:self-center
                        lg:col-span-2 lg:col-start-7 lg:row-span-2 lg:row-start-4 lg:self-start lg:pr-4
                    `}
                >
                    <div className="flex justify-between italic border-b border-border pb-1 font-semibold text-foreground">
                        {product.hook.map((item) => (
                            <p key={item}>{item}</p>
                        ))}
                    </div>

                    <div className="flex flex-col gap-0.5 sm:gap-1 italic text-muted">
                        {product.description.map((item) => (
                            <p key={item} className="border-b border-border-soft pb-0.5 line-clamp-1">
                                {item}
                            </p>
                        ))}
                    </div>
                </div>

                <div
                    className={`
                        flex flex-col gap-2 sm:gap-3 items-center
                        transition-all duration-500 ${animation}
                        md:col-span-7 md:row-span-1 md:row-start-6 md:flex-row md:justify-between md:items-center
                        lg:col-span-2 lg:col-start-7 lg:row-span-2 lg:row-start-6
                        lg:flex-col lg:items-start lg:justify-center
                    `}
                >
                    <div className="flex items-center justify-between w-full md:w-auto md:flex-col md:items-start">
                        <span className="text-muted text-[10px] sm:text-xs uppercase tracking-widest md:hidden lg:inline">
                            Starting at
                        </span>
                        <p className="text-minimal-green text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-semibold">
                            <span className="font-cormorant text-xl sm:text-2xl md:text-3xl">$</span>
                            {product.price}
                        </p>
                        <div className="flex items-center gap-1">
                            <StarRating rating={product.rating} />
                            <span className="text-muted text-[10px] sm:text-xs ml-1">
                                {product.rating} ({product.reviews.toLocaleString()})
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="
                            w-full md:w-auto lg:w-full
                            bg-primary hover:bg-primary-hover text-inverse
                            py-2.5 px-6 md:py-3 md:px-8
                            text-sm sm:text-base font-semibold rounded-full
                            shadow-elevated hover:scale-[1.02] active:scale-[0.98]
                            transition-all duration-300 shrink-0
                            focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus
                        "
                    >
                        Add to Cart
                    </button>
                </div>
            </div>

            <div
                className="
                    w-full shrink-0 flex items-center
                    text-xl sm:text-2xl md:text-3xl lg:text-4xl text-muted
                    bg-glass/80 border-t border-border/20
                    px-4 py-2 sm:py-3 overflow-hidden
                "
                aria-label="Featured brands"
            >
                <BrandTickerGroup />
                <BrandTickerGroup ariaHidden />
            </div>
        </section>
    );
}

export default HeroSection;

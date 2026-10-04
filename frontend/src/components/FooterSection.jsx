import Browsing from "../assets/browsing.jpg";
import Ordering from "../assets/ordering.jpg";
import Packaging from "../assets/packaging.jpg";
import Footer from "./Footer";

const STEPS = [
    {
        id: 1,
        title: "Browse",
        label: "Step 01",
        description: "Discover products curated for your needs.",
        image: Browsing,
    },
    {
        id: 2,
        title: "Order",
        label: "Step 02",
        description: "Secure checkout and a seamless shopping experience.",
        image: Ordering,
    },
    {
        id: 3,
        title: "Receive",
        label: "Step 03",
        description: "Premium packaging delivered to your door.",
        image: Packaging,
    },
];

function FooterSection() {
    return (
        <section
            id="experience"
            className="w-full pt-16 sm:pt-20"
            aria-labelledby="experience-heading"
        >
            <div className="px-4 sm:px-6 lg:px-10 mb-10 sm:mb-14">
                <header className="text-center mb-8 sm:mb-12">
                    <p className="text-sm uppercase tracking-[0.35em] text-muted">
                        A Seamless Experience
                    </p>

                    <h2
                        id="experience-heading"
                        className="mt-3 text-4xl sm:text-5xl font-cormorant font-bold text-foreground"
                    >
                        How ByteStore Works
                    </h2>
                </header>

                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
                    {STEPS.map((step) => (
                        <article
                            key={step.id}
                            className="
                                group relative h-[260px] sm:h-[300px] lg:h-[340px]
                                overflow-hidden rounded-3xl
                                border border-border-soft
                                transition-all duration-500
                                hover:-translate-y-1 hover:border-accent/50
                            "
                        >
                            <img
                                src={step.image}
                                alt=""
                                loading="lazy"
                                className="
                                    w-full h-full object-cover
                                    transition-transform duration-700
                                    group-hover:scale-105
                                "
                            />

                            {/* Dark scrim so the text stays readable over the photo */}
                            <div className="absolute inset-0 bg-gradient-to-t from-background-darker/90 via-background-darker/35 to-transparent" />

                            <div className="absolute bottom-0 left-0 p-5 sm:p-6 text-left">
                                <p className="text-sm uppercase tracking-[0.3em] text-accent">
                                    {step.label}
                                </p>

                                <h3 className="text-3xl sm:text-4xl font-cormorant font-bold text-foreground tracking-wide">
                                    {step.title}
                                </h3>

                                <p className="mt-2 text-foreground/80 text-sm sm:text-base">
                                    {step.description}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>

            <Footer />
        </section>
    );
}

export default FooterSection;
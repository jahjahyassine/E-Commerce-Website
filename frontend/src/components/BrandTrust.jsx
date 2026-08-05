import {
    SiApple, SiSamsung, SiGoogle, SiSony, SiJbl, SiDell, SiLenovo, SiAsus,
    SiAcer, SiHp, SiRazer, SiIntel, SiAmd, SiNvidia, SiMsi, SiCorsair,
    SiLg, SiXiaomi, SiBose, SiSonos, SiOneplus, SiNikon, SiPanasonic, SiNetgear,
} from "react-icons/si";

const BRANDS = [
    { name: "Apple", icon: SiApple },
    { name: "Samsung", icon: SiSamsung },
    { name: "Google", icon: SiGoogle },
    { name: "Sony", icon: SiSony },
    { name: "JBL", icon: SiJbl },
    { name: "Dell", icon: SiDell },
    { name: "Lenovo", icon: SiLenovo },
    { name: "ASUS", icon: SiAsus },
    { name: "Acer", icon: SiAcer },
    { name: "HP", icon: SiHp },
    { name: "Razer", icon: SiRazer },
    { name: "Intel", icon: SiIntel },
    { name: "AMD", icon: SiAmd },
    { name: "NVIDIA", icon: SiNvidia },
    { name: "MSI", icon: SiMsi },
    { name: "Corsair", icon: SiCorsair },
    { name: "LG", icon: SiLg },
    { name: "Xiaomi", icon: SiXiaomi },
    { name: "Bose", icon: SiBose },
    { name: "Sonos", icon: SiSonos },
    { name: "OnePlus", icon: SiOneplus },
    { name: "Nikon", icon: SiNikon },
    { name: "Panasonic", icon: SiPanasonic },
    { name: "NETGEAR", icon: SiNetgear },
];

function BrandTrust() {
    return (
        <section
            id="brands"
            className="w-full py-16 sm:py-20 px-4 sm:px-6 lg:px-10"
            aria-labelledby="brands-heading"
        >
            <header className="text-center mb-10 sm:mb-14">
                <p className="text-sm uppercase tracking-[0.35em] text-muted">
                    Trusted Partners
                </p>
                <h2
                    id="brands-heading"
                    className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-cormorant font-bold text-foreground"
                >
                    Brands We Carry
                </h2>
                <p className="mt-4 max-w-2xl mx-auto text-muted text-base sm:text-lg">
                    We partner with the world&apos;s most trusted technology brands
                    to bring you products that combine innovation, reliability,
                    and exceptional performance.
                </p>
            </header>

            <div
                className="
                    max-w-7xl mx-auto
                    grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8
                    gap-3 sm:gap-4
                "
            >
                {BRANDS.map(({ name, icon: Icon }) => (
                    <div
                        key={name}
                        title={name}
                        className="
                            h-16 sm:h-20 lg:h-24
                            rounded-xl
                            border border-border-soft
                            bg-background/70 backdrop-blur-md
                            flex items-center justify-center
                            transition-all duration-300
                            hover:-translate-y-0.5 hover:border-border hover:bg-background-secondary
                            group
                        "
                    >
                        <Icon
                            aria-label={name}
                            className="
                                text-2xl sm:text-3xl lg:text-4xl
                                text-muted
                                transition-all duration-300
                                group-hover:text-foreground group-hover:scale-110
                            "
                        />
                    </div>
                ))}
            </div>
        </section>
    );
}

export default BrandTrust;

import DotField from "../components/animation/DotField";
import BestSellers from "../components/BestSellers";
import BrandTrust from "../components/BrandTrust";
import FeaturedCategories from "../components/FeaturedCategories";
import FooterSection from "../components/FooterSection";
import HeroSection from "../components/HeroSection";
import Navbar from "../components/Navbar";

function Landing() {
    return (
        <div className="relative min-h-screen">
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

            <main className="relative z-10">
                <HeroSection />
                <FeaturedCategories />
                <BestSellers />
                <BrandTrust />
                <FooterSection />
            </main>
        </div>
    );
}

export default Landing;

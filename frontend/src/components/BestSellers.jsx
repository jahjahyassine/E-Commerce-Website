import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Star, ShoppingBag, TrendingUp } from "lucide-react";

import DepthCarousel from "./animation/DepthCarousel";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8000";

async function fetchProducts() {
  const response = await fetch(`${BASE_URL}/products`);
  if (!response.ok) throw new Error("Failed to retrieve products");
  return response.json();
}

// Best sellers = highest rating, then most reviews as tiebreaker
function getBestSellers(products) {
  return [...products]
    .filter((p) => p?.is_active !== false)
    .sort((a, b) => {
      const ratingDiff = Number(b?.average_rating ?? 0) - Number(a?.average_rating ?? 0);
      if (ratingDiff !== 0) return ratingDiff;
      return Number(b?.count_reviews ?? 0) - Number(a?.count_reviews ?? 0);
    })
    .slice(0, 6);
}

function getProductImage(product) {
  if (product?.media?.length > 0) return product.media[0].media_url;

  const variants = product?.product_variants ?? [];
  const activeWithMedia = variants.find((v) => v?.is_active && v?.media?.length > 0);
  if (activeWithMedia) return activeWithMedia.media[0].media_url;

  const anyWithMedia = variants.find((v) => v?.media?.length > 0);
  return anyWithMedia?.media?.[0]?.media_url ?? null;
}

// Cheapest active, in-stock variant
function getBestVariant(product) {
  const inStock = (product?.product_variants ?? []).filter(
    (v) => v?.is_active && Number(v?.inventory?.quantity ?? 0) > 0
  );
  if (!inStock.length) return null;
  return inStock.sort((a, b) => Number(a?.price ?? 0) - Number(b?.price ?? 0))[0];
}

function toCarouselItem(product) {
  const image = getProductImage(product);
  const variant = getBestVariant(product);
  if (!image || !variant) return null;

  const price = Number(variant?.price ?? 0);
  const discount = Number(variant?.discount_percentage ?? 0);

  return {
    id: product.id,
    image,
    alt: product.name,
    brand: product?.brand?.name ?? "Brand",
    name: product.name,
    category: product?.category?.name ?? "",
    rating: Number(product?.average_rating ?? 0),
    reviews: Number(product?.count_reviews ?? 0),
    price: price * (1 - discount / 100),
    originalPrice: discount > 0 ? price : null,
    discount,
  };
}

function StateWrapper({ children }) {
  return (
    <section id="bestsellers" className="w-full px-6 py-24" aria-label="Best sellers">
      <div className="mx-auto max-w-[1600px] text-center">{children}</div>
    </section>
  );
}

function BestSellers() {
  const navigate = useNavigate();

  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const carouselItems = getBestSellers(products).map(toCarouselItem).filter(Boolean);

  if (isLoading) {
    return (
      <section id="bestsellers" className="w-full px-6 py-20 md:py-24" aria-label="Best sellers">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <div className="h-4 w-24 animate-pulse rounded bg-[#17242B]/10" />
              <div className="h-12 w-72 animate-pulse rounded bg-[#17242B]/10" />
              <div className="h-4 w-96 max-w-full animate-pulse rounded bg-[#17242B]/10" />
            </div>
            <div className="h-10 w-36 animate-pulse rounded-xl bg-[#17242B]/10" />
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="flex justify-center">
              <div className="h-[410px] w-[300px] animate-pulse rounded-3xl bg-[#17242B]/10" />
            </div>
            <div className="hidden justify-center lg:flex">
              <div className="h-[410px] w-[300px] animate-pulse rounded-3xl bg-[#17242B]/10" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <StateWrapper>
        <div className="rounded-3xl border border-[#17242B]/10 bg-[#F8FAFB] px-8 py-16">
          <p className="text-sm font-medium text-[#68777E]">Failed to load best sellers.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 text-sm font-semibold text-[#567C8D] transition hover:text-[#496D7E]"
          >
            Try again →
          </button>
        </div>
      </StateWrapper>
    );
  }

  if (carouselItems.length === 0) {
    return (
      <StateWrapper>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#567C8D]">
          Our selection
        </p>
        <h2 className="mt-3 font-cormorant text-5xl font-semibold text-[#17242B]">
          Best Sellers
        </h2>
        <p className="mt-3 text-sm text-[#68777E]">Our highest-rated products</p>
        <p className="mt-12 text-sm text-[#89979E]">No products available.</p>
      </StateWrapper>
    );
  }

  return (
    <section
      id="bestsellers"
      className="relative w-full overflow-hidden px-6 py-20 md:py-24"
      aria-label="Best sellers"
    >
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[750px] w-[750px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#567C8D]/[0.045] blur-3xl" />
        <div className="absolute -right-40 top-20 h-[400px] w-[400px] rounded-full bg-[#F5E4C8]/20 blur-3xl" />
        <div className="absolute -left-40 bottom-0 h-[350px] w-[350px] rounded-full bg-[#567C8D]/[0.025] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1600px]">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-8 border-b border-[#17242B]/10 pb-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl lg:w-1/2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#567C8D]">
                Our selection
              </span>
              <span className="h-px w-10 bg-[#567C8D]/30" />
            </div>
            <h2 className="mt-3 font-cormorant text-5xl font-semibold leading-none tracking-tight text-[#17242B] sm:text-6xl lg:text-7xl">
              Best Sellers
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[#68777E] md:text-base">
              Discover the products customers are choosing most. Highly rated, carefully
              selected, and ready for your next upgrade.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#567C8D]/10">
                <TrendingUp size={17} className="text-[#567C8D]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#17242B]">Customer favorites</p>
                <p className="mt-0.5 text-xs text-[#89979E]">Based on ratings & reviews</p>
              </div>
            </div>
          </div>

          
        </div>

        {/* Intro text + carousel */}
        <div className="grid min-h-[600px] w-full grid-cols-1 overflow-hidden rounded-[2rem] border border-[#17242B]/[0.07] bg-white/30 backdrop-blur-[2px] lg:grid-cols-2">
          <div className="flex min-h-[600px] flex-col justify-center border-b border-[#17242B]/[0.07] px-8 py-12 md:px-12 lg:border-b-0 lg:border-r lg:px-16 xl:px-20">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#567C8D]">
              Handpicked for you
            </span>
            <h3 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-[#17242B] md:text-5xl">
              See our best sellers
            </h3>
            <p className="mt-5 max-w-md text-md leading-7 text-[#68777E]">
              Swipe through the products our customers keep coming back for.
            </p>
          </div>

          <div className="relative flex min-h-[600px] items-center justify-center">
            <DepthCarousel
              items={carouselItems}
              cardWidth={390}
              cardHeight={520}
              radius={28}
              depth={180}
              spread={55}
              tilt={12}
              tiltDirection="right"
              perspective={1600}
              visibleCards={2}
              falloff={0.15}
              blur={3}
              duration={700}
              ease="power3.out"
              autoplay
              autoplayDelay={4500}
              loop
              showControls
              showIndicators
            />
          </div>
        </div>

        {/* Bottom info bar */}
        <div className="mt-8 flex flex-col gap-6 border-t border-[#17242B]/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            <div className="flex items-center gap-2">
              <Star size={15} fill="currentColor" className="text-[#F5B942]" />
              <span className="text-xs font-medium text-[#68777E]">Highly rated</span>
            </div>
            <div className="flex items-center gap-2">
              <ShoppingBag size={15} className="text-[#567C8D]" />
              <span className="text-xs font-medium text-[#68777E]">Trusted products</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-[#567C8D]" />
              <span className="text-xs font-medium text-[#68777E]">Cash on delivery</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/products")}
            className="group flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#567C8D]"
          >
            Explore the collection
            <ArrowRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
        </div>
      </div>
    </section>
  );
}

export default BestSellers;
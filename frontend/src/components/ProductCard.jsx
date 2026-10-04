import { FaStar } from "react-icons/fa6";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function ProductCard({ product }) {
    const variants = product.product_variants || [];

    // Use the active variant with the lowest price
    const bestVariant = [...variants]
        .filter((variant) => variant.is_active !== false)
        .sort(
            (a, b) =>
                Number(a.price) - Number(b.price)
        )[0];

    const originalPrice = Number(
        bestVariant?.price ?? product.min_price ?? 0
    );

    const discount = Number(
        bestVariant?.discount_percentage ?? 0
    );

    const finalPrice =
        discount > 0
            ? originalPrice * (1 - discount / 100)
            : originalPrice;

    const filledStars = Math.round(
        product.average_rating || 0
    );

    // ==================================
    // IMAGE
    // ==================================

    // First valid product-level media
    const productMedia =
        product.media?.find(
            (media) => media?.media_url
        ) ?? null;

    // If product has no media, find the first valid
    // media from any variant
    const variantMedia =
        variants
            .flatMap((variant) => variant.media || [])
            .find(
                (media) => media?.media_url
            ) ?? null;

    // Use whichever image is available
    const imageMedia = productMedia ?? variantMedia;

    const imageUrl = imageMedia?.media_url ?? null;

    const hasImage = Boolean(imageUrl);

    return (
        <Link
            className="
                group
                relative
                flex flex-col
                h-[390px]
                rounded-2xl
                border border-border-soft
                bg-card
                text-foreground
                overflow-hidden
                shadow-product
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-coral/35
                hover:shadow-elevated
            "
            to={`/products/${product.id}`}
        >
            {/* ==================================
                IMAGE
            ================================== */}

            <div
                className={`
                    relative
                    h-[230px]
                    overflow-hidden
                    ${hasImage
                        ? "bg-white"
                        : "bg-gradient-to-b from-surface to-card-dark"
                    }
                `}
            >
                {/* Subtle coral ambient glow */}
                {hasImage && (
                    <div
                        className="
                            pointer-events-none
                            absolute
                            inset-0
                            bg-[radial-gradient(circle_at_50%_60%,rgba(255,110,128,0.12),transparent_65%)]
                            opacity-0
                            transition-opacity
                            duration-300
                            group-hover:opacity-100
                        "
                        aria-hidden="true"
                    />
                )}

                {/* Fallback glow for cards without an image */}
                {!hasImage && (
                    <div
                        className="
                            pointer-events-none
                            absolute
                            inset-0
                            bg-[radial-gradient(circle_at_50%_50%,rgba(255,110,128,0.08),transparent_65%)]
                        "
                        aria-hidden="true"
                    />
                )}

                {/* Product image */}
                {hasImage ? (
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className="
                            relative
                            z-[1]
                            w-full
                            h-full
                            object-contain
                            p-4
                            mix-blend-multiply
                            transition-transform
                            duration-300
                            ease-out
                            group-hover:scale-[1.04]
                        "
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-sm font-medium text-muted">
                            No image available
                        </span>
                    </div>
                )}

                {/* Bottom gradient — connects image to card content */}
                <div
                    className="
                        pointer-events-none
                        absolute
                        inset-x-0
                        bottom-0
                        h-12
                        z-[2]
                        bg-gradient-to-t
                        from-card/80
    via-card/40
    to-transparent
                    "
                    aria-hidden="true"
                />

                {/* ==================================
                    DISCOUNT BADGE
                ================================== */}

                {discount > 0 && (
                    <span
                        className="
                            absolute
                            top-3
                            left-3
                            z-10
                            rounded-full
                            bg-coral/10
                            border
                            border-coral/25
                            px-2.5
                            py-1
                            text-xs
                            font-bold
                            text-coral
                            backdrop-blur-sm
                        "
                    >
                        -{discount}%
                    </span>
                )}

                {/* ==================================
                    BRAND BADGE
                ================================== */}

                {product.brand?.name && (
                    <span
                        className="
                            absolute
                            top-3
                            right-3
                            z-10
                            rounded-full
                            bg-background-dark/80
                            border
                            border-white/10
                            px-2.5
                            py-1
                            text-xs
                            font-semibold
                            text-foreground
                            backdrop-blur
                            transition-all
                            duration-300
                            group-hover:border-coral/25
                            group-hover:text-coral
                        "
                    >
                        {product.brand.name}
                    </span>
                )}

                {/* Bottom coral accent */}
                <div
                    className="
                        absolute
                        bottom-0
                        left-1/2
                        -translate-x-1/2
                        z-[3]
                        w-12
                        h-0.5
                        rounded-full
                        bg-coral
                        opacity-0
                        transition-all
                        duration-300
                        group-hover:opacity-100
                        group-hover:w-20
                    "
                    aria-hidden="true"
                />
            </div>

            {/* ==================================
                CONTENT
            ================================== */}

            <div className="p-4 flex flex-col flex-1">

                {/* NAME + PRICE */}
                <div className="flex items-start justify-between gap-3">
                    <h3
                        className="
                            text-base
                            font-bold
                            leading-tight
                            line-clamp-2
                            text-foreground
                            transition-colors
                            duration-300
                            group-hover:text-coral
                        "
                    >
                        {product.name}
                    </h3>

                    {/* PRICE */}
                    <div className="text-right whitespace-nowrap">
                        <p className="text-success text-base font-bold">
                            {finalPrice.toFixed(2)} DH
                        </p>

                        {discount > 0 && (
                            <span className="text-sm text-muted line-through">
                                {originalPrice.toFixed(2)} DH
                            </span>
                        )}
                    </div>
                </div>

                {/* ==================================
                    RATING
                ================================== */}

                <div className="flex items-center mt-2.5">
                    <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map(
                            (_, index) => (
                                <FaStar
                                    key={index}
                                    className={`
                                        text-sm
                                        ${index < filledStars
                                            ? "text-highlight"
                                            : "text-border"
                                        }
                                    `}
                                />
                            )
                        )}
                    </div>

                    <span className="text-sm ml-2 font-bold text-foreground">
                        {Number(
                            product.average_rating || 0
                        ).toFixed(1)}
                    </span>

                    <span className="text-muted text-sm ml-2">
                        ({product.count_reviews || 0} reviews)
                    </span>
                </div>

                {/* ==================================
                    VIEW PRODUCT
                ================================== */}

                <div
                    className="
                        mt-auto
                        flex
                        items-center
                        justify-center
                        gap-2
                        rounded-full
                        border
                        border-accent/50
                        py-2.5
                        text-sm
                        font-bold
                        text-accent
                        transition-all
                        duration-300
                        group-hover:border-accent
                        group-hover:bg-accent
                        group-hover:text-inverse
                    "
                >
                    View Product

                    <ArrowRight
                        size={15}
                        strokeWidth={2}
                        className="
                            transition-transform
                            duration-300
                            group-hover:translate-x-1
                        "
                    />
                </div>
            </div>
        </Link>
    );
}

export default ProductCard;
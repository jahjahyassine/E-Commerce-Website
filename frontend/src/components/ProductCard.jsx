import { FaStar } from "react-icons/fa6";
import { ArrowRight } from "lucide-react";

import { Link } from "react-router-dom";

function ProductCard({ product }) {
    const variants = product.product_variants || [];

    // Use the active variant with the lowest price
    const bestVariant = [...variants]
        .filter((variant) => variant.is_active !== false)
        .sort((a, b) => Number(a.price) - Number(b.price))[0];

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

    const filledStars = Math.round(product.average_rating || 0);

    return (
        <Link
            className="
                group
                relative
                flex flex-col
                h-[390px]
                rounded-2xl
                border border-border-soft
                bg-card text-foreground
                overflow-hidden
                shadow-product
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-accent/40
                hover:shadow-elevated
            "
            to={`/products/${product.id}`}
        >
            {/* ==================================
                Image
            ================================== */}

            <div className={`relative h-[230px] overflow-hidden
            ${product.media?.[0]?.media_url ? "bg-white bg-gradient-to-t from-card-dark to-transparent " : "bg-gradient-to-b from-surface to-card-dark"}
            `}>

                {/* Teal glow behind the product on hover */}
                <div
                    className="
                        pointer-events-none
                        absolute inset-0
                        bg-[radial-gradient(circle_at_50%_60%,rgba(111,167,163,0.18),transparent_65%)]
                        opacity-0
                        transition-opacity
                        duration-300
                        group-hover:opacity-100
                    "
                    aria-hidden="true"
                />

                <img
                    src={product.media?.[0]?.media_url}
                    alt={product.name}
                    className="
                        relative
                        w-full h-full
                        object-contain
                        p-4
                        group-hover:scale-[1.04]
                        transition-transform
                        duration-300
                        mix-blend-multiply
                        ease-out
                    "
                />

                {/* Discount badge */}
                {discount > 0 && (
                    <span
                        className="
                            absolute top-3 left-3 z-10
                            rounded-full
                            bg-danger-solid
                            px-2.5 py-1
                            text-xs font-bold
                            text-foreground
                        "
                    >
                        -{discount}%
                    </span>
                )}

                {/* Brand badge */}
                {product.brand?.name && (
                    <span
                        className="
                            absolute top-3 right-3 z-10
                            rounded-full
                            bg-background-dark/70
                            px-2.5 py-1
                            text-xs font-medium
                            text-muted
                            backdrop-blur
                        "
                    >
                        {product.brand.name}
                    </span>
                )}
            </div>

            {/* ==================================
                Content
            ================================== */}

            <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-bold leading-tight line-clamp-2 text-foreground">
                        {product.name}
                    </h3>

                    {/* Price */}

                    <div className="text-right whitespace-nowrap">
                        <p className="text-success text-base font-bold">
                            {finalPrice.toFixed(2)} DH
                        </p>

                        {discount > 0 && (
                            <span className="text-xs text-danger/80 line-through">
                                {originalPrice.toFixed(2)} DH
                            </span>
                        )}
                    </div>
                </div>

                {/* Rating */}

                <div className="flex items-center mt-2">
                    <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <FaStar
                                key={index}
                                className={`text-sm ${
                                    index < filledStars
                                        ? "text-highlight"
                                        : "text-border"
                                }`}
                            />
                        ))}
                    </div>

                    <span className="text-sm ml-2 font-bold text-foreground">
                        {product.average_rating}
                    </span>

                    <span className="text-subtle text-xs ml-2">
                        ({product.count_reviews} reviews)
                    </span>
                </div>

                {/* Button: outlined, fills with teal when the card is hovered */}

                <div
                    className="
                        mt-auto
                        flex items-center justify-center gap-2
                        rounded-full
                        border border-accent/50
                        py-2
                        text-sm font-bold
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
                        className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                </div>
            </div>
        </Link>
    );
}

export default ProductCard;
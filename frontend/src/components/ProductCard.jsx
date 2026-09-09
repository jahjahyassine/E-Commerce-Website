import { FaStar } from "react-icons/fa6";

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

    return (
        <Link
            className="
                group
                flex flex-col
                bg-card text-foreground
                h-[390px]
                rounded-3xl
                border border-border
                overflow-hidden
                shadow-product
            "
            to={`/products/${product.id}`}
        >
            <div className="h-[230px] overflow-hidden">
                <img
                    src={product.media?.[0]?.media_url}
                    alt={product.name}
                    className="
                        w-full h-full
                        object-contain
                        group-hover:scale-[1.03]
                        transition-transform
                        duration-300
                        ease-out
                    "
                />
            </div>

            <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-bold leading-tight line-clamp-2">
                        {product.name}
                    </h3>

                    <div className="text-right whitespace-nowrap">
                        {discount > 0 ? (
                            <>
                                <p className="text-minimal-green text-base font-bold">
                                    {finalPrice.toFixed(2)} DH
                                </p>

                                <div className="flex items-center justify-end gap-1">
                                    <span className="text-xs text-muted line-through">
                                        {originalPrice.toFixed(2)}
                                    </span>

                                    <span className="text-xs font-bold text-red-500">
                                        -{discount}%
                                    </span>
                                </div>
                            </>
                        ) : (
                            <p className="text-minimal-green text-base font-bold">
                                {originalPrice.toFixed(2)} DH
                            </p>
                        )}
                    </div>
                </div>

                <p className="text-sm text-muted mt-1">
                    {product.brand?.name}
                </p>

                <div className="flex items-center mt-2">
                    <div className="flex items-center text-minimal-yellow">
                        {Array.from({
                            length: Math.round(
                                product.average_rating || 0
                            ),
                        }).map((_, index) => (
                            <FaStar
                                key={index}
                                className="text-sm"
                            />
                        ))}
                    </div>

                    <span className="text-sm ml-1 font-bold">
                        {product.average_rating}
                    </span>

                    <span className="text-muted text-xs ml-2">
                        ({product.count_reviews} reviews)
                    </span>
                </div>

                <div
                    className="
                        mt-auto
                        bg-primary
                        hover:bg-primary-hover
                        text-inverse
                        font-bold
                        text-sm
                        text-center
                        py-2
                        rounded-full
                        transition-colors
                        duration-300
                    "
                >
                    View Product
                </div>
            </div>
        </Link>
    );
}

export default ProductCard;
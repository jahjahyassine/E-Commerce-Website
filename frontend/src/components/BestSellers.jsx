import { bestSellers } from "./BestSellersCollection";

function BestSellers() {
    const pages = [
        bestSellers.slice(0, 6),
        bestSellers.slice(6, 12),
    ];

    return (
        <section
            id="bestsellers"
            className="
                h-screen
                w-full flex
                text-foreground
                overflow-x-scroll
                snap-x
                snap-mandatory
                scroll-smooth scrollbar-none
            "
            aria-label="Best sellers"
        >
            {pages.map((page, pageIndex) => (
                <div
                    key={pageIndex}
                    className="
                        h-screen
                        min-w-full
                        snap-start
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        lg:grid-cols-3
                        grid-rows-6
                        sm:grid-rows-3
                        lg:grid-rows-2
                        gap-10
                        px-10
                        pt-15
                    "
                >
                    {page.map((collection) => (
                        <article
                            key={collection.id}
                            className="
                                h-full
                                w-full
                                overflow-hidden
                                rounded-2xl
                                border border-border-soft
                                bg-background-black/70
                                backdrop-blur-xl
                                transition-all duration-300
                                hover:scale-[1.02]
                                hover:border-border
                                flex
                                flex-col relative
                            "
                        >
                            <div className="
                                flex-1
                                flex
                                items-center
                                justify-center
                                min-h-0
                            ">
                                <img
                                    src={collection.image}
                                    alt={collection.name}
                                    className="
                                        object-contain
                                        w-full
                                        h-full
                                        max-h-[180px]
                                        transition-transform
                                        duration-500
                                        hover:scale-105
                                    "
                                />
                                <button
                                    type="button"
                                    aria-label={`Add ${collection.name} to cart`}
                                    className="
                                        absolute
                                        bottom-20
                                        right-6
                                        bg-minimal-green
                                        text-inverse
                                        text-lg
                                        font-bold
                                        lg:px-6 md:px-4
                                        py-2
                                        rounded-full
                                        z-10
                                        cursor-pointer
                                    "
                                >
                                    Add to Cart
                                </button>
                            </div>

                            <div className="
                                px-3 py-2 mt-2
                                space-y-2 bg-background
                            ">
                                <p className="
                                    text-sm
                                    text-muted
                                ">
                                    {collection.brand}
                                </p>

                                <h3 className="
                                    md:text-lg lg:text-xl
                                    font-semibold
                                    text-foreground
                                ">
                                    {collection.name}
                                </h3>

                                <div className="
                                    flex
                                    items-center
                                    justify-between
                                ">
                                    <span className="
                                        text-minimal-yellow
                                        text-sm
                                    ">
                                        ★ {collection.rating}
                                    </span>

                                    <span className="
                                        font-bold
                                        text-minimal-green
                                    ">
                                        ${collection.price}
                                    </span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            ))}
        </section>
    );
}

export default BestSellers;

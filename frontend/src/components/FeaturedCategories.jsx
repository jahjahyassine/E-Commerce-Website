import { collections } from "./categories";

function FeaturedCategories() {
    const pages = [
        collections.slice(0, 4),
        collections.slice(4, 8),
    ];

    return (
        <section
            id="categories"
            className="
                h-screen
                w-full
                text-foreground
                overflow-y-scroll
                snap-y
                snap-mandatory
                scroll-smooth
            "
            aria-label="Featured collections"
        >
            {pages.map((page, pageIndex) => (
                <div
                    key={pageIndex}
                    className="
                        h-screen
                        snap-start
                        grid
                        grid-cols-1
                        md:grid-cols-2
                        grid-rows-4
                        md:grid-rows-2
                        pt-15 border border-border
                    "
                >
                    {page.map((collection) => (
                        <article
                            key={collection.id}
                            className="
                                overflow-hidden
                                border border-border-soft
                                hover:border-border
                                bg-background-dark/70
                                rounded-2xl
                                backdrop-blur-xl
                                transition-all duration-300
                                flex
                                flex-col
                                lg:flex-row
                                p-6
                            "
                        >
                            <div
                                className="
                                    order-2
                                    lg:order-1
                                    flex-1
                                    min-w-0
                                    flex
                                    flex-col
                                    justify-center gap-2
                                "
                            >
                                <h3 className="
                                    text-2xl font-bold tracking-wide
                                    lg:text-3xl
                                    text-inverse
                                ">
                                    {collection.title}
                                </h3>

                                <p className="
                                    mt-3
                                    text-sm
                                    lg:text-base
                                    text-inverse/80
                                ">
                                    {collection.description}
                                </p>

                                <button
                                    type="button"
                                    className="
                                        md:self-end lg:self-center
                                        bg-glass backdrop-blur-xl
                                        w-fit
                                        px-5
                                        py-2 mt-4
                                        rounded-full
                                        border
                                        border-border-soft/30 font-semibold
                                        bg-primary-hover text-inverse
                                    "
                                >
                                    Explore Collection
                                </button>
                            </div>

                            <div
                                className="
                                    order-1
                                    lg:order-2
                                    flex-1
                                    min-h-0
                                    flex
                                    items-center
                                    justify-center
                                    mt-4 mb-4
                                "
                            >
                                <img
                                    src={collection.image}
                                    alt={collection.title}
                                    className="
                                        object-contain

                                        max-h-[160px]
                                        sm:max-h-[220px]
                                        md:max-h-[250px]
                                        lg:max-h-[320px]
                                        xl:max-h-[380px]

                                        max-w-[90%]
                                        lg:max-w-full

                                        transition-transform
                                        duration-500
                                        hover:scale-105
                                    "
                                />
                            </div>
                        </article>
                    ))}
                </div>
            ))}
        </section>
    );
}

export default FeaturedCategories;

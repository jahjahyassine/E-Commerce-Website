import AccordionGallery from "../components/animation/AccordionGallery";

function FeaturedCategories() {
    // const items = collections.map((collection) => ({
    //     image: collection.image,
    //     label: collection.title,
    //     alt: collection.title,
    //     link: "#",
    //     collection,
    // }));

    return (
        <section className="h-screen">

        </section>
        // <section
        //     id="categories"
        //     className="
        //         min-h-screen
        //         w-full
        //         px-6
        //         py-20
        //         text-foreground
        //         flex
        //         flex-col
        //         justify-center
        //     "
        //     aria-label="Featured collections"
        // >
        //     <div className="w-full max-w-7xl mx-auto">

        //         {/* Header */}
        //         <div className="mb-8">
        //             <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">
        //                 Explore
        //             </p>

        //             <h2
        //                 className="
        //                     mt-2
        //                     text-4xl
        //                     md:text-5xl
        //                     lg:text-6xl
        //                     font-cormorant
        //                     font-semibold
        //                 "
        //             >
        //                 Featured Collections
        //             </h2>

        //             <p
        //                 className="
        //                     mt-3
        //                     max-w-2xl
        //                     text-sm
        //                     md:text-base
        //                     text-muted
        //                 "
        //             >
        //                 Discover carefully selected collections
        //                 designed around the way you use technology.
        //             </p>
        //         </div>

        //         {/* Accordion */}
        //         <AccordionGallery
        //             items={items}
        //             defaultIndex={0}
        //             expandRatio={0.52}
        //             trigger="hover"
        //             accentColor="#ffffff"
        //             overlayColor="#060010"
        //             textColor="#ffffff"
        //             grayscale
        //             showLabels
        //             duration={0.6}
        //             ease="power3.out"
        //             parallax={0.5}
        //             tilt={8}
        //             stagger={0.06}
        //             height={460}
        //             gap={10}
        //             radius={16}
        //             orientation="horizontal"
        //             onItemClick={(item) => {
        //                 console.log(
        //                     "Selected collection:",
        //                     item.collection
        //                 );
        //             }}
        //         />
        //     </div>
        // </section>
    );
}

export default FeaturedCategories;
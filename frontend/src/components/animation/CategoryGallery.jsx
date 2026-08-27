import AccordionGallery from "./AccordionGallery";

const categories = [
    {
        category: "laptops",
        label: "Laptops",
        image: "/categories/laptops.jpg",
    },
    {
        category: "smartphones",
        label: "Smartphones",
        image: "/categories/smartphones.jpg",
    },
    {
        category: "gaming",
        label: "Gaming",
        image: "/categories/gaming.jpg",
    },
    {
        category: "audio",
        label: "Audio",
        image: "/categories/audio.jpg",
    },
    {
        category: "accessories",
        label: "Accessories",
        image: "/categories/accessories.jpg",
    },
    {
        category: "components",
        label: "Components",
        image: "/categories/components.jpg",
    },
];

function CategoryGallery({
    selectedCategory,
    onCategoryChange,
}) {
    const selectedIndex = categories.findIndex(
        (item) =>
            item.category === selectedCategory
    );

    const items = categories.map((item) => ({
        image: item.image,
        label: item.label,
        alt: `${item.label} category`,
        category: item.category,
    }));

    return (
        <AccordionGallery
            items={items}
            defaultIndex={
                selectedIndex >= 0
                    ? selectedIndex
                    : 0
            }
            expandRatio={0.52}
            trigger="hover"
            accentColor="#ffffff"
            overlayColor="#060010"
            textColor="#ffffff"
            grayscale
            showLabels
            duration={0.6}
            ease="power3.out"
            parallax={0.5}
            tilt={8}
            stagger={0.06}
            height={300}
            gap={10}
            radius={16}
            orientation="horizontal"
            onItemClick={(item) => {
                onCategoryChange(item.category);
            }}
        />
    );
}

export default CategoryGallery;
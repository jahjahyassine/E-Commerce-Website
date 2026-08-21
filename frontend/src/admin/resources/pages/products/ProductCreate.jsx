import AdminSidebar from "../../components/AdminSidebar";
import DotField from "../../../../components/animation/DotField.jsx";
import { useMemo, useState, useEffect } from "react";
import { Check } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { StatusModal } from "../../../../modals/StatusModal";

export function ProductCreate() {

    const BASE_URL = import.meta.env.VITE_BASE_URL

    const fetchBrands = async () => {
        const response = await fetch(
            `${BASE_URL}/brands`
        )

        const data = response.json()

        if (!response.ok) throw new Error(data.message || "Failed to retrieve Brands")

        return data
    }


    const fetchCategories = async () => {
        const response = await fetch(
            `${BASE_URL}/categories`
        )

        const data = await response.json()

        if (!response.ok) throw new Error(data.message || "Failed to retrieve Categories")

        return data
    }


    const fetchTags = async () => {
        const response = await fetch(
            `${BASE_URL}/tags`
        )

        const data = await response.json()

        if (!response.ok) throw new Error(data.message || "Failed to retrieve Tags")

        return data
    }

    const [productName, setProductName] = useState("")
    const [description, setDescription] = useState("")
    const [specifications, setSpecifications] = useState([{
        name: "",
        value: ""
    }]);
    const [selectedBrand, setSelectedBrand] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [media, setMedia] = useState([]);
    const [selectedTags, setSelectedTags] = useState([])
    const [tag, setTag] = useState("")

    const mediaPreviews = useMemo(() => {
        return media.map((file) => ({
            file,
            url: URL.createObjectURL(file),
        }))
    }, [media])

    useEffect(() => {
        return () => {
            mediaPreviews.forEach(({ url }) => {
                URL.revokeObjectURL(url);
            });
        };
    }, [mediaPreviews]);


    const handleSpecificationChange = (index, field, value) => {
        setSpecifications((prev) => {
            const newSpecifications = [...prev];

            newSpecifications[index] = {
                ...newSpecifications[index],
                [field]: value,
            };

            return newSpecifications;
        });
    };

    const handleSpecificationConfirm = (index) => {
        setSpecifications((prev) => {
            const newSpecifications = [...prev];

            newSpecifications[index] = {
                ...newSpecifications[index],
                confirmed: !newSpecifications[index]?.confirmed,
            };

            return newSpecifications;
        });
    };

    const createProductFunction = async (formData) => {
        const response = await fetch(
            `${BASE_URL}/admin/products`,
            {
                method: 'POST',
                body: formData
            }
        )

        const data = await response.json()

        if (!response.ok) throw new Error(data.message || "Failed to Create the Product")

        return data
    }


    const {
        data: brands
    } = useQuery({
        queryKey: ["brands"],
        queryFn: fetchBrands
    })

    const {
        data: categories
    } = useQuery({
        queryKey: ["categories"],
        queryFn: fetchCategories
    })

    const {
        data: tags
    } = useQuery({
        queryKey: ["tags"],
        queryFn: fetchTags
    })


    const {
        mutate: createProduct,
        isPending,
        isError,
        isSuccess,
        error,
        reset
    } = useMutation({
        mutationFn: createProductFunction,
        onSuccess: (data) => {
            console.log("Product created:", data);
        },
        onError: (error) => {
            console.error("Failed:", error);
        },
    })

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();

        const specificationObject = Object.fromEntries(
            specifications
                .filter((spec) => spec.name.trim() && spec.value.trim())
                .map((spec) => [spec.name.trim(), spec.value.trim()])
        );

        formData.append(
            "product",
            JSON.stringify({
                product: {
                    name: productName,
                    description,
                    specifications: specificationObject,
                    brand_id: Number(selectedBrand),
                    category_id: Number(selectedCategory),
                    tags: selectedTags,
                }
            })
        );

        media.forEach((file) => {
            formData.append("media", file)
        })


        createProduct(formData)
    }

    return (
        <main className="h-screen max-w-full font-sans bg-[#0F172A] flex gap-4">
            <header className="relative z-10 h-screen">
                <AdminSidebar />
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
            <section className="relative z-10 h-screen flex-1 text-admin-text order-2 flex flex-col">
                {isPending && (
                    <StatusModal
                        type="pending"
                        onClose={() => {}}
                    />
                )}

                {isSuccess && (
                    <StatusModal
                        type="success"
                        onClose={reset}
                    />
                )}

                {isError && (
                    <StatusModal
                        type="error"
                        message={error?.message}
                        onClose={reset}
                    />
                )}
                <h2 className="text-3xl font-bold border-b border-admin-border py-2">
                    Create Your Product
                </h2>

                <form
                    onSubmit={(e) => handleSubmit(e)}
                >
                    <section className="flex justify-end gap-2 mb-4 py-2 ">
                        <button className="bg-white/10 backdrop-blur-xl border border-admin-danger text-admin-danger hover:bg-admin-danger-hover hover:text-admin-text duration-300 p-2 rounded-xl font-semibold"
                            type="button"
                            onClick={() => window.location.reload()}
                        >
                            Discard Changes
                        </button>
                        <button className="bg-admin-primary hover:bg-admin-primary-hover text-admin-text duration-300 py-2 px-4 rounded-xl font-bold" type="submit">
                            Save Product
                        </button>
                    </section>
                    <section className="grid grid-cols-3 gap-4">
                        <section className="col-span-2 bg-admin-surface p-3 rounded-xl">
                            <h3 className="text-lg font-bold mb-1">
                                General Information
                            </h3>

                            <div className="flex flex-col mb-2 gap-1">
                                <label htmlFor="productName"
                                    className="text-sm font-bold text-admin-muted"
                                >
                                    Product Name
                                </label>
                                <input
                                    id="productName"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    className="bg-admin-input border border-admin-input-border rounded-lg outline-none py-1 px-2 "
                                />
                            </div>


                            <div className="flex flex-col gap-1">
                                <label htmlFor="description"
                                    className="text-sm font-bold text-admin-muted"
                                >
                                    Description
                                </label>
                                <textarea
                                    rows={5}
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="bg-admin-input border resize-y py-1 px-2 outline-none border-admin-input-border rounded-lg"
                                />
                            </div>

                        </section>


                        <section className="col-span-1 col-start-3 row-start-2 col-start-3 bg-admin-surface p-3 rounded-xl">
                            <h3 className="text-lg font-bold mb-1">
                                Product Classification
                            </h3>

                            <div className="flex flex-col mb-2 gap-1">
                                <label htmlFor="brand"
                                    className="text-sm font-bold text-admin-muted"
                                >
                                    Brand
                                </label>
                                <select
                                    id="brand"
                                    value={selectedBrand}
                                    onChange={(e) => setSelectedBrand(e.target.value)}
                                    className="bg-admin-input border border-admin-input-border rounded-lg outline-none py-1 px-2 "
                                >
                                    <option value="" disabled>
                                        Select a brand
                                    </option>
                                    {
                                        brands?.map((brand) => (
                                            <option
                                                key={brand.id}
                                                value={brand.id}
                                            >
                                                {brand.name}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>


                            <div className="flex flex-col mb-2 gap-1">
                                <label htmlFor="category"
                                    className="text-sm font-bold text-admin-muted"
                                >
                                    Category
                                </label>
                                <select
                                    id="category"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="bg-admin-input border border-admin-input-border rounded-lg outline-none py-1 px-2 "
                                >
                                    <option value="" disabled>
                                        Select a Category
                                    </option>
                                    {
                                        categories?.map((category) => (
                                            <option
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.name}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                        </section>


                        <section className="col-span-1 row-start-1 col-start-3 bg-admin-surface p-3 rounded-xl flex flex-col">
                            <h3 className="text-lg font-bold mb-1">
                                Product Media
                            </h3>

                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-bold text-admin-muted">
                                    Product Photo
                                </p>

                                <div className="flex gap-2 overflow-x-auto scrollbar-none justify-start">
                                    {
                                        mediaPreviews && mediaPreviews.map(({ file, url }) => (
                                            <img
                                                key={`${file.name}-${file.lastModified}`}
                                                src={url}
                                                alt="Product preview"
                                                className="w-40 h-40 rounded-lg object-cover"
                                            />
                                        ))
                                    }
                                </div>



                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    onChange={(e) => {
                                        const selectedFile = e.target.files?.[0];

                                        if (!selectedFile) return;

                                        setMedia((prev) => {
                                            const alreadyExists = prev.some(
                                                (file) =>
                                                    file.name === selectedFile.name &&
                                                    file.size === selectedFile.size &&
                                                    file.lastModified === selectedFile.lastModified
                                            );

                                            if (alreadyExists) {
                                                return prev;
                                            }

                                            return [...prev, selectedFile];
                                        });

                                        e.target.value = "";
                                    }}
                                />
                            </div>
                        </section>


                        <section className="col-span-2 bg-admin-surface p-3 rounded-xl">
                            <h3 className="text-lg font-bold mb-1">
                                Product Tags
                            </h3>

                            <div className="flex flex-col mb-2 gap-1">
                                <p htmlFor="tags"
                                    className="text-sm font-bold text-admin-muted"
                                >
                                    Available Tags
                                </p>

                                <div className="flex gap-2 overflow-auto flex-wrap">
                                    {
                                        tags?.map((tag) => (
                                            <button
                                                key={tag.id}
                                                className="text-sm font-bold bg-admin-input-hover px-1 rounded-lg"
                                                type="button"
                                                onClick={() => {
                                                    if (!selectedTags.includes(tag.name)) {
                                                        setSelectedTags((prev) => [...prev, tag.name])
                                                    }
                                                }
                                                }
                                            >
                                                {tag.name}
                                            </button>
                                        ))
                                    }
                                </div>
                                <p htmlFor="tags"
                                    className="text-sm font-bold text-admin-muted"
                                >
                                    Selected Tags
                                </p>

                                <div className="flex gap-2 overflow-auto flex-wrap">
                                    {
                                        selectedTags?.map((tag, index) => (
                                            <button
                                                key={index}
                                                className="text-sm font-bold bg-admin-primary-hover/80 p-1 rounded-lg"
                                                type="button"
                                            >
                                                {tag}
                                            </button>
                                        ))
                                    }
                                </div>

                                <input
                                    id="tags"
                                    value={tag}
                                    placeholder="Enter your Tag"
                                    onChange={(e) => setTag(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();

                                            if (!selectedTags.includes(tag)) {
                                                setSelectedTags((prev) => [...prev, tag])
                                            }
                                            setTag("")
                                        }
                                    }}
                                    className="bg-admin-input border border-admin-input-border rounded-lg outline-none py-1 px-2 mt-2"
                                />



                            </div>
                        </section>



                        <section className="col-span-3 bg-admin-surface p-3 rounded-xl">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold">
                                    Specifications
                                </h3>

                                <button
                                    className="
                                    py-1
                                    px-2
                                    text-sm
                                    font-bold
                                    bg-admin-surface-hover
                                    hover:bg-admin-surface-hover/70
                                    rounded-lg
                                    transition-colors
                                    duration-200
                                "
                                    type="button"
                                    onClick={() =>
                                        setSpecifications((prev) => [...prev, { name: "", value: "" }])
                                    }
                                >
                                    Add Specification
                                </button>
                            </div>

                            <div className="mt-3 flex flex-col gap-2">

                                {specifications.map((specification, index) => (
                                    <div key={index} className="flex gap-2">

                                        <input
                                            className="
                                                w-1/3
                                                bg-admin-input
                                                border
                                                border-admin-input-border
                                                rounded-lg
                                                outline-none
                                                py-1
                                                px-2
                                                text-admin-text
                                                placeholder:text-admin-muted
                                                focus:border-admin-primary
                                                transition-colors
                                            "
                                            placeholder="Name"
                                            value={specification.name}
                                            onChange={(e) =>
                                                handleSpecificationChange(
                                                    index,
                                                    "name",
                                                    e.target.value
                                                )
                                            }
                                        />

                                        <input
                                            className="
                                                flex-1
                                                bg-admin-input
                                                border
                                                border-admin-input-border
                                                rounded-lg
                                                outline-none
                                                py-1
                                                px-2
                                                text-admin-text
                                                placeholder:text-admin-muted
                                                focus:border-admin-primary
                                                transition-colors
                                            "
                                            placeholder="Value"
                                            value={specification.value}
                                            onChange={(e) =>
                                                handleSpecificationChange(
                                                    index,
                                                    "value",
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>
                                ))}

                            </div>

                        </section>
                    </section>
                </form>
            </section>
        </main>
    )
}
import { useQuery } from "@tanstack/react-query";
import DotField from "../components/animation/DotField";
import Navbar from "../components/Navbar";
import { useState } from "react";
import ProductCard from "../components/ProductCard";
import { Link, useSearchParams } from "react-router-dom";

function Explore() {

    const [sortBy, setSortBy] = useState("featured")
    const [category, setCategory] = useState("")
    const [brand, setBrand] = useState("")
    const [minPrice, setMinPrice] = useState("")
    const [maxPrice, setMaxPrice] = useState("")
    const [rating, setRating] = useState("")

    const BASE_URL = import.meta.env.VITE_BASE_URL


    const getProducts = async () => {
        const response = await fetch(
            "http://127.0.0.1:8000/products",
            {method: 'GET'}
        )

        return await response.json()
    }

    const { data } = useQuery ({
        queryKey:["products"],
        queryFn: getProducts
    })

    const [searchParams, setSearchParams] = useSearchParams()

    const updateBrand = (brand) => {
        searchParams.set("brand", brand);
        setSearchParams(searchParams);
    };

    const updateCategory = (category) => {
        searchParams.set('category', category)
        setSearchParams(searchParams)
    };


    return (
        <main className="relative min-h-screen">
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

            <section className="relative z-10 pt-20 px-6">
                <h2 className="text-5xl font-cormorant text-center border-b border-border-soft mb-5 pb-2">
                    Discover our premium collection of electronics.
                </h2>

                <div className="flex justify-between mb-4">
                    <input
                        autoFocus
                        type="search"
                        placeholder="Search products"
                        aria-label="Search products"
                        className="
                                pr-18 pl-4 py-1.5 text-md font-semibold
                                backdrop-blur-xl rounded-2xl
                                border border-border-soft
                                focus:outline-none focus:border-border 
                                placeholder:text-subtle
                            "
                    />

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="
                            rounded-xl
                            border
                            border-border-soft/70
                            bg-inverse
                            px-4
                            py-2
                            text-sm
                            text-gray-700
                            outline-none
                            focus:border-border/80
                        "
                    >
                        <option value="featured">Featured</option>
                        <option value="newest">Newest</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="rating">Highest Rated</option>
                        <option value="popular">Most Popular</option>
                    </select>
                </div>

                <div className="flex justify-between p-4 border-t border-b mb-4">
                    <button onClick={() => {
                        searchParams.delete("category")
                        setSearchParams(searchParams)
                    }}>All Categories</button>
                    <button onClick={() => updateCategory("laptops")}>Laptops</button>
                    <button onClick={() => updateCategory("smartphones")}>Smartphones</button>
                    <button onClick={() => updateCategory("gaming")}>Gaming</button>
                    <button onClick={() => updateCategory("audio")}>Audio</button>
                    <button onClick={() => updateCategory("accessories")}>Accessories</button>
                    <button onClick={() => updateCategory("components")}>Components</button>
                </div>
                <div className="flex justify-around mb-4">

                    <select
                        value={brand}
                        onChange={(e) => updateBrand(e.target.value)}
                        className="
                            rounded-xl
                            border
                            border-border-soft/70
                            bg-white/30 backdrop-blue-xl
                            px-2
                            py-2
                            text-sm
                            text-gray-700
                            outline-none
                            focus:border-border/80
                        "
                    >
                        <option value="">All Brands</option>
                        <option value="apple">Apple</option>
                        <option value="samsung">Samsung</option>
                        <option value="asus">ASUS</option>
                        <option value="dell">Dell</option>
                        <option value="lenovo">Lenovo</option>
                    </select>

                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Min price"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="
                                w-28
                                rounded-xl
                                border
                                border-border-soft/70
                                bg-white/30 backdrop-blue-xl
                                px-3
                                py-2
                                text-sm
                                outline-none
                                focus:border-border/80
                            "
                        />

                        <input
                            type="number"
                            placeholder="Max price"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="
                                w-28
                                rounded-xl
                                border
                                border-border-soft/70
                                bg-white/30 backdrop-blue-xl
                                px-3
                                py-2
                                text-sm
                                outline-none
                                focus:border-border/80
                            "
                        />
                    </div>

                    <select
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        className="
                            rounded-xl
                            border
                            border-border-soft/70
                            bg-white/30 backdrop-blue-xl
                            px-2
                            py-2
                            text-sm
                            text-gray-700
                            outline-none
                            focus:border-border/80
                        "
                    >
                        <option value="">Any Rating</option>
                        <option value="5">★★★★★</option>
                        <option value="4">★★★★☆ & up</option>
                        <option value="3">★★★☆☆ & up</option>
                    </select>
                </div>


                <section className="flex-1 grid lg:grid-cols-5 md:grid-cols-3 gap-4 ">
                    {
                        data?.map((product) => (
                            <ProductCard product={product} key={product.id} />
                        ))
                    }
                </section>
            </section>
        </main>
    )
}

export default Explore;
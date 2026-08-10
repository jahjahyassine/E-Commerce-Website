import { FaStar } from "react-icons/fa6";
import { Link, useSearchParams } from "react-router-dom";
function ProductCard({ product }) {


    return (
        <Link className="flex flex-col bg-card text-foreground h-[450px] rounded-3xl border border-border overflow-hidden shadow-product" to={`/products/${product.id}`}
        >

            <div className="h-2/3 overflow-hidden rounded-t-md">
                <img src={product.media?.[0]?.media_url}
                    className="w-full h-full object-cover hover:scale-[1.02] duration-300 ease-out"
                />
            </div>

            <div className="p-4 flex-1 bg-background text-foreground flex flex-col justify-between">
                <div className="flex justify-between font-bold ">
                    <h3 className="text-lg">{product.name}</h3>
                    <p className="text-minimal-green text-lg">${product.min_price}</p>
                </div>

                <div>
                    {product.brand.name}
                </div>

                <div className="flex items-center text-minimal-yellow self-end">
                    {
                        Array.from({ length: product.average_rating }).map((_, index) => (
                            <FaStar key={index} />
                        ))
                    }
                    <p className="text-md ml-1 font-bold">{product.average_rating}</p>
                    <p className="text-muted text-sm ml-2">
                        ({product.count_reviews} reviews)
                    </p>
                </div>


                <div className="bg-primary hover:bg-primary-hover text-inverse font-bold text-lg text-center py-2 rounded-full justify-self-end duration-300 ease-in-out cursor-pointer">
                    Add to Cart
                </div>

            </div>
        </Link>
    )
}

export default ProductCard;
export interface Product {
    id: number;
    name: string;
    description: string | null;
    min_price: string;
    specifications: JSON | null;
    average_rating: string;
    count_reviews: number;
    is_active: boolean;
    brand_id: number;
    category_id: number;
}
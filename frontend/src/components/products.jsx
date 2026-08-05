import Headphones from "../assets/headphones.png"
import Laptop from "../assets/macbook.png"
import AsusLaptop from "../assets/asuslaptop.png"
import Phone from "../assets/samsungphone.png"
import DellLaptop from "../assets/delllaptop.png"
import Mouse from "../assets/mouse.png"
import Console from "../assets/console.png"

export const products = [
    {
        id: 1,
        name: "JBL SonicFlow Wireless",
        category: "HEADPHONE",
        brand: "JBL",
        badge: "NEW RELEASE",
        image: Headphones,
        price: 149,
        rating: 4.9,
        reviews: 1284,
        hook: [
            "Pristine sound.",
            "Zero wires.",
            "Total freedom."
        ],
        description: [
            "Experience powerful audio with precision-tuned drivers.",
            "Designed for all-day comfort."
        ],
        highlights: [
            "57H Listening",
            "157g Comfort",
            "40mm Dynamic Drivers",
            "Bluetooth 5.3",
            "USB-C Fast Charge"
        ]
    },

    {
        id: 2,
        name: "MacBook Pro M4",
        category: "LAPTOP",
        brand: "APPLE",
        badge: "TOP SELLER",
        image: Laptop,
        price: 1999,
        rating: 4.9,
        reviews: 5320,
        hook: [
            "Power meets precision.",
            "Built for creators.",
            "Ready for anything."
        ],
        description: [
            "Unmatched performance with Apple silicon.",
            "Designed for professionals and everyday workflows."
        ],
        highlights: [
            "M4 Pro Chip",
            "14.2\" Liquid Retina XDR",
            "24GB Unified Memory",
            "22H Battery",
            "Thunderbolt 5"
        ]
    },

    {
        id: 3,
        name: "ROG Zephyrus G16",
        category: "GAMING LAPTOP",
        brand: "ASUS",
        badge: "GAMING",
        image: AsusLaptop,
        price: 1899,
        rating: 4.8,
        reviews: 2410,
        hook: [
            "Desktop power.",
            "Portable design.",
            "Limitless performance."
        ],
        description: [
            "High-performance gaming with OLED visuals and RTX graphics.",
            "Engineered for competitive players and creators."
        ],
        highlights: [
            "RTX 5070 GPU",
            "Intel Core Ultra 9",
            "240Hz OLED Display",
            "32GB RAM",
            "1TB SSD"
        ]
    },

    {
        id: 4,
        name: "Galaxy S26 Ultra",
        category: "SMARTPHONE",
        brand: "SAMSUNG",
        badge: "NEW",
        image: Phone,
        price: 1299,
        rating: 4.8,
        reviews: 4200,
        hook: [
            "Capture everything.",
            "Experience innovation.",
            "Built to impress."
        ],
        description: [
            "Advanced cameras and intelligent AI features.",
            "A premium smartphone experience in every detail."
        ],
        highlights: [
            "200MP Camera",
            "Titanium Frame",
            "AI Features",
            "5000mAh Battery",
            "S Pen Included"
        ]
    },

    {
        id: 5,
        name: "Dell XPS 15",
        category: "LAPTOP",
        brand: "DELL",
        badge: "PRO CHOICE",
        image: DellLaptop,
        price: 1599,
        rating: 4.7,
        reviews: 1900,
        hook: [
            "Built for creators.",
            "Designed to perform.",
            "Made to inspire."
        ],
        description: [
            "Premium craftsmanship with powerful computing performance.",
            "Perfect for creative work and professional tasks."
        ],
        highlights: [
            "Intel Core Ultra 7",
            "OLED Display",
            "RTX Graphics",
            "32GB RAM",
            "Premium Aluminum"
        ]
    },

    {
        id: 6,
        name: "Logitech MX Master 4",
        category: "ACCESSORY",
        brand: "LOGITECH",
        badge: "POPULAR",
        image: Mouse,
        price: 119,
        rating: 4.8,
        reviews: 7600,
        hook: [
            "Precision in motion.",
            "Work smarter.",
            "Control everything."
        ],
        description: [
            "Advanced tracking with ergonomic comfort.",
            "Designed for productive workflows."
        ],
        highlights: [
            "8000 DPI Tracking",
            "70 Day Battery",
            "Multi Device",
            "USB-C Charging",
            "Ergonomic Design"
        ]
    },

    {
        id: 7,
        name: "PlayStation 4 Pro",
        category: "GAMING CONSOLE",
        brand: "SONY",
        badge: "BEST SELLER",
        image: Console,
        price: 399,
        rating: 4.8,
        reviews: 12500,
        hook: [
            "Legendary gaming.",
            "Immersive worlds.",
            "Endless adventures."
        ],
        description: [
            "Experience iconic games with stunning HDR visuals.",
            "The console that defined a generation."
        ],
        highlights: [
            "4K HDR Gaming",
            "1TB Storage",
            "HDR Graphics",
            "DualShock 4 Controller",
            "PlayStation Plus"
        ]
    }
]
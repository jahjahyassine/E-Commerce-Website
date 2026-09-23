from decimal import Decimal

from sqlalchemy.orm import Session

from core.database import SessionLocal
from models.product import (
    Product,
    ProductVariant,
    Brand,
    Category,
    Tag,
)
from models.inventory import (
    Inventory,
    Supplier,
    StockChange,
    StockChangeType,
)
from rag.embedding import indexing_product


# ============================================================
# DATA
# ============================================================

CATEGORIES = [
    "Laptops",
    "Smartphones",
    "Headphones",
    "Monitors",
    "Accessories",
]

BRANDS = [
    "Lenovo",
    "ASUS",
    "Samsung",
    "Sony",
    "Apple",
]

TAGS = [
    "Gaming",
    "Student",
    "Productivity",
    "Premium",
    "Portable",
    "Wireless",
    "AMOLED",
    "4K",
    "USB-C",
    "Budget",
]

SUPPLIERS = [
    {
        "name": "Tech Distribution Maroc",
        "email": "contact@techdistribution.ma",
        "phone": "0522001001",
        "address": "Casablanca, Morocco",
    },
    {
        "name": "Digital Supply Casablanca",
        "email": "sales@digitalsupply.ma",
        "phone": "0522334455",
        "address": "Casablanca, Morocco",
    },
    {
        "name": "Global Electronics MA",
        "email": "contact@globalelectronics.ma",
        "phone": "0522445566",
        "address": "Casablanca, Morocco",
    },
]


PRODUCTS = [
    {
        "name": "Lenovo LOQ 15IRX9",
        "description": (
            "Gaming laptop designed for students, developers and gamers. "
            "Features an Intel Core i7 processor, NVIDIA GeForce RTX graphics, "
            "fast DDR5 memory and a high refresh rate display. Suitable for "
            "gaming, programming, machine learning projects and demanding "
            "productivity workloads."
        ),
        "brand": "Lenovo",
        "category": "Laptops",
        "tags": [
            "Gaming",
            "Student",
            "Productivity",
        ],
        "specifications": {
            "processor": "Intel Core i7-13650HX",
            "gpu": "NVIDIA GeForce RTX 4060 8GB",
            "display": "15.6 inch FHD IPS",
            "refresh_rate": "144Hz",
            "ram": "16GB DDR5",
            "storage": "512GB NVMe SSD",
            "os": "Windows 11",
            "weight": "2.4kg",
        },
        "variants": [
            {
                "sku": "LOQ-I7-16-512",
                "price": "11999.00",
                "discount": "5.00",
                "attributes": {
                    "ram": "16GB",
                    "storage": "512GB",
                    "color": "Storm Grey",
                },
                "quantity": 12,
                "supplier": "Tech Distribution Maroc",
            },
            {
                "sku": "LOQ-I7-16-1TB",
                "price": "12999.00",
                "discount": "5.00",
                "attributes": {
                    "ram": "16GB",
                    "storage": "1TB",
                    "color": "Storm Grey",
                },
                "quantity": 8,
                "supplier": "Tech Distribution Maroc",
            },
            {
                "sku": "LOQ-I7-32-1TB",
                "price": "14499.00",
                "discount": "10.00",
                "attributes": {
                    "ram": "32GB",
                    "storage": "1TB",
                    "color": "Storm Grey",
                },
                "quantity": 4,
                "supplier": "Global Electronics MA",
            },
        ],
    },
    {
        "name": "ASUS Vivobook 15",
        "description": (
            "Slim and practical laptop for students, office work, programming "
            "and everyday productivity. Its lightweight design and efficient "
            "Intel processor make it suitable for studying, browsing, coding "
            "and working on the go."
        ),
        "brand": "ASUS",
        "category": "Laptops",
        "tags": [
            "Student",
            "Productivity",
            "Portable",
            "Budget",
        ],
        "specifications": {
            "processor": "Intel Core i5-1335U",
            "gpu": "Intel Iris Xe",
            "display": "15.6 inch FHD OLED",
            "refresh_rate": "60Hz",
            "ram": "16GB DDR4",
            "storage": "512GB NVMe SSD",
            "os": "Windows 11",
            "weight": "1.7kg",
        },
        "variants": [
            {
                "sku": "VIVO15-I5-8-512",
                "price": "6499.00",
                "discount": "5.00",
                "attributes": {
                    "ram": "8GB",
                    "storage": "512GB",
                    "color": "Quiet Blue",
                },
                "quantity": 15,
                "supplier": "Digital Supply Casablanca",
            },
            {
                "sku": "VIVO15-I5-16-512",
                "price": "7199.00",
                "discount": "10.00",
                "attributes": {
                    "ram": "16GB",
                    "storage": "512GB",
                    "color": "Quiet Blue",
                },
                "quantity": 20,
                "supplier": "Digital Supply Casablanca",
            },
            {
                "sku": "VIVO15-I5-16-1TB",
                "price": "7899.00",
                "discount": "10.00",
                "attributes": {
                    "ram": "16GB",
                    "storage": "1TB",
                    "color": "Quiet Blue",
                },
                "quantity": 7,
                "supplier": "Global Electronics MA",
            },
        ],
    },
    {
        "name": "Samsung Galaxy S25",
        "description": (
            "Premium Android smartphone with a compact AMOLED display, "
            "powerful Snapdragon processor, advanced cameras and fast "
            "performance. Designed for users who want a high-end phone for "
            "photography, gaming, communication and everyday productivity."
        ),
        "brand": "Samsung",
        "category": "Smartphones",
        "tags": [
            "Premium",
            "AMOLED",
            "Portable",
        ],
        "specifications": {
            "processor": "Snapdragon 8 Elite",
            "display": "6.2 inch Dynamic AMOLED 2X",
            "refresh_rate": "120Hz",
            "ram": "12GB",
            "camera": "50MP + 10MP + 12MP",
            "battery": "4000mAh",
            "connectivity": "5G",
            "water_resistance": "IP68",
        },
        "variants": [
            {
                "sku": "S25-12-128",
                "price": "9999.00",
                "discount": "5.00",
                "attributes": {
                    "ram": "12GB",
                    "storage": "128GB",
                    "color": "Navy",
                },
                "quantity": 10,
                "supplier": "Global Electronics MA",
            },
            {
                "sku": "S25-12-256",
                "price": "10999.00",
                "discount": "5.00",
                "attributes": {
                    "ram": "12GB",
                    "storage": "256GB",
                    "color": "Navy",
                },
                "quantity": 8,
                "supplier": "Global Electronics MA",
            },
            {
                "sku": "S25-12-512",
                "price": "12499.00",
                "discount": "10.00",
                "attributes": {
                    "ram": "12GB",
                    "storage": "512GB",
                    "color": "Navy",
                },
                "quantity": 3,
                "supplier": "Tech Distribution Maroc",
            },
        ],
    },
    {
        "name": "Sony WH-1000XM5",
        "description": (
            "Premium wireless noise-cancelling headphones designed for music, "
            "travel, studying and office productivity. Provides strong active "
            "noise cancellation, high-quality sound, long battery life and "
            "comfortable over-ear construction."
        ),
        "brand": "Sony",
        "category": "Headphones",
        "tags": [
            "Premium",
            "Wireless",
            "Productivity",
        ],
        "specifications": {
            "type": "Over-ear",
            "connectivity": "Bluetooth 5.2",
            "noise_cancellation": "Active Noise Cancellation",
            "battery_life": "30 hours",
            "charging": "USB-C",
            "audio_codecs": "LDAC, AAC, SBC",
            "weight": "250g",
        },
        "variants": [
            {
                "sku": "XM5-BLK",
                "price": "3999.00",
                "discount": "5.00",
                "attributes": {
                    "color": "Black",
                },
                "quantity": 18,
                "supplier": "Tech Distribution Maroc",
            },
            {
                "sku": "XM5-SLV",
                "price": "3999.00",
                "discount": "10.00",
                "attributes": {
                    "color": "Silver",
                },
                "quantity": 9,
                "supplier": "Digital Supply Casablanca",
            },
        ],
    },
    {
        "name": "Apple Studio Display",
        "description": (
            "High-resolution 27-inch monitor designed for professional "
            "creative work, programming and productivity. Features a sharp "
            "5K Retina display, wide color gamut, integrated speakers, webcam "
            "and USB-C connectivity."
        ),
        "brand": "Apple",
        "category": "Monitors",
        "tags": [
            "Premium",
            "4K",
            "USB-C",
            "Productivity",
        ],
        "specifications": {
            "display": "27 inch Retina 5K",
            "resolution": "5120 x 2880",
            "refresh_rate": "60Hz",
            "brightness": "600 nits",
            "color": "P3 wide color",
            "camera": "12MP Ultra Wide",
            "speakers": "Six-speaker system",
            "connectivity": "Thunderbolt / USB-C",
        },
        "variants": [
            {
                "sku": "ASD-STD",
                "price": "18999.00",
                "discount": "5.00",
                "attributes": {
                    "glass": "Standard",
                    "stand": "Tilt-adjustable",
                },
                "quantity": 5,
                "supplier": "Global Electronics MA",
            },
            {
                "sku": "ASD-NANO",
                "price": "21999.00",
                "discount": "5.00",
                "attributes": {
                    "glass": "Nano-texture",
                    "stand": "Tilt-adjustable",
                },
                "quantity": 2,
                "supplier": "Global Electronics MA",
            },
        ],
    },
]


# ============================================================
# HELPERS
# ============================================================

def get_or_create_category(
    db: Session,
    name: str,
) -> Category:
    category = (
        db.query(Category)
        .filter(Category.name.ilike(name))
        .first()
    )

    if not category:
        category = Category(name=name)
        db.add(category)
        db.flush()

    return category


def get_or_create_brand(
    db: Session,
    name: str,
) -> Brand:
    brand = (
        db.query(Brand)
        .filter(Brand.name.ilike(name))
        .first()
    )

    if not brand:
        brand = Brand(name=name)
        db.add(brand)
        db.flush()

    return brand


def get_or_create_tag(
    db: Session,
    name: str,
) -> Tag:
    tag = (
        db.query(Tag)
        .filter(Tag.name.ilike(name))
        .first()
    )

    if not tag:
        tag = Tag(name=name)
        db.add(tag)
        db.flush()

    return tag


def get_or_create_supplier(
    db: Session,
    data: dict,
) -> Supplier:
    supplier = (
        db.query(Supplier)
        .filter(Supplier.name.ilike(data["name"]))
        .first()
    )

    if not supplier:
        supplier = Supplier(
            name=data["name"],
            email=data["email"],
            phone=data["phone"],
            address=data["address"],
            is_active=True,
        )
        db.add(supplier)
        db.flush()

    return supplier


# ============================================================
# SEED
# ============================================================

def seed():
    db = SessionLocal()

    try:
        print("Starting database seed...")

        # ----------------------------------------------------
        # Categories
        # ----------------------------------------------------

        categories = {}

        for name in CATEGORIES:
            categories[name] = get_or_create_category(
                db,
                name,
            )

        # ----------------------------------------------------
        # Brands
        # ----------------------------------------------------

        brands = {}

        for name in BRANDS:
            brands[name] = get_or_create_brand(
                db,
                name,
            )

        # ----------------------------------------------------
        # Tags
        # ----------------------------------------------------

        tags = {}

        for name in TAGS:
            tags[name] = get_or_create_tag(
                db,
                name,
            )

        # ----------------------------------------------------
        # Suppliers
        # ----------------------------------------------------

        suppliers = {}

        for supplier_data in SUPPLIERS:
            suppliers[supplier_data["name"]] = (
                get_or_create_supplier(
                    db,
                    supplier_data,
                )
            )

        db.commit()

        # ----------------------------------------------------
        # Products + variants
        # ----------------------------------------------------

        for product_data in PRODUCTS:

            existing_product = (
                db.query(Product)
                .filter(
                    Product.name == product_data["name"]
                )
                .first()
            )

            if existing_product:
                print(
                    f"Skipping existing product: "
                    f"{product_data['name']}"
                )
                continue

            product = Product(
                name=product_data["name"],
                description=product_data["description"],
                specifications=product_data["specifications"],
                brand=brands[product_data["brand"]],
                category=categories[product_data["category"]],
                is_active=True,
            )

            # Attach tags
            for tag_name in product_data["tags"]:
                product.tags.append(tags[tag_name])

            db.add(product)
            db.flush()

            # ------------------------------------------------
            # Variants
            # ------------------------------------------------

            for variant_data in product_data["variants"]:

                variant = ProductVariant(
                    product=product,
                    sku=variant_data["sku"],
                    price=Decimal(variant_data["price"]),
                    discount_percentage=Decimal(
                        variant_data["discount"]
                    ),
                    attributes=variant_data["attributes"],
                    is_active=True,
                )

                db.add(variant)
                db.flush()

                # --------------------------------------------
                # Inventory
                # --------------------------------------------

                inventory = Inventory(
                    product_variant_id=variant.id,
                    quantity=variant_data["quantity"],
                )

                db.add(inventory)

                # --------------------------------------------
                # Initial stock change
                # --------------------------------------------

                stock_change = StockChange(
                    product_variant_id=variant.id,
                    change_type=StockChangeType.IN,
                    quantity=variant_data["quantity"],
                    supplier_id=suppliers[
                        variant_data["supplier"]
                    ].id,
                )

                db.add(stock_change)

            # ------------------------------------------------
            # Product minimum price
            # ------------------------------------------------

            product.min_price = min(
                Decimal(v["price"])
                for v in product_data["variants"]
            )

            db.flush()

            print(
                f"Created product: "
                f"{product.name}"
            )

        # Commit products and variants BEFORE embeddings.
        db.commit()

        # ====================================================
        # EMBEDDINGS
        # ====================================================

        print("\nGenerating embeddings...")

        products = (
            db.query(Product)
            .all()
        )

        for product in products:
            product.embedding = indexing_product(product)

            print(
                f"Embedded: {product.name}"
            )

        db.commit()

        print("\nSeed completed successfully.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed()
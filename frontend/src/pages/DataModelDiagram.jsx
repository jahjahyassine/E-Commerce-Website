import React, { useMemo } from "react";

const CANVAS_WIDTH = 3600;
const CANVAS_HEIGHT = 2500;

const HEADER_HEIGHT = 46;
const ROW_HEIGHT = 31;

const COLORS = {
    background: "#FFFFFF",
    entity: "#F8FAFC",
    entityBorder: "#334155",
    header: "#2C4E8A",
    enumHeader: "#475569",
    text: "#111827",
    muted: "#64748B",
    divider: "#D9E1EA",
    relation: "#64748B",
    cardinalityFill: "#FFFFFF",
    cardinalityBorder: "#CBD5E1",
    pk: "#B45309",
    fk: "#2563EB",
    unique: "#7C3AED",
    nullable: "#6B7280",
};

const entities = [
    {
        id: "user",
        name: "User",
        x: 90,
        y: 180,
        width: 500,
        fields: [
            ["id", "Integer", "PK"],
            ["username", "String(100)", "UNIQUE"],
            ["full_name", "String(100)", "nullable"],
            ["email", "String(255)", "UNIQUE"],
            ["password_hash", "String(255)", ""],
            ["phone", "String(20)", "nullable"],
            ["address", "Text", "nullable"],
            ["city", "String(100)", "nullable"],
            ["region", "String(100)", "nullable"],
            ["postal_code", "String(20)", "nullable"],
            ["role", "UserRole", ""],
            ["is_active", "Boolean", ""],
            ["profile_pic", "Text", "nullable"],
            ["created_at", "DateTime", ""],
            ["updated_at", "DateTime", ""],
        ],
    },
    {
        id: "brand",
        name: "Brand",
        x: 700,
        y: 100,
        width: 390,
        fields: [
            ["id", "Integer", "PK"],
            ["name", "String", "UNIQUE"],
            ["is_active", "Boolean", ""],
        ],
    },
    {
        id: "category",
        name: "Category",
        x: 700,
        y: 300,
        width: 390,
        fields: [
            ["id", "Integer", "PK"],
            ["name", "String", "UNIQUE"],
            ["is_active", "Boolean", ""],
        ],
    },
    {
        id: "product",
        name: "Product",
        x: 1200,
        y: 120,
        width: 570,
        fields: [
            ["id", "Integer", "PK"],
            ["name", "String", ""],
            ["description", "Text", "nullable"],
            ["specifications", "JSONB", "nullable"],
            ["min_price", "Numeric(10,2)", ""],
            ["average_rating", "Numeric(5,2)", ""],
            ["count_reviews", "Integer", ""],
            ["is_active", "Boolean", ""],
            ["brand_id", "Integer", "FK"],
            ["category_id", "Integer", "FK"],
            ["created_at", "DateTime", ""],
            ["updated_at", "DateTime", ""],
        ],
    },
    {
        id: "product-variant",
        name: "ProductVariant",
        x: 1900,
        y: 80,
        width: 600,
        fields: [
            ["id", "Integer", "PK"],
            ["product_id", "Integer", "FK"],
            ["sku", "String(64)", "UNIQUE"],
            ["price", "Numeric(10,2)", ""],
            ["discount_percentage", "Numeric(5,2)", ""],
            ["attributes", "JSONB", "nullable"],
            ["is_active", "Boolean", ""],
            ["created_at", "DateTime", ""],
            ["updated_at", "DateTime", ""],
        ],
    },
    {
        id: "media",
        name: "Media",
        x: 2680,
        y: 120,
        width: 470,
        fields: [
            ["id", "Integer", "PK"],
            ["media_url", "String", ""],
            ["product_id", "Integer", "FK nullable"],
            ["variant_id", "Integer", "FK nullable"],
        ],
    },
    {
        id: "tag",
        name: "Tag",
        x: 700,
        y: 540,
        width: 390,
        fields: [
            ["id", "Integer", "PK"],
            ["name", "String", "UNIQUE"],
        ],
    },
    {
        id: "product-tag",
        name: "ProductTag",
        x: 1200,
        y: 610,
        width: 570,
        fields: [
            ["product_id", "Integer", "PK, FK"],
            ["tag_id", "Integer", "PK, FK"],
        ],
    },
    {
        id: "inventory",
        name: "Inventory",
        x: 1900,
        y: 510,
        width: 600,
        fields: [
            ["id", "Integer", "PK"],
            ["product_variant_id", "Integer", "FK, UNIQUE"],
            ["quantity", "Integer", ""],
        ],
    },
    {
        id: "supplier",
        name: "Supplier",
        x: 2680,
        y: 620,
        width: 470,
        fields: [
            ["id", "Integer", "PK"],
            ["name", "String(100)", "UNIQUE"],
            ["email", "String(255)", "nullable"],
            ["phone", "String(20)", "nullable"],
            ["address", "Text", "nullable"],
            ["is_active", "Boolean", ""],
            ["created_at", "DateTime", ""],
        ],
    },
    {
        id: "stock-change",
        name: "StockChange",
        x: 1900,
        y: 760,
        width: 600,
        fields: [
            ["id", "Integer", "PK"],
            ["product_variant_id", "Integer", "FK"],
            ["change_type", "StockChangeType", ""],
            ["quantity", "Integer", ""],
            ["supplier_id", "Integer", "FK nullable"],
            ["order_id", "Integer", "FK nullable"],
        ],
    },
    {
        id: "cart",
        name: "Cart",
        x: 90,
        y: 760,
        width: 500,
        fields: [
            ["id", "Integer", "PK"],
            ["user_id", "Integer", "FK, UNIQUE"],
            ["created_at", "DateTime", ""],
            ["updated_at", "DateTime", ""],
        ],
    },
    {
        id: "cart-item",
        name: "CartItem",
        x: 700,
        y: 850,
        width: 390,
        fields: [
            ["cart_id", "Integer", "PK, FK"],
            ["product_variant_id", "Integer", "PK, FK"],
            ["quantity", "Integer", ""],
            ["price", "Numeric(10,2)", ""],
        ],
    },
    {
        id: "order",
        name: "Order",
        x: 90,
        y: 1120,
        width: 500,
        fields: [
            ["id", "Integer", "PK"],
            ["user_id", "Integer", "FK"],
            ["customer_name", "String(255)", ""],
            ["customer_phone", "String(30)", ""],
            ["shipping_address", "Text", ""],
            ["shipping_city", "String(100)", ""],
            ["shipping_region", "String(100)", ""],
            ["shipping_postal_code", "String(20)", "nullable"],
            ["order_status", "OrderStatus", ""],
            ["shipping_status", "ShippingStatus", ""],
            ["payment_status", "PaymentStatus", ""],
            ["total_amount", "Numeric(10,2)", ""],
            ["created_at", "DateTime", ""],
            ["updated_at", "DateTime", ""],
        ],
    },
    {
        id: "order-item",
        name: "OrderItem",
        x: 700,
        y: 1370,
        width: 390,
        fields: [
            ["order_id", "Integer", "PK, FK"],
            ["product_variant_id", "Integer", "PK, FK"],
            ["product_name", "String(255)", ""],
            ["variant_attributes_snapshot", "JSONB", ""],
            ["quantity", "Integer", ""],
            ["price", "Numeric(10,2)", ""],
            ["", "", ""],
        ],
    },
    {
        id: "review",
        name: "Review",
        x: 1200,
        y: 930,
        width: 570,
        fields: [
            ["id", "Integer", "PK"],
            ["review", "Text", ""],
            ["rating", "Integer", ""],
            ["user_id", "Integer", "FK"],
            ["product_id", "Integer", "FK"],
            ["created_at", "DateTime", ""],
            ["updated_at", "DateTime", ""],
        ],
    },
];

const enums = [
    {
        id: "user-role",
        name: "UserRole",
        x: 2680,
        y: 880,
        width: 470,
        values: ["CUSTOMER", "ADMIN"],
    },
    {
        id: "order-status",
        name: "OrderStatus",
        x: 90,
        y: 1710,
        width: 500,
        values: [
            "PENDING",
            "CONFIRMED",
            "COMPLETED",
            "CANCELLED",
        ],
    },
    {
        id: "shipping-status",
        name: "ShippingStatus",
        x: 700,
        y: 1710,
        width: 390,
        values: [
            "NOT_SHIPPED",
            "SHIPPED",
            "DELIVERED",
        ],
    },
    {
        id: "payment-status",
        name: "PaymentStatus",
        x: 1200,
        y: 1710,
        width: 570,
        values: [
            "PENDING",
            "PAID",
            "REFUNDED",
        ],
    },
    {
        id: "stock-change-type",
        name: "StockChangeType",
        x: 1900,
        y: 1710,
        width: 600,
        values: [
            "IN",
            "OUT",
        ],
    },
];

function entityHeight(entity) {
    return HEADER_HEIGHT + 18 + entity.fields.length * ROW_HEIGHT + 14;
}

function enumHeight(item) {
    return HEADER_HEIGHT + 18 + item.values.length * ROW_HEIGHT + 14;
}

/*
 * All relationship routes are deliberately manual.
 * The paths are routed around entity boxes rather than relying
 * on generic edge calculations.
 */
const relations = [
    // User
    {
        id: "user-order",
        path: "M590 650 H640 V1060 H340 V1120",
        labels: [
            [598, 635, "1"],
            [348, 1104, "0..*"],
        ],
    },
    {
        id: "user-cart",
        path: "M340 723 V760",
        labels: [
            [350, 742, "1"],
            [350, 775, "0..1"],
        ],
    },
    {
        id: "user-review",
        path: "M590 500 H620 V1080 H1200",
        labels: [
            [598, 485, "1"],
            [1175, 1065, "0..*"],
        ],
    },

    // Catalogue
    {
        id: "brand-product",
        path: "M1090 165 H1200",
        labels: [
            [1098, 150, "1"],
            [1175, 150, "0..*"],
        ],
    },
    {
        id: "category-product",
        path: "M1090 365 H1140 V430 H1200",
        labels: [
            [1098, 350, "1"],
            [1175, 414, "0..*"],
        ],
    },
    {
        id: "product-variant",
        path: "M1770 230 H1900",
        labels: [
            [1782, 215, "1"],
            [1870, 215, "0..*"],
        ],
    },

    // Media
    {
        id: "product-media",
        path: "M1770 500 H2600 V260 H2680",
        labels: [
            [1785, 485, "1"],
            [2640, 245, "0..*"],
        ],
    },
    {
        id: "variant-media",
        path: "M2500 300 H2580 V300 H2680",
        labels: [
            [2510, 285, "1"],
            [2640, 285, "0..*"],
        ],
    },

    // Tags
    {
        id: "product-producttag",
        path: "M1600 570 V610",
        labels: [
            [1612, 592, "0..*"],
            [1612, 628, "0..*"],
        ],
    },
    {
        id: "tag-producttag",
        path: "M1090 610 H1145 V680 H1200",
        labels: [
            [1098, 595, "0..*"],
            [1172, 665, "1"],
        ],
    },

    // Inventory / stock
    {
        id: "variant-inventory",
        path: "M2200 437 V510",
        labels: [
            [2212, 458, "1"],
            [2212, 495, "0..1"],
        ],
    },
    {
        id: "variant-stock",
        path: "M2400 437 V700 H2600 V900 H2500",
        labels: [
            [2412, 455, "1"],
            [2510, 885, "0..*"],
        ],
    },
    {
        id: "supplier-stock",
        path: "M2680 760 H2600 V930 H2500",
        labels: [
            [2660, 745, "0..1"],
            [2510, 915, "0..*"],
        ],
    },

    // Cart
    {
        id: "cart-item",
        path: "M590 850 H650 V950 H700",
        labels: [
            [600, 835, "1"],
            [675, 935, "0..*"],
        ],
    },
    {
        id: "variant-cartitem",
        path: "M1900 390 H1800 V1000 H1090",
        labels: [
            [1810, 375, "1"],
            [1098, 985, "0..*"],
        ],
    },

    // Orders
    {
        id: "order-item",
        path: "M590 1450 H700",
        labels: [
            [600, 1435, "1"],
            [675, 1435, "1..*"],
        ],
    },
    {
        id: "variant-orderitem",
        path: "M1900 410 H1850 V1510 H1090",
        labels: [
            [1860, 395, "1"],
            [1098, 1495, "0..*"],
        ],
    },

    // StockChange -> Order
    {
        id: "order-stock",
        path: "M590 1300 H650 V1080 H1800 V990 H1900",
        labels: [
            [598, 1285, "0..1"],
            [1870, 975, "0..*"],
        ],
    },

    // Product -> Review
    {
        id: "product-review",
        path: "M1600 570 V590 H1800 V900 H1600 V930",
        labels: [
            [1612, 578, "1"],
            [1612, 915, "0..*"],
        ],
    },
];

const enumRelations = [
    // User -> UserRole
    {
        id: "user-role",
        path: "M590 600 H2550 V940 H2680",
    },

    // Order -> statuses
    {
        id: "order-status",
        path: "M590 1490 H630 V1675 H340 V1710",
    },
    {
        id: "shipping-status",
        path: "M590 1520 H650 V1690 H895 V1710",
    },
    {
        id: "payment-status",
        path: "M590 1550 H670 V1700 H1485 V1710",
    },

    // StockChange -> StockChangeType
    {
        id: "stock-type",
        path: "M2200 1024 V1710",
    },
];

function Cardinality({ x, y, text }) {
    return (
        <g>
            <rect
                x={x - 18}
                y={y - 14}
                width="36"
                height="24"
                rx="4"
                fill={COLORS.cardinalityFill}
                stroke={COLORS.cardinalityBorder}
            />
            <text
                x={x}
                y={y + 3}
                textAnchor="middle"
                fontFamily="Manrope, Arial, sans-serif"
                fontSize="13"
                fontWeight="600"
                fill={COLORS.text}
            >
                {text}
            </text>
        </g>
    );
}

function Relation({ relation }) {
    return (
        <g>
            <path
                d={relation.path}
                fill="none"
                stroke={COLORS.relation}
                strokeWidth="1.7"
                strokeLinecap="square"
                strokeLinejoin="miter"
            />

            {relation.labels?.map(([x, y, text], index) => (
                <Cardinality
                    key={`${relation.id}-label-${index}`}
                    x={x}
                    y={y}
                    text={text}
                />
            ))}
        </g>
    );
}

function EnumRelation({ relation }) {
    return (
        <path
            d={relation.path}
            fill="none"
            stroke={COLORS.relation}
            strokeWidth="1.5"
            strokeDasharray="7 6"
        />
    );
}

function FieldConstraint({ value }) {
    if (!value) return null;

    const parts = value.split(",").map((part) => part.trim());

    return (
        <g>
            {parts.map((part, index) => {
                let color = COLORS.muted;

                if (part === "PK") {
                    color = COLORS.pk;
                } else if (part === "FK") {
                    color = COLORS.fk;
                } else if (part === "UNIQUE") {
                    color = COLORS.unique;
                } else if (part === "nullable") {
                    color = COLORS.nullable;
                } else if (part === "FK nullable") {
                    color = COLORS.fk;
                }

                const display =
                    part === "PK"
                        ? "PK"
                        : part === "FK"
                          ? "FK"
                          : part === "UNIQUE"
                            ? "UQ"
                            : part === "nullable"
                              ? "?"
                              : part === "FK nullable"
                                ? "FK ?"
                                : part;

                return (
                    <text
                        key={`${part}-${index}`}
                        x={-index * 1}
                        y={0}
                        fontFamily="Manrope, Arial, sans-serif"
                        fontSize="11"
                        fontWeight="700"
                        fill={color}
                    >
                        {display}
                    </text>
                );
            })}
        </g>
    );
}

function Entity({ entity }) {
    const height = entityHeight(entity);

    return (
        <g>
            <rect
                x={entity.x}
                y={entity.y}
                width={entity.width}
                height={height}
                rx="6"
                fill={COLORS.entity}
                stroke={COLORS.entityBorder}
                strokeWidth="1.5"
            />

            <path
                d={`
                    M ${entity.x} ${entity.y + HEADER_HEIGHT}
                    H ${entity.x + entity.width}
                `}
                stroke={COLORS.entityBorder}
                strokeWidth="1.2"
            />

            <rect
                x={entity.x}
                y={entity.y}
                width={entity.width}
                height={HEADER_HEIGHT}
                rx="6"
                fill={COLORS.header}
            />

            <rect
                x={entity.x}
                y={entity.y + HEADER_HEIGHT - 6}
                width={entity.width}
                height="6"
                fill={COLORS.header}
            />

            <text
                x={entity.x + 18}
                y={entity.y + 30}
                fontFamily="Manrope, Arial, sans-serif"
                fontSize="18"
                fontWeight="700"
                fill="#FFFFFF"
            >
                {entity.name}
            </text>

            {entity.fields.map(([name, type, constraint], index) => {
                const rowTop =
                    entity.y + HEADER_HEIGHT + 18 + index * ROW_HEIGHT;

                const rowCenter = rowTop + 18;

                return (
                    <g key={`${entity.id}-${index}`}>
                        {index > 0 && (
                            <line
                                x1={entity.x + 12}
                                y1={rowTop}
                                x2={entity.x + entity.width - 12}
                                y2={rowTop}
                                stroke={COLORS.divider}
                                strokeWidth="0.8"
                            />
                        )}

                        {constraint && (
                            <FieldConstraintGroup
                                value={constraint}
                                x={entity.x + 18}
                                y={rowCenter}
                            />
                        )}

                        <text
                            x={entity.x + 92}
                            y={rowCenter}
                            fontFamily="Manrope, Arial, sans-serif"
                            fontSize="13.5"
                            fontWeight="600"
                            fill={COLORS.text}
                        >
                            {name}
                        </text>

                        <text
                            x={entity.x + entity.width - 18}
                            y={rowCenter}
                            textAnchor="end"
                            fontFamily="Manrope, Arial, sans-serif"
                            fontSize="12.5"
                            fill={COLORS.muted}
                        >
                            {type}
                        </text>
                    </g>
                );
            })}
        </g>
    );
}

function FieldConstraintGroup({ value, x, y }) {
    const parts = value.split(",").map((part) => part.trim());

    return (
        <g>
            {parts.map((part, index) => {
                const offset = index * 30;

                let color = COLORS.muted;
                let text = part;

                if (part === "PK") {
                    color = COLORS.pk;
                    text = "PK";
                } else if (part === "FK") {
                    color = COLORS.fk;
                    text = "FK";
                } else if (part === "UNIQUE") {
                    color = COLORS.unique;
                    text = "UQ";
                } else if (part === "nullable") {
                    color = COLORS.nullable;
                    text = "?";
                }

                return (
                    <text
                        key={`${part}-${index}`}
                        x={x + offset}
                        y={y}
                        fontFamily="Manrope, Arial, sans-serif"
                        fontSize="11"
                        fontWeight="700"
                        fill={color}
                    >
                        {text}
                    </text>
                );
            })}
        </g>
    );
}

function EnumBox({ item }) {
    const height = enumHeight(item);

    return (
        <g>
            <rect
                x={item.x}
                y={item.y}
                width={item.width}
                height={height}
                rx="6"
                fill={COLORS.entity}
                stroke={COLORS.entityBorder}
                strokeWidth="1.5"
            />

            <path
                d={`
                    M ${item.x} ${item.y + HEADER_HEIGHT}
                    H ${item.x + item.width}
                `}
                stroke={COLORS.entityBorder}
                strokeWidth="1.2"
            />

            <rect
                x={item.x}
                y={item.y}
                width={item.width}
                height={HEADER_HEIGHT}
                rx="6"
                fill={COLORS.enumHeader}
            />

            <rect
                x={item.x}
                y={item.y + HEADER_HEIGHT - 6}
                width={item.width}
                height="6"
                fill={COLORS.enumHeader}
            />

            <text
                x={item.x + 18}
                y={item.y + 30}
                fontFamily="Manrope, Arial, sans-serif"
                fontSize="18"
                fontWeight="700"
                fill="#FFFFFF"
            >
                {item.name}
            </text>

            {item.values.map((value, index) => {
                const rowTop =
                    item.y + HEADER_HEIGHT + 18 + index * ROW_HEIGHT;

                const rowCenter = rowTop + 18;

                return (
                    <g key={`${item.id}-${value}`}>
                        {index > 0 && (
                            <line
                                x1={item.x + 12}
                                y1={rowTop}
                                x2={item.x + item.width - 12}
                                y2={rowTop}
                                stroke={COLORS.divider}
                                strokeWidth="0.8"
                            />
                        )}

                        <circle
                            cx={item.x + 25}
                            cy={rowCenter - 4}
                            r="3"
                            fill={COLORS.muted}
                        />

                        <text
                            x={item.x + 42}
                            y={rowCenter}
                            fontFamily="Manrope, Arial, sans-serif"
                            fontSize="13.5"
                            fontWeight="600"
                            fill={COLORS.text}
                        >
                            {value}
                        </text>
                    </g>
                );
            })}
        </g>
    );
}

export default function DataModelDiagram() {
    const entityElements = useMemo(
        () => entities.map((entity) => (
            <Entity key={entity.id} entity={entity} />
        )),
        []
    );

    const enumElements = useMemo(
        () => enums.map((item) => (
            <EnumBox key={item.id} item={item} />
        )),
        []
    );

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                minHeight: "900px",
                background: "#FFFFFF",
                overflow: "auto",
            }}
        >
            <div
                style={{
                    width: CANVAS_WIDTH,
                    height: CANVAS_HEIGHT,
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
                    style={{
                        display: "block",
                        width: CANVAS_WIDTH,
                        height: CANVAS_HEIGHT,
                        background: "#FFFFFF",
                    }}
                >
                    {/* Relationships are drawn first so entity boxes stay clean */}
                    <g aria-label="relationships">
                        {relations.map((relation) => (
                            <Relation
                                key={relation.id}
                                relation={relation}
                            />
                        ))}

                        {enumRelations.map((relation) => (
                            <EnumRelation
                                key={relation.id}
                                relation={relation}
                            />
                        ))}
                    </g>

                    {/* Entities */}
                    <g aria-label="entities">
                        {entityElements}
                    </g>

                    {/* Enumerations */}
                    <g aria-label="enumerations">
                        {enumElements}
                    </g>
                </svg>
            </div>
        </div>
    );
}
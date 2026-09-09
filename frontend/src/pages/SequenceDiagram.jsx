import React from "react";

function SequenceDiagram() {
    const W = 1500;
    const H = 4000;

    const actors = [
        { x: 150, label: "Client" },
        { x: 430, label: "Interface Web" },
        { x: 730, label: "API FastAPI" },
        { x: 1030, label: "Base de données" },
        { x: 1330, label: "Service Email" },
    ];

    const colors = {
        bg: "#ffffff",
        border: "#334155",
        text: "#111827",
        muted: "#64748b",
        header: "#2C4E8A",
        headerLight: "#EEF3FB",
        line: "#94a3b8",
        message: "#334155",
        alt: "#F8FAFC",
        note: "#FFF9E6",
        noteBorder: "#D4A017",
        success: "#F0FDF4",
        successBorder: "#65A30D",
        danger: "#FEF2F2",
        dangerBorder: "#DC2626",
        section: "#F1F5F9",
    };

    const participantTop = 105;
    const lifelineTop = 170;
    const lifelineBottom = H - 80;

    const Arrow = ({
        y,
        from,
        to,
        label,
        dashed = false,
        reverse = false,
    }) => {
        const x1 = actors[from].x;
        const x2 = actors[to].x;

        const startX = reverse ? x2 : x1;
        const endX = reverse ? x1 : x2;

        const marker = reverse ? "url(#arrowLeft)" : "url(#arrowRight)";

        return (
            <g>
                <line
                    x1={startX}
                    y1={y}
                    x2={endX}
                    y2={y}
                    stroke={colors.message}
                    strokeWidth="2"
                    strokeDasharray={dashed ? "8 6" : undefined}
                    markerEnd={marker}
                />

                <text
                    x={(startX + endX) / 2}
                    y={y - 10}
                    textAnchor="middle"
                    fontSize="17"
                    fontFamily="Arial, Helvetica, sans-serif"
                    fill={colors.text}
                >
                    {label}
                </text>
            </g>
        );
    };

    const Section = ({ y, title }) => (
        <g>
            <rect
                x="60"
                y={y}
                width={W - 120}
                height="44"
                rx="8"
                fill={colors.section}
                stroke="#CBD5E1"
            />

            <text
                x={W / 2}
                y={y + 29}
                textAnchor="middle"
                fontSize="19"
                fontWeight="700"
                fontFamily="Arial, Helvetica, sans-serif"
                fill={colors.header}
            >
                {title}
            </text>
        </g>
    );

    const Note = ({ x, y, width, height, lines }) => (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                rx="7"
                fill={colors.note}
                stroke={colors.noteBorder}
                strokeWidth="1.5"
            />

            {lines.map((line, i) => (
                <text
                    key={i}
                    x={x + 16}
                    y={y + 24 + i * 19}
                    fontSize="14"
                    fontFamily="Arial, Helvetica, sans-serif"
                    fill={colors.text}
                >
                    {line}
                </text>
            ))}
        </g>
    );

    const AltBox = ({ y, height, label, fill, border }) => (
        <g>
            <rect
                x="90"
                y={y}
                width={W - 180}
                height={height}
                rx="8"
                fill={fill}
                stroke={border}
                strokeWidth="1.5"
            />

            <rect
                x="90"
                y={y}
                width="175"
                height="34"
                rx="7"
                fill={border}
            />

            <text
                x="177"
                y={y + 23}
                textAnchor="middle"
                fontSize="15"
                fontWeight="700"
                fontFamily="Arial, Helvetica, sans-serif"
                fill="#ffffff"
            >
                {label}
            </text>
        </g>
    );

    return (
        <div
            style={{
                width: "100%",
                minHeight: "100vh",
                background: "#e5e7eb",
                padding: "40px",
                boxSizing: "border-box",
                overflow: "auto",
            }}
        >
            <div
                style={{
                    width: `${W}px`,
                    margin: "0 auto",
                    background: "#ffffff",
                    boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
                }}
            >
                <svg
                    width={W}
                    height={H}
                    viewBox={`0 0 ${W} ${H}`}
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <marker
                            id="arrowRight"
                            markerWidth="10"
                            markerHeight="10"
                            refX="9"
                            refY="3"
                            orient="auto"
                            markerUnits="strokeWidth"
                        >
                            <path
                                d="M0,0 L10,3 L0,6 Z"
                                fill={colors.message}
                            />
                        </marker>

                        <marker
                            id="arrowLeft"
                            markerWidth="10"
                            markerHeight="10"
                            refX="1"
                            refY="3"
                            orient="auto"
                            markerUnits="strokeWidth"
                        >
                            <path
                                d="M10,0 L0,3 L10,6 Z"
                                fill={colors.message}
                            />
                        </marker>
                    </defs>

                    {/* Background */}
                    <rect width={W} height={H} fill={colors.bg} />

                    {/* Title */}
                    <text
                        x={W / 2}
                        y="45"
                        textAnchor="middle"
                        fontSize="27"
                        fontWeight="700"
                        fontFamily="Arial, Helvetica, sans-serif"
                        fill={colors.text}
                    >
                        Diagramme de séquence — Processus de commande
                    </text>

                    {/* Participant headers */}
                    {actors.map((actor) => (
                        <g key={actor.label}>
                            <rect
                                x={actor.x - 95}
                                y={participantTop}
                                width="190"
                                height="48"
                                rx="8"
                                fill={colors.headerLight}
                                stroke={colors.header}
                                strokeWidth="2"
                            />

                            <text
                                x={actor.x}
                                y={participantTop + 30}
                                textAnchor="middle"
                                fontSize="17"
                                fontWeight="700"
                                fontFamily="Arial, Helvetica, sans-serif"
                                fill={colors.header}
                            >
                                {actor.label}
                            </text>

                            {/* Lifeline */}
                            <line
                                x1={actor.x}
                                y1={lifelineTop}
                                x2={actor.x}
                                y2={lifelineBottom}
                                stroke={colors.line}
                                strokeWidth="1.5"
                                strokeDasharray="7 7"
                            />
                        </g>
                    ))}

                    {/* ===================== */}
                    {/* CONSULTATION DU PANIER */}
                    {/* ===================== */}

                    <Section
                        y={205}
                        title="Consultation du panier"
                    />

                    <Arrow
                        y={285}
                        from={0}
                        to={1}
                        label="Consulter le panier"
                    />

                    <Arrow
                        y={345}
                        from={1}
                        to={2}
                        label="GET /cart"
                    />

                    <Arrow
                        y={405}
                        from={2}
                        to={3}
                        label="Récupérer le panier"
                    />

                    <Arrow
                        y={465}
                        from={3}
                        to={2}
                        reverse
                        dashed
                        label="Cart + CartItems"
                    />

                    <Arrow
                        y={525}
                        from={2}
                        to={1}
                        reverse
                        dashed
                        label="Données du panier"
                    />

                    <Arrow
                        y={585}
                        from={1}
                        to={0}
                        reverse
                        dashed
                        label="Afficher le panier"
                    />

                    {/* ===================== */}
                    {/* VALIDATION */}
                    {/* ===================== */}

                    <Section
                        y={650}
                        title="Validation de la commande"
                    />

                    <Arrow
                        y={730}
                        from={0}
                        to={1}
                        label="Valider la commande"
                    />

                    <Arrow
                        y={790}
                        from={1}
                        to={2}
                        label="POST /orders"
                    />

                    <Note
                        x={505}
                        y={815}
                        width={450}
                        height={65}
                        lines={[
                            "Informations de livraison",
                            "(adresse, ville, région, code postal, téléphone)",
                        ]}
                    />

                    <Arrow
                        y={920}
                        from={2}
                        to={3}
                        label="Vérifier l'utilisateur"
                    />

                    <Arrow
                        y={980}
                        from={3}
                        to={2}
                        reverse
                        dashed
                        label="Utilisateur valide"
                    />

                    <Arrow
                        y={1040}
                        from={2}
                        to={3}
                        label="Récupérer les CartItems"
                    />

                    <Arrow
                        y={1100}
                        from={3}
                        to={2}
                        reverse
                        dashed
                        label="Articles du panier"
                    />

                    {/* Empty cart */}
                    <AltBox
                        y={1140}
                        height={120}
                        label="alt"
                        fill={colors.danger}
                        border={colors.dangerBorder}
                    />

                    <text
                        x="285"
                        y="1170"
                        fontSize="16"
                        fontWeight="700"
                        fontFamily="Arial, Helvetica, sans-serif"
                        fill={colors.dangerBorder}
                    >
                        Panier vide
                    </text>

                    <Arrow
                        y={1200}
                        from={2}
                        to={1}
                        label="Erreur : panier vide"
                    />

                    <Arrow
                        y={1240}
                        from={1}
                        to={0}
                        reverse
                        dashed
                        label="Afficher l'erreur"
                    />

                    {/* Stock branch */}
                    <AltBox
                        y={1290}
                        height={310}
                        label="else"
                        fill={colors.alt}
                        border="#64748B"
                    />

                    <text
                        x="285"
                        y="1325"
                        fontSize="16"
                        fontWeight="700"
                        fontFamily="Arial, Helvetica, sans-serif"
                        fill={colors.text}
                    >
                        Panier non vide
                    </text>

                    {/* Loop */}
                    <rect
                        x="130"
                        y="1350"
                        width="1240"
                        height="170"
                        rx="7"
                        fill="#ffffff"
                        stroke="#94A3B8"
                        strokeWidth="1.5"
                    />

                    <rect
                        x="130"
                        y="1350"
                        width="220"
                        height="32"
                        rx="6"
                        fill="#64748B"
                    />

                    <text
                        x="240"
                        y="1372"
                        textAnchor="middle"
                        fontSize="14"
                        fontWeight="700"
                        fontFamily="Arial, Helvetica, sans-serif"
                        fill="#ffffff"
                    >
                        loop — Pour chaque article
                    </text>

                    <Arrow
                        y={1415}
                        from={2}
                        to={3}
                        label="Vérifier le stock (ProductVariant)"
                    />

                    <Arrow
                        y={1475}
                        from={3}
                        to={2}
                        reverse
                        dashed
                        label="Quantité disponible"
                    />

                    <Arrow
                        y={1540}
                        from={2}
                        to={2}
                        label="Calculer le total"
                    />

                    {/* Stock insufficient */}
                    <AltBox
                        y={1615}
                        height={145}
                        label="alt"
                        fill={colors.danger}
                        border={colors.dangerBorder}
                    />

                    <text
                        x="285"
                        y="1650"
                        fontSize="16"
                        fontWeight="700"
                        fontFamily="Arial, Helvetica, sans-serif"
                        fill={colors.dangerBorder}
                    >
                        Stock insuffisant
                    </text>

                    <Arrow
                        y={1690}
                        from={2}
                        to={1}
                        label="Erreur : stock insuffisant"
                    />

                    <Arrow
                        y={1735}
                        from={1}
                        to={0}
                        reverse
                        dashed
                        label="Afficher l'erreur"
                    />

                    {/* ===================== */}
                    {/* CREATION COMMANDE */}
                    {/* ===================== */}

                    <Section
                        y={1790}
                        title="Création de la commande"
                    />

                    <Arrow
                        y={1860}
                        from={2}
                        to={3}
                        label="Créer Order"
                    />

                    <Note
                        x={1070}
                        y={1880}
                        width={350}
                        height={105}
                        lines={[
                            "order_status = PENDING",
                            "shipping_status = NOT_SHIPPED",
                            "payment_status = PENDING",
                            "total_amount = total calculé",
                        ]}
                    />

                    <Arrow
                        y={2010}
                        from={3}
                        to={2}
                        reverse
                        dashed
                        label="Order créé"
                    />

                    {/* Order items */}
                    <rect
                        x="90"
                        y="2045"
                        width="1320"
                        height="220"
                        rx="8"
                        fill="#F8FAFC"
                        stroke="#CBD5E1"
                        strokeWidth="1.5"
                    />

                    <rect
                        x="110"
                        y="2060"
                        width="245"
                        height="34"
                        rx="6"
                        fill={colors.header}
                    />

                    <text
                        x="232"
                        y="2083"
                        textAnchor="middle"
                        fontSize="14"
                        fontWeight="700"
                        fontFamily="Arial, Helvetica, sans-serif"
                        fill="#ffffff"
                    >
                        loop — Pour chaque article
                    </text>

                    <Arrow
                        y={2125}
                        from={2}
                        to={3}
                        label="Créer OrderItem"
                    />

                    <Note
                        x={1070}
                        y={2140}
                        width={330}
                        height={100}
                        lines={[
                            "product_name = snapshot",
                            "variant_attributes = snapshot",
                            "quantity = quantité commandée",
                            "price = prix au moment de la commande",
                        ]}
                    />

                    <Arrow
                        y={2250}
                        from={3}
                        to={2}
                        reverse
                        dashed
                        label="OrderItem créé"
                    />

                    {/* ===================== */}
                    {/* CONTINUATION VISUELLE */}
                    {/* ===================== */}

                    <text
                        x={W / 2}
                        y={2290}
                        textAnchor="middle"
                        fontSize="16"
                        fontFamily="Arial, Helvetica, sans-serif"
                        fill={colors.muted}
                    >
                        ↓
                    </text>

                    {/* Bottom continuation */}
                    <rect
                        x="90"
                        y="2320"
                        width="1320"
                        height="340"
                        rx="8"
                        fill="#F8FAFC"
                        stroke="#CBD5E1"
                    />

                    <text
                        x={W / 2}
                        y="2355"
                        textAnchor="middle"
                        fontSize="17"
                        fontWeight="700"
                        fontFamily="Arial, Helvetica, sans-serif"
                        fill={colors.header}
                    >
                        Mise à jour du stock et finalisation
                    </text>

                    <Arrow
                        y={2410}
                        from={2}
                        to={3}
                        label="Mettre à jour Inventory"
                    />

                    <Arrow
                        y={2470}
                        from={3}
                        to={2}
                        reverse
                        dashed
                        label="Stock mis à jour"
                    />

                    <Arrow
                        y={2530}
                        from={2}
                        to={3}
                        label="Créer StockChange"
                    />

                    <Note
                        x={1060}
                        y={2550}
                        width={350}
                        height={80}
                        lines={[
                            "change_type = OUT",
                            "quantity = quantité commandée",
                            "order_id = Order.id",
                        ]}
                    />

                    <Arrow
                        y={2640}
                        from={3}
                        to={2}
                        reverse
                        dashed
                        label="StockChange créé"
                    />

                    {/* ===================== */}
                    {/* SUPPRESSION PANIER */}
                    {/* ===================== */}

                    <Section
                        y={2680}
                        title="Suppression du panier"
                    />

                    <Arrow
                        y={2750}
                        from={2}
                        to={3}
                        label="Supprimer les CartItems"
                    />

                    <Arrow
                        y={2810}
                        from={3}
                        to={2}
                        reverse
                        dashed
                        label="Panier mis à jour"
                    />

                    {/* ===================== */}
                    {/* CONFIRMATION */}
                    {/* ===================== */}

                    <Section
                        y={2850}
                        title="Confirmation"
                    />

                    <Arrow
                        y={2920}
                        from={2}
                        to={4}
                        label="Envoyer confirmation et reçu"
                    />

                    <Arrow
                        y={2980}
                        from={4}
                        to={2}
                        reverse
                        dashed
                        label="Email envoyé"
                    />

                    <Arrow
                        y={3040}
                        from={2}
                        to={1}
                        reverse
                        dashed
                        label="Commande créée"
                    />

                    <Arrow
                        y={3100}
                        from={1}
                        to={0}
                        reverse
                        dashed
                        label="Afficher confirmation"
                    />

                    {/* Footer */}
                    <text
                        x={W / 2}
                        y="3160"
                        textAnchor="middle"
                        fontSize="14"
                        fontFamily="Arial, Helvetica, sans-serif"
                        fill={colors.muted}
                    >
                        ByteStore — Processus de commande
                    </text>
                </svg>
            </div>
        </div>
    );
}





export default SequenceDiagram;
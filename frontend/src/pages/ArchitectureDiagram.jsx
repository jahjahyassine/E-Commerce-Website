import React from "react";

const COLORS = {
    background: "#FFFFFF",

    browser: "#F8FAFC",
    browserBorder: "#334155",

    frontend: "#EEF3FB",
    frontendBorder: "#2C4E8A",

    backend: "#F0FDF4",
    backendBorder: "#3F7D5A",

    database: "#FFF7ED",
    databaseBorder: "#C2410C",

    service: "#FAF5FF",
    serviceBorder: "#7C3AED",

    text: "#111827",
    muted: "#64748B",

    arrow: "#475569",
    arrowLight: "#94A3B8",

    divider: "#D9E1EA",
};

const FONT = "Arial, Helvetica, sans-serif";

const WIDTH = 1800;
const HEIGHT = 2000;

function Box({
    x,
    y,
    width,
    height,
    title,
    subtitle,
    fill,
    border,
    icon,
    children,
}) {
    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                rx={14}
                fill={fill}
                stroke={border}
                strokeWidth={2}
            />

            <circle
                cx={x + 34}
                cy={y + 34}
                r={19}
                fill="#FFFFFF"
                stroke={border}
                strokeWidth={1.5}
            />

            <text
                x={x + 34}
                y={y + 40}
                textAnchor="middle"
                fontFamily={FONT}
                fontSize={17}
                fontWeight="700"
                fill={border}
            >
                {icon}
            </text>

            <text
                x={x + 66}
                y={y + 33}
                fontFamily={FONT}
                fontSize={20}
                fontWeight="700"
                fill={COLORS.text}
            >
                {title}
            </text>

            {subtitle && (
                <text
                    x={x + 66}
                    y={y + 54}
                    fontFamily={FONT}
                    fontSize={12.5}
                    fill={COLORS.muted}
                >
                    {subtitle}
                </text>
            )}

            {children}
        </g>
    );
}

function LayerLabel({ x, y, text }) {
    return (
        <g>
            <text
                x={x}
                y={y}
                fontFamily={FONT}
                fontSize={13}
                fontWeight="700"
                fill={COLORS.muted}
                letterSpacing="1.2"
            >
                {text.toUpperCase()}
            </text>

            <line
                x1={x}
                y1={y + 9}
                x2={x + 150}
                y2={y + 9}
                stroke={COLORS.divider}
                strokeWidth={1}
            />
        </g>
    );
}

function Arrow({
    x1,
    y1,
    x2,
    y2,
    label,
    dashed = false,
    labelX,
    labelY,
}) {
    const markerId = dashed ? "arrowLight" : "arrow";

    return (
        <g>
            <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={dashed ? COLORS.arrowLight : COLORS.arrow}
                strokeWidth={2}
                strokeDasharray={dashed ? "8 7" : undefined}
                markerEnd={`url(#${markerId})`}
            />

            {label && (
                <g>
                    <rect
                        x={(labelX ?? (x1 + x2) / 2) - 65}
                        y={(labelY ?? (y1 + y2) / 2) - 15}
                        width={130}
                        height={30}
                        rx={7}
                        fill="#FFFFFF"
                        stroke={COLORS.divider}
                        strokeWidth={1}
                    />

                    <text
                        x={labelX ?? (x1 + x2) / 2}
                        y={(labelY ?? (y1 + y2) / 2) + 5}
                        textAnchor="middle"
                        fontFamily={FONT}
                        fontSize={12}
                        fontWeight="600"
                        fill={COLORS.muted}
                    >
                        {label}
                    </text>
                </g>
            )}
        </g>
    );
}

function DownArrow({ x, y1, y2, label }) {
    return (
        <g>
            <line
                x1={x}
                y1={y1}
                x2={x}
                y2={y2}
                stroke={COLORS.arrow}
                strokeWidth={2}
                markerEnd="url(#arrow)"
            />

            {label && (
                <>
                    <rect
                        x={x + 12}
                        y={(y1 + y2) / 2 - 15}
                        width={150}
                        height={30}
                        rx={7}
                        fill="#FFFFFF"
                        stroke={COLORS.divider}
                    />

                    <text
                        x={x + 87}
                        y={(y1 + y2) / 2 + 5}
                        textAnchor="middle"
                        fontFamily={FONT}
                        fontSize={12}
                        fontWeight="600"
                        fill={COLORS.muted}
                    >
                        {label}
                    </text>
                </>
            )}
        </g>
    );
}

function BrowserIcon() {
    return (
        <g>
            <rect
                x="-13"
                y="-10"
                width="26"
                height="20"
                rx="3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            />
            <line
                x1="-13"
                y1="-4"
                x2="13"
                y2="-4"
                stroke="currentColor"
                strokeWidth="2"
            />
            <circle cx="-8" cy="-7" r="1.5" fill="currentColor" />
            <circle cx="-3" cy="-7" r="1.5" fill="currentColor" />
        </g>
    );
}

function CodeIcon() {
    return (
        <text
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="monospace"
            fontSize="19"
            fontWeight="700"
        >
            {"</>"}
        </text>
    );
}

function ServerIcon() {
    return (
        <g>
            <rect
                x="-13"
                y="-13"
                width="26"
                height="9"
                rx="2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            />
            <rect
                x="-13"
                y="4"
                width="26"
                height="9"
                rx="2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            />
            <circle cx="-7" cy="-8.5" r="1.5" fill="currentColor" />
            <circle cx="-7" cy="8.5" r="1.5" fill="currentColor" />
        </g>
    );
}

function DatabaseIcon() {
    return (
        <g>
            <ellipse
                cx="0"
                cy="-10"
                rx="13"
                ry="6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            />
            <path
                d="M-13 -10 V10 C-13 14 13 14 13 10 V-10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            />
            <path
                d="M-13 0 C-13 4 13 4 13 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            />
        </g>
    );
}

function CloudIcon() {
    return (
        <g>
            <path
                d="
                    M-14 7
                    C-19 7 -20 -2 -14 -5
                    C-12 -12 -3 -14 2 -8
                    C10 -10 16 -4 14 3
                    C14 8 9 9 5 9
                    H-14
                    Z
                "
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            />
        </g>
    );
}

function MailIcon() {
    return (
        <g>
            <rect
                x="-14"
                y="-10"
                width="28"
                height="20"
                rx="3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            />
            <path
                d="M-12 -8 L0 1 L12 -8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
            />
        </g>
    );
}

function SmallBullet({ x, y, text }) {
    return (
        <g>
            <circle
                cx={x}
                cy={y - 4}
                r={3}
                fill={COLORS.muted}
            />

            <text
                x={x + 12}
                y={y}
                fontFamily={FONT}
                fontSize={13}
                fill={COLORS.text}
            >
                {text}
            </text>
        </g>
    );
}

export default function ArchitectureDiagram() {
    return (
        <div
            style={{
                width: "100%",
                minHeight: "100vh",
                background: "#FFFFFF",
                overflow: "auto",
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                padding: "30px",
                boxSizing: "border-box",
            }}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={WIDTH}
                height={HEIGHT}
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                style={{
                    display: "block",
                    background: "#FFFFFF",
                    flexShrink: 0,
                }}
            >
                <defs>
                    <marker
                        id="arrow"
                        markerWidth="10"
                        markerHeight="10"
                        refX="8"
                        refY="3"
                        orient="auto"
                        markerUnits="strokeWidth"
                    >
                        <path
                            d="M0,0 L0,6 L9,3 z"
                            fill={COLORS.arrow}
                        />
                    </marker>

                    <marker
                        id="arrowLight"
                        markerWidth="10"
                        markerHeight="10"
                        refX="8"
                        refY="3"
                        orient="auto"
                        markerUnits="strokeWidth"
                    >
                        <path
                            d="M0,0 L0,6 L9,3 z"
                            fill={COLORS.arrowLight}
                        />
                    </marker>
                </defs>

                {/* Background */}
                <rect
                    x="0"
                    y="0"
                    width={WIDTH}
                    height={HEIGHT}
                    fill={COLORS.background}
                />

                {/* =====================================================
                    PRESENTATION LAYER
                ====================================================== */}

                <LayerLabel
                    x={90}
                    y={55}
                    text="Couche présentation"
                />

                <Box
                    x={620}
                    y={100}
                    width={560}
                    height={145}
                    title="Navigateur Web"
                    subtitle="Client utilisateur"
                    fill={COLORS.browser}
                    border={COLORS.browserBorder}
                    icon={<BrowserIcon />}
                >
                    <text
                        x={650}
                        y={185}
                        fontFamily={FONT}
                        fontSize={15}
                        fontWeight="600"
                        fill={COLORS.text}
                    >
                        Application web ByteStore
                    </text>

                    <text
                        x={650}
                        y={210}
                        fontFamily={FONT}
                        fontSize={13}
                        fill={COLORS.muted}
                    >
                        Consultation • Panier • Commande • Compte
                    </text>
                </Box>

                {/* =====================================================
                    FRONTEND
                ====================================================== */}

                <LayerLabel
                    x={90}
                    y={330}
                    text="Frontend"
                />

                <Box
                    x={360}
                    y={375}
                    width={1080}
                    height={210}
                    title="React"
                    subtitle="Interface utilisateur"
                    fill={COLORS.frontend}
                    border={COLORS.frontendBorder}
                    icon={<CodeIcon />}
                >
                    <SmallBullet
                        x={410}
                        y={455}
                        text="Composants React"
                    />

                    <SmallBullet
                        x={410}
                        y={490}
                        text="Gestion de l'état"
                    />

                    <SmallBullet
                        x={410}
                        y={525}
                        text="React Router"
                    />

                    <SmallBullet
                        x={850}
                        y={455}
                        text="Appels HTTP vers l'API"
                    />

                    <SmallBullet
                        x={850}
                        y={490}
                        text="Affichage des produits"
                    />

                    <SmallBullet
                        x={850}
                        y={525}
                        text="Panier et processus de commande"
                    />
                </Box>

                {/* Browser -> React */}
                <DownArrow
                    x={900}
                    y1={245}
                    y2={375}
                    label="Interaction utilisateur"
                />

                {/* =====================================================
                    BACKEND / API
                ====================================================== */}

                <LayerLabel
                    x={90}
                    y={675}
                    text="Backend"
                />

                <Box
                    x={280}
                    y={720}
                    width={1240}
                    height={210}
                    title="API FastAPI"
                    subtitle="Couche applicative et services métier"
                    fill={COLORS.backend}
                    border={COLORS.backendBorder}
                    icon={<ServerIcon />}
                >
                    <SmallBullet
                        x={330}
                        y={800}
                        text="Routes REST"
                    />

                    <SmallBullet
                        x={330}
                        y={835}
                        text="Authentification"
                    />

                    <SmallBullet
                        x={330}
                        y={870}
                        text="Gestion des produits"
                    />

                    <SmallBullet
                        x={780}
                        y={800}
                        text="Gestion du panier"
                    />

                    <SmallBullet
                        x={780}
                        y={835}
                        text="Création des commandes"
                    />

                    <SmallBullet
                        x={780}
                        y={870}
                        text="Gestion du stock"
                    />

                    <SmallBullet
                        x={1160}
                        y={800}
                        text="Avis"
                    />

                    <SmallBullet
                        x={1160}
                        y={835}
                        text="Utilisateurs"
                    />

                    <SmallBullet
                        x={1160}
                        y={870}
                        text="Envoi d'e-mails"
                    />
                </Box>

                {/* React -> FastAPI */}
                <DownArrow
                    x={900}
                    y1={585}
                    y2={720}
                    label="HTTP / REST"
                />

                {/* =====================================================
                    ORM
                ====================================================== */}

                <LayerLabel
                    x={90}
                    y={1015}
                    text="Accès aux données"
                />

                <Box
                    x={500}
                    y={1045}
                    width={800}
                    height={115}
                    title="SQLAlchemy"
                    subtitle="ORM — mapping objet-relationnel"
                    fill="#F8FAFC"
                    border="#475569"
                    icon={<DatabaseIcon />}
                >
                    <text
                        x={540}
                        y={1115}
                        fontFamily={FONT}
                        fontSize={13}
                        fill={COLORS.muted}
                    >
                        Modèles • Requêtes • Relations • Transactions
                    </text>
                </Box>

                {/* FastAPI -> SQLAlchemy */}
                <DownArrow
                    x={900}
                    y1={930}
                    y2={1045}
                    label="Accès aux données"
                />

                {/* =====================================================
                    DATABASE
                ====================================================== */}

                <LayerLabel
                    x={90}
                    y={1190}
                    text="Base de données"
                />

                <Box
                    x={590}
                    y={1210}
                    width={620}
                    height={110}
                    title="PostgreSQL"
                    subtitle="Base de données relationnelle"
                    fill={COLORS.database}
                    border={COLORS.databaseBorder}
                    icon={<DatabaseIcon />}
                />

                {/* SQLAlchemy -> PostgreSQL */}
                <DownArrow
                    x={900}
                    y1={1160}
                    y2={1210}
                    label="SQL"
                />

                {/* =====================================================
                    EXTERNAL SERVICES
                ====================================================== */}

                <LayerLabel
                    x={1540}
                    y={330}
                    text="Services externes"
                />

                {/* Cloudinary */}
                <Box
                    x={1570}
                    y={390}
                    width={210}
                    height={175}
                    title="Cloudinary"
                    subtitle="Stockage média"
                    fill={COLORS.service}
                    border={COLORS.serviceBorder}
                    icon={<CloudIcon />}
                >
                    <text
                        x={1595}
                        y={480}
                        fontFamily={FONT}
                        fontSize={12.5}
                        fill={COLORS.text}
                    >
                        Images produits
                    </text>

                    <text
                        x={1595}
                        y={505}
                        fontFamily={FONT}
                        fontSize={12.5}
                        fill={COLORS.text}
                    >
                        et médias
                    </text>

                    <text
                        x={1595}
                        y={540}
                        fontFamily={FONT}
                        fontSize={11.5}
                        fill={COLORS.muted}
                    >
                        CDN / URL média
                    </text>
                </Box>

                {/* SMTP */}
                <Box
                    x={1570}
                    y={650}
                    width={210}
                    height={175}
                    title="SMTP"
                    subtitle="Service d'e-mail"
                    fill={COLORS.service}
                    border={COLORS.serviceBorder}
                    icon={<MailIcon />}
                >
                    <text
                        x={1595}
                        y={740}
                        fontFamily={FONT}
                        fontSize={12.5}
                        fill={COLORS.text}
                    >
                        Confirmation
                    </text>

                    <text
                        x={1595}
                        y={765}
                        fontFamily={FONT}
                        fontSize={12.5}
                        fill={COLORS.text}
                    >
                        de commande
                    </text>

                    <text
                        x={1595}
                        y={800}
                        fontFamily={FONT}
                        fontSize={11.5}
                        fill={COLORS.muted}
                    >
                        Reçu par e-mail
                    </text>
                </Box>

                {/* FastAPI -> Cloudinary */}
                <Arrow
                    x1={1520}
                    y1={480}
                    x2={1570}
                    y2={480}
                    label="Upload média"
                    labelX={1545}
                    labelY={445}
                />

                {/* FastAPI -> SMTP */}
                <Arrow
                    x1={1520}
                    y1={760}
                    x2={1570}
                    y2={760}
                    label="SMTP"
                    labelX={1545}
                    labelY={725}
                />

                {/* =====================================================
                    ARCHITECTURE FLOW INDICATORS
                ====================================================== */}

                <g>
                    <rect
                        x={90}
                        y={115}
                        width={410}
                        height={100}
                        rx={12}
                        fill="#FFFFFF"
                        stroke={COLORS.divider}
                        strokeWidth={1.2}
                    />

                    <text
                        x={115}
                        y={145}
                        fontFamily={FONT}
                        fontSize={13}
                        fontWeight="700"
                        fill={COLORS.muted}
                    >
                        FLUX UTILISATEUR
                    </text>

                    <text
                        x={115}
                        y={175}
                        fontFamily={FONT}
                        fontSize={13}
                        fill={COLORS.text}
                    >
                        Navigateur → React → FastAPI
                    </text>

                    <text
                        x={115}
                        y={198}
                        fontFamily={FONT}
                        fontSize={12}
                        fill={COLORS.muted}
                    >
                        Requêtes HTTP / réponses JSON
                    </text>
                </g>

                <g>
                    <rect
                        x={90}
                        y={755}
                        width={150}
                        height={130}
                        rx={12}
                        fill="#FFFFFF"
                        stroke={COLORS.divider}
                        strokeWidth={1.2}
                    />

                    <text
                        x={110}
                        y={785}
                        fontFamily={FONT}
                        fontSize={12}
                        fontWeight="700"
                        fill={COLORS.muted}
                    >
                        RESPONSABILITÉS
                    </text>

                    <text
                        x={110}
                        y={815}
                        fontFamily={FONT}
                        fontSize={12}
                        fill={COLORS.text}
                    >
                        Métier
                    </text>

                    <text
                        x={110}
                        y={840}
                        fontFamily={FONT}
                        fontSize={12}
                        fill={COLORS.text}
                    >
                        Validation
                    </text>

                    <text
                        x={110}
                        y={865}
                        fontFamily={FONT}
                        fontSize={12}
                        fill={COLORS.text}
                    >
                        Persistance
                    </text>
                </g>

                {/* =====================================================
                    LEGEND
                ====================================================== */}

                <g>
                    <rect
                        x={1350}
                        y={1000}
                        width={390}
                        height={125}
                        rx={12}
                        fill="#FFFFFF"
                        stroke={COLORS.divider}
                        strokeWidth={1.2}
                    />

                    <text
                        x={1380}
                        y={1030}
                        fontFamily={FONT}
                        fontSize={13}
                        fontWeight="700"
                        fill={COLORS.text}
                    >
                        Architecture en couches
                    </text>

                    <line
                        x1={1380}
                        y1={1055}
                        x2={1430}
                        y2={1055}
                        stroke={COLORS.arrow}
                        strokeWidth={2}
                        markerEnd="url(#arrow)"
                    />

                    <text
                        x={1445}
                        y={1060}
                        fontFamily={FONT}
                        fontSize={12}
                        fill={COLORS.muted}
                    >
                        Communication interne
                    </text>

                    <line
                        x1={1380}
                        y1={1085}
                        x2={1430}
                        y2={1085}
                        stroke={COLORS.arrowLight}
                        strokeWidth={2}
                        strokeDasharray="8 7"
                        markerEnd="url(#arrowLight)"
                    />

                    <text
                        x={1445}
                        y={1090}
                        fontFamily={FONT}
                        fontSize={12}
                        fill={COLORS.muted}
                    >
                        Service externe
                    </text>
                </g>
            </svg>
        </div>
    );
}
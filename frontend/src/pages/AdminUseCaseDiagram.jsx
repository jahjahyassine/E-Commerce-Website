import React from "react";

const W = 1900;
const H = 1450;

const C = {
  text: "#111827",
  border: "#374151",
  system: "#1F2937",
  fill: "#F8FAFC",
  relation: "#4B5563",
};

/* =========================================================
   ADMIN USE CASES
   ========================================================= */

const nodes = {
  products: {
    label: "Gérer les produits",
    x: 450,
    y: 170,
  },

  variants: {
    label: "Gérer les variantes",
    x: 780,
    y: 100,
  },

  categories: {
    label: "Gérer les catégories",
    x: 780,
    y: 220,
  },

  brands: {
    label: "Gérer les marques",
    x: 780,
    y: 340,
  },

  promotions: {
    label: "Gérer les promotions",
    x: 780,
    y: 460,
  },

  inventory: {
    label: "Gérer les stocks",
    x: 450,
    y: 520,
  },

  stockChanges: {
    label: "Consulter les mouvements\nde stock",
    x: 780,
    y: 580,
  },

  suppliers: {
    label: "Gérer les fournisseurs",
    x: 780,
    y: 710,
  },

  orders: {
    label: "Gérer les commandes",
    x: 450,
    y: 850,
  },

  orderDetails: {
    label: "Consulter le détail\nd'une commande",
    x: 820,
    y: 820,
  },

  confirmOrder: {
    label: "Confirmer une commande",
    x: 1200,
    y: 700,
  },

  shipOrder: {
    label: "Expédier une commande",
    x: 1200,
    y: 800,
  },

  deliverOrder: {
    label: "Livrer une commande",
    x: 1200,
    y: 900,
  },

  completeOrder: {
    label: "Finaliser une commande",
    x: 1200,
    y: 1000,
  },

  cancelOrder: {
    label: "Annuler une commande",
    x: 1200,
    y: 1100,
  },

  payment: {
    label: "Gérer le paiement",
    x: 1200,
    y: 1200,
  },

  customers: {
    label: "Gérer les clients",
    x: 450,
    y: 1160,
  },

  customerDetails: {
    label: "Consulter le profil\nd'un client",
    x: 800,
    y: 1110,
  },

  deactivateCustomer: {
    label: "Désactiver un client",
    x: 800,
    y: 1220,
  },

  reviews: {
    label: "Modérer les avis",
    x: 450,
    y: 1360,
  },

  deleteReview: {
    label: "Supprimer un avis",
    x: 800,
    y: 1360,
  },

  dashboard: {
    label: "Consulter le tableau\nde bord",
    x: 1250,
    y: 250,
  },

  adminProfile: {
    label: "Gérer son profil\nadministrateur",
    x: 1250,
    y: 400,
  },
};

/* =========================================================
   ADMIN ACTOR
   ========================================================= */

const actor = {
  x: 80,
  y: 700,
};

/* =========================================================
   RELATIONSHIPS
   EXACTLY FROM THE PLANTUML
   ========================================================= */

const relations = [
  // Product management
  ["variants", "products", "extend"],

  // Order management
  ["orderDetails", "orders", "extend"],
  ["confirmOrder", "orderDetails", "extend"],
  ["shipOrder", "orderDetails", "extend"],
  ["deliverOrder", "orderDetails", "extend"],
  ["completeOrder", "orderDetails", "extend"],
  ["cancelOrder", "orderDetails", "extend"],
  ["payment", "orderDetails", "extend"],

  // Customer management
  ["customerDetails", "customers", "extend"],
  ["deactivateCustomer", "customerDetails", "extend"],

  // Reviews
  ["deleteReview", "reviews", "extend"],
];

/* =========================================================
   GEOMETRY
   ========================================================= */

const RX = 105;
const RY = 31;

function nodeCenter(node) {
  return {
    x: node.x,
    y: node.y,
  };
}

function ellipseBorderPoint(node, target) {
  const dx = target.x - node.x;
  const dy = target.y - node.y;

  if (dx === 0 && dy === 0) {
    return {
      x: node.x,
      y: node.y,
    };
  }

  const t =
    1 /
    Math.sqrt(
      (dx * dx) / (RX * RX) +
        (dy * dy) / (RY * RY)
    );

  return {
    x: node.x + dx * t,
    y: node.y + dy * t,
  };
}

function actorBorderPoint(target) {
  const dx = target.x - actor.x;
  const dy = target.y - actor.y;

  const length = Math.sqrt(dx * dx + dy * dy);

  return {
    x: actor.x + (dx / length) * 32,
    y: actor.y + (dy / length) * 55,
  };
}

/* =========================================================
   USE CASE
   ========================================================= */

function UseCase({ node }) {
  const lines = node.label.split("\n");

  return (
    <g>
      <ellipse
        cx={node.x}
        cy={node.y}
        rx={RX}
        ry={RY}
        fill={C.fill}
        stroke={C.border}
        strokeWidth="2"
      />

      <text
        x={node.x}
        y={node.y - ((lines.length - 1) * 7)}
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="16"
        fill={C.text}
      >
        {lines.map((line, index) => (
          <tspan
            key={index}
            x={node.x}
            dy={index === 0 ? 0 : 19}
          >
            {line}
          </tspan>
        ))}
      </text>
    </g>
  );
}

/* =========================================================
   ACTOR
   ========================================================= */

function Actor() {
  return (
    <g
      stroke={C.border}
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle
        cx={actor.x}
        cy={actor.y - 62}
        r="22"
        fill="white"
      />

      <line
        x1={actor.x}
        y1={actor.y - 40}
        x2={actor.x}
        y2={actor.y + 30}
      />

      <line
        x1={actor.x - 42}
        y1={actor.y - 5}
        x2={actor.x + 42}
        y2={actor.y - 5}
      />

      <line
        x1={actor.x}
        y1={actor.y + 30}
        x2={actor.x - 35}
        y2={actor.y + 82}
      />

      <line
        x1={actor.x}
        y1={actor.y + 30}
        x2={actor.x + 35}
        y2={actor.y + 82}
      />

      <text
        x={actor.x}
        y={actor.y + 115}
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="18"
        fill={C.text}
        stroke="none"
      >
        Administrateur
      </text>
    </g>
  );
}

/* =========================================================
   DEPENDENCY RELATION
   ========================================================= */

function Relation({ from, to, type }) {
  const source = nodes[from];
  const target = nodes[to];

  /*
   * SOURCE -> TARGET
   *
   * This is the critical part.
   */
  const start = ellipseBorderPoint(
    source,
    nodeCenter(target)
  );

  const end = ellipseBorderPoint(
    target,
    nodeCenter(source)
  );

  const dx = end.x - start.x;
  const dy = end.y - start.y;

  const curve = Math.min(
    100,
    Math.max(35, Math.abs(dx) * 0.12)
  );

  const cx =
    start.x +
    dx * 0.5 +
    (dy > 0 ? -curve : curve);

  const cy =
    start.y +
    dy * 0.5;

  const path = `
    M ${start.x} ${start.y}
    Q ${cx} ${cy}
      ${end.x} ${end.y}
  `;

  const labelX =
    (start.x + end.x) / 2;

  const labelY =
    (start.y + end.y) / 2 - 10;

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke={C.relation}
        strokeWidth="1.6"
        strokeDasharray="7 5"
        markerEnd="url(#dependencyArrow)"
      />

      <text
        x={labelX}
        y={labelY}
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="13"
        fill={C.relation}
        paintOrder="stroke"
        stroke="white"
        strokeWidth="5"
      >
        {`«${type}»`}
      </text>
    </g>
  );
}

/* =========================================================
   ACTOR ASSOCIATION
   ========================================================= */

function ActorAssociation({ targetId }) {
  const target = nodes[targetId];

  const start = actorBorderPoint(target);

  const end = ellipseBorderPoint(
    target,
    nodeCenter(actor)
  );

  return (
    <path
      d={`
        M ${start.x} ${start.y}
        L ${end.x} ${end.y}
      `}
      fill="none"
      stroke={C.border}
      strokeWidth="1.8"
      markerEnd="url(#associationArrow)"
    />
  );
}

/* =========================================================
   MAIN
   ========================================================= */

export default function AdminUseCaseDiagram() {
  const actorAssociations = [
    "products",
    "variants",
    "categories",
    "brands",
    "promotions",
    "inventory",
    "stockChanges",
    "suppliers",
    "orders",
    "customers",
    "reviews",
    "dashboard",
    "adminProfile",
  ];

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="mx-auto w-fit">

        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Diagramme de cas d'utilisation — Administrateur
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Plateforme e-commerce ByteStore
          </p>
        </div>

        <div className="overflow-auto border border-gray-300 bg-white">

          <svg
            width={W}
            height={H}
            viewBox={`0 0 ${W} ${H}`}
            xmlns="http://www.w3.org/2000/svg"
          >

            <defs>

              <marker
                id="associationArrow"
                markerWidth="9"
                markerHeight="9"
                refX="8"
                refY="4.5"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path
                  d="M 0 0 L 9 4.5 L 0 9"
                  fill="none"
                  stroke={C.border}
                  strokeWidth="1.2"
                />
              </marker>

              <marker
                id="dependencyArrow"
                markerWidth="9"
                markerHeight="9"
                refX="8"
                refY="4.5"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path
                  d="M 0 0 L 9 4.5 L 0 9"
                  fill="none"
                  stroke={C.relation}
                  strokeWidth="1.2"
                />
              </marker>

            </defs>

            {/* SYSTEM */}

            <rect
              x="180"
              y="35"
              width="1650"
              height="1370"
              rx="4"
              fill="white"
              stroke={C.system}
              strokeWidth="2"
            />

            <text
              x="205"
              y="72"
              fontFamily="Arial, Helvetica, sans-serif"
              fontSize="20"
              fontWeight="600"
              fill={C.text}
            >
              Plateforme e-commerce ByteStore
            </text>

            {/* RELATIONS */}

            {relations.map(
              ([from, to, type], index) => (
                <Relation
                  key={index}
                  from={from}
                  to={to}
                  type={type}
                />
              )
            )}

            {/* ACTOR ASSOCIATIONS */}

            {actorAssociations.map((id) => (
              <ActorAssociation
                key={id}
                targetId={id}
              />
            ))}

            {/* USE CASES */}

            {Object.entries(nodes).map(
              ([id, node]) => (
                <UseCase
                  key={id}
                  node={node}
                />
              )
            )}

            <Actor />

          </svg>
        </div>
      </div>
    </div>
  );
}
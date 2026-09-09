import React from "react";

const W = 2500;
const H = 1850;

const C = {
  text: "#111827",
  border: "#374151",
  system: "#1F2937",
  fill: "#F8FAFC",
  relation: "#4B5563",
};

/* =========================================================
   USE CASES
   ========================================================= */

const nodes = {
  /* ---------- ACCOUNT ---------- */

  register: {
    label: "S'inscrire",
    x: 430,
    y: 170,
  },

  login: {
    label: "S'authentifier",
    x: 430,
    y: 300,
  },

  profile: {
    label: "Gérer son profil",
    x: 430,
    y: 500,
  },

  updateProfile: {
    label: "Modifier ses informations",
    x: 780,
    y: 390,
  },

  updatePhoto: {
    label: "Modifier sa photo\nde profil",
    x: 780,
    y: 500,
  },

  changePassword: {
    label: "Changer son mot\nde passe",
    x: 780,
    y: 610,
  },

  deactivateAccount: {
    label: "Désactiver son compte",
    x: 780,
    y: 720,
  },

  /* ---------- PRODUCT DISCOVERY ---------- */

  browseProducts: {
    label: "Consulter les produits",
    x: 1180,
    y: 170,
  },

  searchProducts: {
    label: "Rechercher des produits",
    x: 1550,
    y: 90,
  },

  filterProducts: {
    label: "Filtrer les produits",
    x: 1550,
    y: 190,
  },

  sortProducts: {
    label: "Trier les produits",
    x: 1550,
    y: 290,
  },

  productDetails: {
    label: "Consulter les détails\nd'un produit",
    x: 1180,
    y: 420,
  },

  viewVariants: {
    label: "Consulter les variantes",
    x: 1550,
    y: 420,
  },

  variantDetails: {
    label: "Consulter les détails\nd'une variante",
    x: 1550,
    y: 540,
  },

  productReviews: {
    label: "Consulter les avis\nd'un produit",
    x: 1550,
    y: 660,
  },

  categories: {
    label: "Consulter les catégories",
    x: 1180,
    y: 760,
  },

  brands: {
    label: "Consulter les marques",
    x: 1550,
    y: 780,
  },

  tags: {
    label: "Consulter les tags",
    x: 1550,
    y: 900,
  },

  /* ---------- CART ---------- */

  cart: {
    label: "Gérer son panier",
    x: 1180,
    y: 1070,
  },

  addCart: {
    label: "Ajouter un article\nau panier",
    x: 1580,
    y: 1050,
  },

  updateCart: {
    label: "Modifier la quantité\nd'un article",
    x: 1580,
    y: 1170,
  },

  removeCart: {
    label: "Supprimer un article\ndu panier",
    x: 1580,
    y: 1290,
  },

  clearCart: {
    label: "Vider le panier",
    x: 1580,
    y: 1410,
  },

  selectVariant: {
    label: "Sélectionner une variante",
    x: 1180,
    y: 1280,
  },

  /* ---------- ORDERS ---------- */

  placeOrder: {
    label: "Passer une commande",
    x: 1180,
    y: 1510,
  },

  orderHistory: {
    label: "Consulter ses commandes",
    x: 550,
    y: 970,
  },

  orderDetails: {
    label: "Consulter le détail\nd'une commande",
    x: 550,
    y: 1110,
  },

  cancelOrder: {
    label: "Annuler une commande",
    x: 550,
    y: 1250,
  },

  /* ---------- REVIEWS ---------- */

  myReviews: {
    label: "Gérer ses avis",
    x: 430,
    y: 1430,
  },

  addReview: {
    label: "Ajouter un avis",
    x: 780,
    y: 1370,
  },

  editReview: {
    label: "Modifier un avis",
    x: 780,
    y: 1470,
  },

  deleteReview: {
    label: "Supprimer un avis",
    x: 780,
    y: 1570,
  },

  viewMyReviews: {
    label: "Consulter ses avis",
    x: 780,
    y: 1670,
  },
};

/* =========================================================
   ACTOR
   ========================================================= */

const actor = {
  x: 80,
  y: 850,
};

/* =========================================================
   ACTOR ASSOCIATIONS
   EXACTLY AS IN PLANTUML
   ========================================================= */

const actorAssociations = [
  "register",
  "login",
  "profile",
  "browseProducts",
  "productDetails",
  "viewVariants",
  "variantDetails",
  "productReviews",
  "categories",
  "brands",
  "tags",
  "cart",
  "placeOrder",
  "orderHistory",
  "myReviews",
  "cancelOrder",
];

/* =========================================================
   RELATIONSHIPS
   SOURCE -> TARGET

   These are copied from the original PlantUML logic.
   ========================================================= */

const relations = [
  /* Product discovery */

  ["searchProducts", "browseProducts", "extend"],
  ["filterProducts", "browseProducts", "extend"],
  ["sortProducts", "browseProducts", "extend"],

  /* Cart */

  ["addCart", "selectVariant", "include"],
  ["addCart", "cart", "extend"],
  ["updateCart", "cart", "extend"],
  ["removeCart", "cart", "extend"],
  ["clearCart", "cart", "extend"],

  /* Authentication */

  ["placeOrder", "login", "include"],
  ["cart", "login", "include"],

  /* Orders */

  ["orderDetails", "orderHistory", "extend"],
  ["cancelOrder", "orderDetails", "extend"],

  /* Reviews */

  ["addReview", "myReviews", "extend"],
  ["editReview", "myReviews", "extend"],
  ["deleteReview", "myReviews", "extend"],
  ["viewMyReviews", "myReviews", "extend"],

  /* Profile */

  ["updateProfile", "profile", "extend"],
  ["updatePhoto", "profile", "extend"],
  ["changePassword", "profile", "extend"],
  ["deactivateAccount", "profile", "extend"],
];

/* =========================================================
   GEOMETRY
   ========================================================= */

const RX = 112;
const RY = 34;

function center(node) {
  return {
    x: node.x,
    y: node.y,
  };
}

/*
 * Exact intersection between a line and an ellipse.
 *
 * This ensures the arrow terminates exactly on the border
 * of the use-case ellipse.
 */
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

/*
 * Actor is a stick figure.
 * Associations originate from the actor and terminate
 * at the use-case border.
 */
function actorStart(target) {
  const dx = target.x - actor.x;
  const dy = target.y - actor.y;

  const length = Math.sqrt(dx * dx + dy * dy);

  return {
    x: actor.x + (dx / length) * 35,
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
        y={
          node.y -
          ((lines.length - 1) * 9)
        }
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="16"
        fill={C.text}
      >
        {lines.map((line, index) => (
          <tspan
            key={index}
            x={node.x}
            dy={index === 0 ? 0 : 20}
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
        cy={actor.y - 65}
        r="23"
        fill="white"
      />

      <line
        x1={actor.x}
        y1={actor.y - 42}
        x2={actor.x}
        y2={actor.y + 32}
      />

      <line
        x1={actor.x - 44}
        y1={actor.y - 5}
        x2={actor.x + 44}
        y2={actor.y - 5}
      />

      <line
        x1={actor.x}
        y1={actor.y + 32}
        x2={actor.x - 36}
        y2={actor.y + 86}
      />

      <line
        x1={actor.x}
        y1={actor.y + 32}
        x2={actor.x + 36}
        y2={actor.y + 86}
      />

      <text
        x={actor.x}
        y={actor.y + 120}
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="18"
        fill={C.text}
        stroke="none"
      >
        Client
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

  const start = ellipseBorderPoint(
    source,
    center(target)
  );

  const end = ellipseBorderPoint(
    target,
    center(source)
  );

  /*
   * Create a controlled curved path.
   *
   * Curvature is kept small to preserve the UML appearance.
   */
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  let cx = (start.x + end.x) / 2;
  let cy = (start.y + end.y) / 2;

  if (Math.abs(dx) > Math.abs(dy)) {
    cy += dy > 0 ? 55 : -55;
  } else {
    cx += dx > 0 ? 55 : -55;
  }

  const path = `
    M ${start.x} ${start.y}
    Q ${cx} ${cy}
      ${end.x} ${end.y}
  `;

  /*
   * Put the label slightly away from the middle of the line.
   */
  const labelX =
    (start.x + end.x) / 2;

  const labelY =
    (start.y + end.y) / 2 - 12;

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
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
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

  const start = actorStart(target);

  const end = ellipseBorderPoint(
    target,
    center(actor)
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
   MAIN COMPONENT
   ========================================================= */

export default function ClientUseCaseDiagram() {
  return (
    <div className="min-h-screen bg-white p-8">

      <div className="mx-auto w-fit">

        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Diagramme de cas d'utilisation — Client
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

              {/* Actor association */}

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

              {/* Include / Extend */}

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

            {/* =================================================
                SYSTEM BOUNDARY
                ================================================= */}

            <rect
              x="210"
              y="40"
              width="2210"
              height="1740"
              rx="4"
              fill="white"
              stroke={C.system}
              strokeWidth="2"
            />

            <text
              x="240"
              y="80"
              fontFamily="Arial, Helvetica, sans-serif"
              fontSize="21"
              fontWeight="600"
              fill={C.text}
            >
              Plateforme e-commerce ByteStore
            </text>

            {/* =================================================
                DEPENDENCY RELATIONSHIPS
                Draw BEFORE use cases so the ovals stay clean.
                ================================================= */}

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

            {/* =================================================
                ACTOR ASSOCIATIONS
                ================================================= */}

            {actorAssociations.map(
              (targetId) => (
                <ActorAssociation
                  key={targetId}
                  targetId={targetId}
                />
              )
            )}

            {/* =================================================
                USE CASES
                ================================================= */}

            {Object.entries(nodes).map(
              ([id, node]) => (
                <UseCase
                  key={id}
                  node={node}
                />
              )
            )}

            {/* =================================================
                ACTOR
                ================================================= */}

            <Actor />

          </svg>

        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    TrendingUp,
    TrendingDown,
    ShoppingCart,
    Users,
    Package,
    DollarSign,
    X,
    ArrowUpRight,
    ChevronRight,
    BarChart3,
    UserRound,
    Tags,
    Store,
} from "lucide-react";

import AdminSidebar from "../../components/AdminSidebar";
import DotField from "../../../../components/animation/DotField.jsx";

import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";


const BASE_URL = import.meta.env.VITE_BASE_URL


function formatCurrency(value) {
    return `${Number(value || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })} DH`;
}


function formatNumber(value) {
    return Number(value || 0).toLocaleString("en-US");
}


function formatDate(date) {
    const parsed = new Date(`${date}T00:00:00`);

    return parsed.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}



function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    iconClass = "text-admin-primary",
}) {
    return (
        <div
            className="
                border border-admin-border
                bg-admin-surface
                rounded-2xl
                p-5
                transition-all
                duration-300
                hover:border-admin-border-hover
            "
        >
            <div className="flex items-start justify-between gap-4">

                <div>
                    <p className="text-sm text-admin-muted">
                        {title}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-admin-text">
                        {value}
                    </p>

                    {subtitle && (
                        <p className="mt-1 text-xs text-admin-muted">
                            {subtitle}
                        </p>
                    )}
                </div>

                <div
                    className={`
                        flex items-center justify-center
                        h-10 w-10
                        rounded-xl
                        bg-white/5
                        border border-admin-border
                        ${iconClass}
                    `}
                >
                    <Icon className="h-5 w-5" />
                </div>

            </div>
        </div>
    );
}



function RankingModal({
    title,
    type,
    data,
    onClose,
    onNavigate,
}) {
    if (!data) {
        return null;
    }

    const getName = (item) => {
        if (type === "products") {
            return item.product_name;
        }

        if (type === "categories") {
            return item.category_name;
        }

        if (type === "brands") {
            return item.brand_name;
        }

        if (type === "customers") {
            return item.customer_name;
        }

        return "Unknown";
    };

    const getId = (item) => {
        if (type === "products") {
            return item.product_id;
        }

        if (type === "categories") {
            return item.category_id;
        }

        if (type === "brands") {
            return item.brand_id;
        }

        if (type === "customers") {
            return item.customer_id;
        }

        return null;
    };

    const handleClick = (item) => {
        const id = getId(item);

        if (!id) {
            return;
        }

        onNavigate(type, id);
    };

    return (
        <div
            className="
                fixed inset-0 z-50
                flex items-center justify-center
                bg-black/60
                backdrop-blur-sm
                p-4
            "
            onClick={onClose}
        >
            <div
                className="
                    w-full max-w-3xl
                    max-h-[85vh]
                    overflow-hidden
                    rounded-2xl
                    border border-admin-border
                    bg-[#0F172A]
                    shadow-2xl
                "
                onClick={(e) => e.stopPropagation()}
            >

                <div
                    className="
                        flex items-center justify-between
                        px-6 py-5
                        border-b border-admin-border
                    "
                >
                    <div>
                        <h2 className="text-xl font-bold text-admin-text">
                            {title}
                        </h2>

                        <p className="text-sm text-admin-muted mt-1">
                            Last 30 days · {data.length} total
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="
                            p-2
                            rounded-lg
                            text-admin-muted
                            hover:text-admin-text
                            hover:bg-white/5
                            transition-colors
                        "
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>


                <div className="overflow-y-auto max-h-[calc(85vh-90px)]">

                    {data.length === 0 ? (
                        <div className="px-6 py-12 text-center text-admin-muted">
                            No data available.
                        </div>
                    ) : (
                        <div className="divide-y divide-admin-border">

                            {data.map((item, index) => (
                                <button
                                    key={getId(item) ?? index}
                                    onClick={() => handleClick(item)}
                                    className="
                                        w-full
                                        flex items-center gap-4
                                        px-6 py-4
                                        text-left
                                        hover:bg-white/5
                                        transition-colors
                                    "
                                >


                                    <div
                                        className="
                                            flex-shrink-0
                                            w-8
                                            text-center
                                            text-sm
                                            font-bold
                                            text-admin-muted
                                        "
                                    >
                                        #{index + 1}
                                    </div>

                                    <div className="flex-1 min-w-0">

                                        <p className="font-medium truncate text-admin-text">
                                            {getName(item)}
                                        </p>

                                        {type === "customers" && (
                                            <p className="text-xs text-admin-muted truncate mt-1">
                                                {item.email}
                                            </p>
                                        )}

                                    </div>

                                    <div className="text-right flex-shrink-0">

                                        <p className="font-semibold text-admin-text">
                                            {type === "customers"
                                                ? `${formatNumber(item.orders)} orders`
                                                : `${formatNumber(item.sales)} pcs`
                                            }
                                        </p>

                                        <p className="text-xs text-admin-muted mt-1">
                                            {type === "customers"
                                                ? formatCurrency(item.spent)
                                                : formatCurrency(item.revenue)
                                            }
                                        </p>

                                    </div>

                                    <ChevronRight
                                        className="
                                            h-4 w-4
                                            text-admin-muted
                                            flex-shrink-0
                                        "
                                    />

                                </button>
                            ))}

                        </div>
                    )}

                </div>

            </div>
        </div>
    );
}

function RankingCard({
    title,
    icon: Icon,
    data,
    type,
    onSeeMore,
    onNavigate,
}) {
    const topFive = useMemo(
        () => (data ?? []).slice(0, 5),
        [data]
    );

    const getName = (item) => {
        if (type === "products") {
            return item.product_name;
        }

        if (type === "categories") {
            return item.category_name;
        }

        if (type === "brands") {
            return item.brand_name;
        }

        if (type === "customers") {
            return item.customer_name;
        }

        return "Unknown";
    };

    const getId = (item) => {
        if (type === "products") {
            return item.product_id;
        }

        if (type === "categories") {
            return item.category_id;
        }

        if (type === "brands") {
            return item.brand_id;
        }

        if (type === "customers") {
            return item.customer_id;
        }

        return null;
    };

    const handleNavigate = (item) => {
        const id = getId(item);

        if (!id) {
            return;
        }

        onNavigate(type, id);
    };

    return (
        <div
            className="
                border border-admin-border
                bg-admin-surface
                rounded-2xl
                overflow-hidden
            "
        >

            <div
                className="
                    flex items-center justify-between
                    px-5 py-4
                    border-b border-admin-border
                "
            >

                <div className="flex items-center gap-3">

                    <div
                        className="
                            flex items-center justify-center
                            h-9 w-9
                            rounded-lg
                            bg-white/5
                            border border-admin-border
                            text-admin-primary
                        "
                    >
                        <Icon className="h-4 w-4" />
                    </div>

                    <div>
                        <h3 className="font-semibold text-admin-text">
                            {title}
                        </h3>

                        <p className="text-xs text-admin-muted mt-0.5">
                            Last 30 days
                        </p>
                    </div>

                </div>

                {data?.length > 5 && (
                    <button
                        onClick={onSeeMore}
                        className="
                            flex items-center gap-1
                            text-xs
                            text-admin-primary
                            hover:text-admin-primary-hover
                            transition-colors
                        "
                    >
                        See more
                        <ArrowUpRight className="h-3 w-3" />
                    </button>
                )}

            </div>

            <div>

                {topFive.length === 0 ? (
                    <div className="px-5 py-10 text-center text-sm text-admin-muted">
                        No sales data available.
                    </div>
                ) : (
                    topFive.map((item, index) => (
                        <button
                            key={getId(item) ?? index}
                            onClick={() => handleNavigate(item)}
                            className="
                                w-full
                                flex items-center gap-3
                                px-5 py-4
                                text-left
                                border-b border-admin-border
                                last:border-b-0
                                hover:bg-white/5
                                transition-colors
                            "
                        >

                            {/* Rank */}

                            <div
                                className="
                                    w-7
                                    flex-shrink-0
                                    text-center
                                    text-sm
                                    font-bold
                                    text-admin-muted
                                "
                            >
                                {index + 1}
                            </div>


                            <div className="flex-1 min-w-0">

                                <p className="text-sm font-medium truncate text-admin-text">
                                    {getName(item)}
                                </p>

                                {type === "customers" && (
                                    <p className="text-xs text-admin-muted truncate mt-1">
                                        {item.email}
                                    </p>
                                )}

                            </div>

                            <div className="text-right flex-shrink-0">

                                <p className="text-sm font-semibold text-admin-text">
                                    {type === "customers"
                                        ? `${formatNumber(item.orders)} orders`
                                        : `${formatNumber(item.sales)} pcs`
                                    }
                                </p>

                                <p className="text-xs text-admin-muted mt-1">
                                    {type === "customers"
                                        ? formatCurrency(item.spent)
                                        : formatCurrency(item.revenue)
                                    }
                                </p>

                            </div>

                        </button>
                    ))
                )}

            </div>

        </div>
    );
}


export default function Dashboard() {

    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [isPending, setIsPending] = useState(true);
    const [error, setError] = useState(null);

    const [modal, setModal] = useState(null);


    useEffect(() => {

        let cancelled = false;

        const fetchDashboard = async () => {

            try {

                setIsPending(true);
                setError(null);

                const response = await fetch(
                    `${BASE_URL}/admin/dashboard`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error(
                        `Failed to load dashboard (${response.status})`
                    );
                }

                const result = await response.json();

                if (!cancelled) {
                    setDashboard(result);
                }

            } catch (err) {

                if (!cancelled) {
                    setError(err);
                }

            } finally {

                if (!cancelled) {
                    setIsPending(false);
                }

            }
        };

        fetchDashboard();

        return () => {
            cancelled = true;
        };

    }, []);



    const handleNavigate = (type, id) => {

        if (type === "products") {
            navigate(`/admin/products/${id}`);
            return;
        }

        if (type === "categories") {
            navigate(`/admin/categories/${id}`);
            return;
        }

        if (type === "brands") {
            navigate(`/admin/brands/${id}`);
            return;
        }

        if (type === "customers") {
            navigate(`/admin/customers/${id}`);
            return;
        }
    };

    if (isPending) {

        return (
            <section
                className="
                    h-screen max-w-full
                    font-sans
                    bg-[#0F172A]
                    text-admin-text
                    flex
                    justify-center
                    items-center
                "
            >
                <div>
                    Loading dashboard...
                </div>
            </section>
        );
    }


    if (error) {

        return (
            <section
                className="
                    h-screen max-w-full
                    bg-[#0F172A]
                    text-admin-text
                    flex
                    justify-center
                    items-center
                "
            >
                <div className="text-center">

                    <p className="text-red-400 mb-2">
                        Failed to load dashboard.
                    </p>

                    <p className="text-sm text-admin-muted">
                        {error.message}
                    </p>

                </div>
            </section>
        );
    }


    const stats = dashboard?.stats ?? {};

    const topProducts = dashboard?.top_products ?? [];
    const topCategories = dashboard?.top_categories ?? [];
    const topBrands = dashboard?.top_brands ?? [];
    const topCustomers = dashboard?.top_customers ?? [];

    const revenueChart = dashboard?.revenue_chart ?? [];


    return (
        <main
            className="
                h-screen max-w-full
                font-sans
                bg-[#0F172A]
                flex gap-4
            "
        >

            <header className="relative z-10 h-screen">
                <AdminSidebar />
            </header>


            <div
                className="
                    fixed inset-0
                    w-full h-full
                    z-0
                    pointer-events-none
                "
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


            <section
                className="
                    relative z-10
                    h-screen
                    flex-1
                    text-admin-text
                    order-2
                    overflow-y-auto
                    p-4
                "
            >


                <div
                    className="
                        flex items-center justify-between
                        border-b border-admin-border
                        pb-3 mb-4
                    "
                >
                    <div>

                        <h1 className="text-3xl">
                            Dashboard
                        </h1>

                        <p className="text-sm text-admin-muted mt-1">
                            Overview of your store performance
                        </p>

                    </div>
                </div>


                <div
                    className="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        xl:grid-cols-4
                        gap-4
                        mb-4
                    "
                >

                    <StatCard
                        title="Total Revenue"
                        value={formatCurrency(stats.total_revenue)}
                        subtitle={`${formatCurrency(stats.last_30_days_revenue)} in the last 30 days`}
                        icon={DollarSign}
                        iconClass="text-admin-active"
                    />

                    <StatCard
                        title="Total Orders"
                        value={formatNumber(stats.total_orders)}
                        subtitle={`${formatNumber(stats.cancelled_orders)} cancelled`}
                        icon={ShoppingCart}
                        iconClass="text-admin-primary"
                    />

                    <StatCard
                        title="Total Customers"
                        value={formatNumber(stats.total_customers)}
                        subtitle={`+${formatNumber(stats.new_customers)} new in 30 days`}
                        icon={Users}
                        iconClass="text-admin-reviews"
                    />

                    <StatCard
                        title="Total Products"
                        value={formatNumber(stats.total_products)}
                        subtitle={`${formatNumber(stats.last_30_days_orders)} orders in last 30 days`}
                        icon={Package}
                        iconClass="text-admin-primary"
                    />

                </div>

                <div
                    className="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        lg:grid-cols-3
                        gap-4
                        mb-4
                    "
                >

                    <StatCard
                        title="30-Day Revenue"
                        value={formatCurrency(stats.last_30_days_revenue)}
                        subtitle="Revenue excluding cancelled orders"
                        icon={TrendingUp}
                        iconClass="text-admin-active"
                    />

                    <StatCard
                        title="Average Order Value"
                        value={formatCurrency(stats.average_order_value)}
                        subtitle="Average non-cancelled order"
                        icon={BarChart3}
                        iconClass="text-admin-primary"
                    />

                    <StatCard
                        title="Cancellation Rate"
                        value={`${Number(
                            stats.cancellation_rate || 0
                        ).toFixed(2)}%`}
                        subtitle={`${formatNumber(
                            stats.cancelled_orders
                        )} cancelled orders`}
                        icon={TrendingDown}
                        iconClass="text-red-400"
                    />

                </div>

                <div
                    className="
                        border border-admin-border
                        bg-admin-surface
                        rounded-2xl
                        overflow-hidden
                        mb-4
                    "
                >

                    <div
                        className="
                            flex items-center justify-between
                            px-5 py-4
                            border-b border-admin-border
                        "
                    >

                        <div>

                            <h3 className="font-semibold">
                                Revenue Overview
                            </h3>

                            <p className="text-xs text-admin-muted mt-1">
                                Revenue and orders over the last 30 days
                            </p>

                        </div>

                        <div className="text-right">

                            <p className="text-lg font-bold">
                                {formatCurrency(
                                    stats.last_30_days_revenue
                                )}
                            </p>

                            <p className="text-xs text-admin-muted">
                                Last 30 days
                            </p>

                        </div>

                    </div>


                    <div className="p-5">

                        <div className="h-[300px]">

                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <AreaChart
                                    data={revenueChart}
                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: 0,
                                        bottom: 0,
                                    }}
                                >

                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="rgba(148,163,184,0.12)"
                                        vertical={false}
                                    />

                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={formatDate}
                                        tick={{
                                            fill: "#94A3B8",
                                            fontSize: 11,
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                    />

                                    <YAxis
                                        tick={{
                                            fill: "#94A3B8",
                                            fontSize: 11,
                                        }}
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(value) =>
                                            `$${Number(value).toLocaleString()}`
                                        }
                                    />

                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#0F172A",
                                            border: "1px solid rgba(148,163,184,0.2)",
                                            borderRadius: "12px",
                                            color: "#F8FAFC",
                                        }}
                                        labelFormatter={(label) =>
                                            formatDate(label)
                                        }
                                        formatter={(value, name) => [
                                            name === "revenue"
                                                ? formatCurrency(value)
                                                : formatNumber(value),
                                            name === "revenue"
                                                ? "Revenue"
                                                : "Orders",
                                        ]}
                                    />

                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#60A5FA"
                                        fill="#60A5FA"
                                        fillOpacity={0.12}
                                        strokeWidth={2}
                                    />

                                </AreaChart>
                            </ResponsiveContainer>

                        </div>

                    </div>

                </div>


                <div
                    className="
                        grid
                        grid-cols-1
                        xl:grid-cols-2
                        gap-4
                    "
                >

                    <RankingCard
                        title="Top Products"
                        icon={Package}
                        data={topProducts}
                        type="products"
                        onNavigate={handleNavigate}
                        onSeeMore={() =>
                            setModal({
                                title: "Top Products",
                                type: "products",
                                data: topProducts,
                            })
                        }
                    />

                    <RankingCard
                        title="Top Categories"
                        icon={Tags}
                        data={topCategories}
                        type="categories"
                        onNavigate={handleNavigate}
                        onSeeMore={() =>
                            setModal({
                                title: "Top Categories",
                                type: "categories",
                                data: topCategories,
                            })
                        }
                    />

                    <RankingCard
                        title="Top Brands"
                        icon={Store}
                        data={topBrands}
                        type="brands"
                        onNavigate={handleNavigate}
                        onSeeMore={() =>
                            setModal({
                                title: "Top Brands",
                                type: "brands",
                                data: topBrands,
                            })
                        }
                    />

                    <RankingCard
                        title="Top Customers"
                        icon={UserRound}
                        data={topCustomers}
                        type="customers"
                        onNavigate={handleNavigate}
                        onSeeMore={() =>
                            setModal({
                                title: "Top Customers",
                                type: "customers",
                                data: topCustomers,
                            })
                        }
                    />

                </div>

                {modal && (
                    <RankingModal
                        title={modal.title}
                        type={modal.type}
                        data={modal.data}
                        onClose={() => setModal(null)}
                        onNavigate={(type, id) => {
                            setModal(null);
                            handleNavigate(type, id);
                        }}
                    />
                )}

            </section>

        </main>
    );
}
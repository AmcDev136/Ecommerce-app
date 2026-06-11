"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell,
} from "recharts";

// Tipos
interface DashboardData {
    kpis: {
        totalOrders: number;
        totalRevenue: number;
        totalProducts: number;
        totalUsers: number;
        outOfStockProducts: number;
    };
    lowStockProducts: { id: string; name: string; stock: number }[];
    recentOrders: {
        id: string;
        status: string;
        total: string;
        createdAt: string;
        user: { name: string | null; email: string };
        items: { id: string }[];
    }[];
    topProducts: {
        productId: string;
        totalSold: number;
        product?: {
            id: string;
            name: string;
            price: string;
            imageUrl: string | null;
        };
    }[];

    ordersByStatus: { 
        status: string;
        _count: { id: number }
    }[];

    revenueChartData: {
        date: string;
        revenue: number
    }[];
}

// Helpers
const STATUS_LABELS: Record<string, string> = {
    PENDING:   "Pendiente",
    CONFIRMED: "Confirmado",
    SHIPPED:   "Enviado",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
    PENDING:   "#F59E0B",
    CONFIRMED: "#3B82F6",
    SHIPPED:   "#8B5CF6",
    DELIVERED: "#10B981",
    CANCELLED: "#EF4444", 
};

const tooltipStyle: React.CSSProperties = {
    borderRadius: "8px",
    border: "px solid #E5E7EB",
    fontSize: "13px",
};

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        PENDING:   "bg-yellow-100 text-yellow-700",
        CONFIRMED: "bg-blue-100 text-blue-700",
        SHIPPED:   "bg-purple-100 text-purple-700",
        DELIVERED: "bg-green-100 text-green-700",
        CANCELLED: "bg-red-100 text-red-700",
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] ?? "bg-gray-100 text-gray-700"}`}>
            {STATUS_LABELS[status] ?? status}
        </span>
    );
}

// KPI Card
function KPICard({
    title,
    value,
    subtitle,
    icon,
    color = "blue",
} : {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    color?: "blue" | "green" | "purple" | "red" | "yellow";
}) {
    const colors = {
        blue:   "bg-blue-50 text-blue-600",
        green:  "bg-green-50 text-green-600",
        purple: "bg-purple-50 text-purple-600",
        red:    "bg-red-50 text-red-600",
        yellow: "bg-yellow-50 text-yellow-600",
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 flex items-start gap-4">
            <div className={`p-3 rounded-lg text-2xl ${colors[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
                {subtitle && (
                    <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
                )}
            </div>
        </div>
    );
}

// Quick Links
const QUICK_LINKS = [
    { label: "Gestionar productos", href: "/admin/products", icon: "🛍️" },
    { label: "Gestionar pedidos",   href: "/admin/orders",   icon: "📦" },
    { label: "Ver tienda",          href: "/products",       icon: "🏪" },
];

// Componente principal
export default function AdminDashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") { router.push("/login"); return; }
        if (session?.user.role !== "ADMIN") { router.push("/"); return; }

        const fetchDashboard = async () => {
            try {
                const { data: res } = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard`
                );
                setData(res.data);
            } catch {
                setError("Error al cargar el dashboard");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [status, session, router]);

    if (status == "loading" || loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-red-500">{error ?? "Sin datos"}</p>
            </div>
        );
    }
    
    const { 
        kpis,
        lowStockProducts,
        recentOrders,
        topProducts,
        ordersByStatus,
        revenueChartData 
    } = data;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 mt-">Resumen general de la tienda</p>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <KPICard
                        title="Ingresos totales"
                        value={`$${kpis.totalRevenue.toFixed(2)}`}
                        subtitle="Pedidos no cancelados"
                        icon="💰"
                        color="green"
                    />
                    <KPICard
                        title="Total de pedidos"
                        value={kpis.totalOrders}
                        subtitle="Todos los estados"
                        icon="📦"
                        color="blue"
                    />
                    <KPICard
                        title="Productos activos"
                        value={kpis.totalProducts}
                        subtitle={`${kpis.outOfStockProducts} agotados`}
                        icon="🛍️"
                        color="purple"
                    />
                    <KPICard
                        title="Clientes registrados"
                        value={kpis.totalUsers}
                        icon="👥"
                        color="yellow"
                    />
                </div>

                {/* Graficas - Fila principal */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

                    {/* Graficas de ingresos */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                        <h2 className="font-semibold text-gray-900 mb-1">
                            Ingresos últimos 7 días
                        </h2>
                        <p className="text-sm text-gray-400 mb-4">
                            Solo pedidos no cancelados
                        </p>
                        <ResponsiveContainer width="100%" height={240}>
                            <AreaChart data={revenueChartData}>
                            <defs>
                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                            <XAxis 
                                dataKey="date"
                                tick={{ fontSize: 12, fill: "#9CA3AF" }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: "#9CA3AF" }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v: number) => `$${v}`}
                            />
                            <Tooltip
                                contentStyle={tooltipStyle}
                                formatter={(value: any) => [
                                    `$${Number(value).toFixed(2)}`, "Ingresos",
                                ]}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#3B82F6"
                                strokeWidth={2}
                                fill="url(#revenueGradient)"
                            />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Pedidos por estado */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="font-semibold text-gray-900 mb-4">
                            Pedidos por estado
                        </h2>
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={ordersByStatus} layout="vertical">
                                <XAxis
                                    type="number"
                                    tick={{ fontSize: 11, fill: "#9CA3AF" }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="status"
                                    width={80}
                                    tick={{ fontSize: 11, fill: "#6B7280" }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(v: string) => STATUS_LABELS[v] ?? v}
                                />
                                <Tooltip
                                    contentStyle={tooltipStyle}
                                    formatter={(value: any) => [value, "Pedidos"]}
                                    labelFormatter={(label: any) => STATUS_LABELS[label] ?? label}
                                />
                                <Bar dataKey="_count.id" radius={[0, 4, 4, 0]}>
                                    {ordersByStatus.map((entry) => (
                                        <Cell
                                            key={entry.status}
                                            fill={STATUS_COLORS[entry.status] ?? "#9CA3AF"}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Fila secundaria */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Productos mas vendidos */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="font-semibold text-gray-900 mb-4">
                            Más vendidos
                        </h2>
                        {topProducts.length === 0 ? (
                            <p className="text-gray-400 text-sm">Sin datos aún</p>
                        ) : (
                            <div className="space-y-3">
                                {topProducts.map((item, index) => (
                                    <div key={item.productId} className="flex items-center gap-3">
                                        <span className="text-lg font-bold text-gray-300 w-6">
                                            {index + 1}
                                        </span>
                                        <div className="h-10 w-10 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                                            {item.product?.imageUrl ? (
                                                <img
                                                    src={item.product.imageUrl}
                                                    alt={item.product.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-gray-300 text-xs">
                                                    📦
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {item.product?.name ?? "Producto eliminado"}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {item.totalSold} vendidos
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Stock bajo */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="font-semibold text-gray-900 mb-1">
                            Stock bajo
                        </h2>
                        <p className="text-xs text-gray-400 mb-4">
                            Productos con 5 o menos unidades
                        </p>
                        {lowStockProducts.length === 0 ? (
                            <p className="text-green-500 text-sm font-medium">
                                Todo el stock está bien
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {lowStockProducts.map((product) => (
                                    <div key={product.id} className="flex items-center justify-between">
                                        <p className="text-sm text-gray-700 truncate flex-1">
                                            {product.name}
                                        </p>
                                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${product.stock <= 2
                                            ? "bg-red-100 text-red-600"
                                            : "bg-yellow-100 text-yellow-600"
                                            }`}
                                        >
                                            {product.stock} uds.
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Indicador de agotados */}
                        {kpis.outOfStockProducts > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-sm text-red-500 font-medium">
                                    ⚠️ {kpis.outOfStockProducts} producto(s) agotado(s)
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Actividad reciente */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="font-semibold text-gray-900 mb-4">
                            Actividad reciente
                        </h2>
                        {recentOrders.length === 0 ? (
                            <p className="text-gray-400 text-sm">Sin pedidos aún</p>
                        ) : (
                            <div className="space-y-3">
                                {recentOrders.map((order) => (
                                    <div key={order.id} className="flex items-start gap-3">
                                        <div className="h-8 w-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 text-sm">
                                            👤
                                        </div>
                                        <div className="flex- min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {order.user.name ?? order.user.email}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {order.items.length} producto(s) · ${parseFloat(order.total).toFixed(2)}
                                            </p>
                                        </div>
                                        <StatusBadge status={order.status} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Enlace rápido a gestión */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {QUICK_LINKS.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
                        >
                            <span className="text-2xl">{link.icon}</span>
                            <span className="font-medium text-gray-700">{link.label}</span>
                            <span className="ml-auto text-gray-400">→</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import { optional } from "zod";

interface Order {
    id: string;
    status: string;
    total: string;
    createdAt: string;
    user: { name: string | null; email: string };
    items: { id: string }[];
}

const STATUS_LABELS: Record<string, string> = {
    PENDING:   "Pendiente",
    CONFIRMED: "Confirmado",
    SHIPPED:   "Enviado",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
    PENDING:   "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    SHIPPED:   "bg-purple-100 text-purple-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
};

const STATUS_OPTIONS = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

function Statusbadge({ status }: { status: string }) {
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700"}`}>
            {STATUS_LABELS[status] ?? status}
        </span>
    );
}

export default function AdminOrdersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>("ALL");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/orders`
            );
            setOrders(data.data);
        } catch {
            toast.error("Error al cargar los pedidos");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") { router.push("/login"); return; }
        if (session?.user.role !== "ADMIN") { router.push("/"); return; }
        fetchOrders();
    }, [status, session, router, fetchOrders]);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        setUpdatingId(orderId);
        try {
            await axios.patch(
                `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/status`,
                { status: newStatus }
            );
            // Actualizar el estado localmente sin refetch
            setOrders((prev) =>
                prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
            );
            toast.success(`Estado actuualizado a ${STATUS_LABELS[newStatus]}`);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.error ?? "Error al actualizar");
            }
        } finally {
            setUpdatingId(null);
        }
    };

    // Filtrar pedidos por estado en el front
    const filteredOrders = filterStatus === "ALL"
        ? orders
        : orders.filter((o) => o.status === filterStatus);

    if (status === "loading" || loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Link
                            href="/admin"
                            className="text-sm text-blue-600 hover:underline block mb-1"
                        >
                            ← Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {filteredOrders.length} pedido(s)
                            {filterStatus == "ALL" && ` en estado ${STATUS_LABELS[filterStatus]}`}
                        </p>
                    </div>
                </div>

                {/* Filtros por estado */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setFilterStatus("ALL")}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            filterStatus === "ALL"
                            ? "bg-gray-900 text-white"
                            : "border border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                        >
                            Todos ({orders.length})
                        </button>
                        {STATUS_OPTIONS.map((s) => {
                            const count = orders.filter((o) => o.status === s).length;
                            return (
                                <button
                                    key={s}
                                    onClick={() => setFilterStatus(s)}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                    filterStatus === s
                                    ? "bg-gray-900 text-white"
                                    : "border border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                                >
                                    {STATUS_LABELS[s]} ({count})
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tabla de pedidos */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                                    Pedido
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                                    Cliente
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                                    Fecha
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                                    Items
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                                    Total
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                                    Estado
                                </th>
                                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-gray-400">
                                        No hay pedidos
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-gray-50 transition-colors"
                                    >
                                        {/* ID del pedido */}
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`orders/${order.id}`}
                                                className="text-sm font-mono text-blue-600 hover:underline"
                                            >
                                                #{order.id.slice(-8).toUpperCase()}
                                            </Link>
                                        </td>

                                        {/* Cliente */}
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-medium text-gray-900">
                                                {order.user.name ?? "-"}
                                            </p>
                                            <p className="text-xs text-gray-400">{order.user.email}</p>
                                        </td>

                                        {/* Fecha */}
                                        <td className="px-4 py-3">
                                            <p className="text-sm text-gray-600">
                                                {new Date(order.createdAt).toLocaleDateString("es-ES",{
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(order.createdAt).toLocaleTimeString("es-ES", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                        </td>

                                        {/* Items */}
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-gray-600">
                                                {order.items.length}
                                            </span>
                                        </td>

                                        {/* Total */}
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-semibold text-gray-900">
                                                ${parseFloat(order.total).toFixed(2)}
                                            </span>
                                        </td>

                                        {/* Estado */}
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end items-center gap-2">
                                                <select
                                                    value={order.status}
                                                    disabled={
                                                        updatingId === order.id || order.status === "CANCELLED" || order.status === "DELIVERED"
                                                    }
                                                    onChange={(e) =>
                                                        handleStatusChange(order.id, e.target.value)
                                                    }
                                                    className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {STATUS_OPTIONS.map((s) => (
                                                        <option key={s} value={s}>
                                                            {STATUS_LABELS[s]}
                                                        </option>
                                                    ))}
                                                </select>
                                                <Link
                                                    href={`/orders/${order.id}`}
                                                    className="text-xs text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg px-2 py-1.5 hover:bg-gray-50 transition-colors whitespace-nowrap"
                                                >
                                                    Ver detalle
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
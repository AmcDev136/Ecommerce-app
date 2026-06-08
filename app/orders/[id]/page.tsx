"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";

interface OrderItem {
    id: string;
    quantity: number;
    price: string;
    product: {
        id: string;
        name: string;
        imageUrl: string | null;
    };
}

interface Order {
    id: string;
    status: string;
    total: string;
    createdAt: string;
    items: OrderItem[];
    user?: { name: string | null; email: string };
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        PENDING:   "bg-yellow-100 text-yellow-700",
        CONFIRMED: "bg-blue-100 text-blue-700",
        SHIPPED:   "bg-purple-100 text-purple-700",
        DELIVERED: "bg-green-100 text-green-700",
        CANCELLED: "bg-red-100 text-red-700",
    };
    const labels: Record<string, string> ={
        PENDING:   "Pendiente",
        CONFIRMED: "Confirmado",
        SHIPPED:   "Enviado",
        DELIVERED: "Entregado",
        CANCELLED: "Cancelado",
    };
    return (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] ?? "bg-gray-100 text-gray-700"}`}>
            {labels[status] ?? status}
        </span>
    );
}

const STATUS_OPTIONS = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function OrderDetailPage({
    params,
} : {
    params: { id: string };
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
    }, [status, router]);

    useEffect(() => {
        if (status !== "authenticated") return;

        const fetchOrder = async () => {
            try {
                const { data } = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/orders/${params.id}`
                );
                setOrder(data.data);
            } catch {
                toast.error("Pedido no encontrado");
                router.push("/orders");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [status, params.id, router]);

    // Solo para admin, cambiar estado de pedido
    const handleStatusChange = async (newStatus: string) => {
        setUpdatingStatus(true);
        try {
            const { data } = await axios.patch(
                `${process.env.NEXT_PUBLIC_API_URL}/orders/${params.id}/status`,
                { status: newStatus }
            );
            setOrder((prev) => prev ? { ...prev, status: data.data.status }: prev);
            toast.success(`Estado actualizado a ${newStatus}`);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.error ?? "Error al actualizar estado");
            }
        } finally {
            setUpdatingStatus(false);
        }
    };

    if (loading) {
        return (
            <div className="felx justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link
                            href="/orders"
                            className="text-sm text-blue-600 hover:underline mb-2 block"
                        >
                            Volver a mis pedidos
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Pedido ${order.id.slice(-8).toUpperCase()}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {new Date(order.createdAt).toLocaleDateString("es-ES", {
                                year: "numeric", month: "long", day: "numeric",
                                hour: "2-digit", minute: "2-digit",
                            })}
                        </p>
                    </div>
                    <StatusBadge status={order.status} />
                </div>

                {/* Info del cliente */}
                {session?.user.role === "ADMIN" && order.user && (
                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-6">
                        <p className="text-sm font-medium text-purple-700 mb-1">Cliente</p>
                        <p className="text-gray-900">{order.user.name ?? "Sin nombre"}</p>
                        <p className="text-gray-500 text-sm">{order.user.email}</p>
                    </div>
                )}

                {/* Items del pedido */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
                    <div className="p-6 border-b">
                        <h2 className="font-semibold text-gray-900">
                            Productos ({order.items.length})
                        </h2>
                    </div>
                    <div className="divide-y">
                        {order.items.map((item) => (
                            <div key={item.id} className="p-4 flex items-center gap-4">
                                <div className="h-16 w-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                                    {item.product.imageUrl ? (
                                        <img
                                            src={item.product.imageUrl}
                                            alt={item.product.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                                            Sin imagen
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">{item.product.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                                    </p>
                                </div>
                                <p className="font-semibold text-gray-900">
                                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-blue-600">
                            ${parseFloat(order.total).toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Panel de cambio de estado (ADMIN) */}
                {session?.user.role === "ADMIN" && (
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="font.semibold text-gray-900 mb-4">
                            Gestionar estado
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            {STATUS_OPTIONS.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => handleStatusChange(s)}
                                    disabled={updatingStatus || order.status === s}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50
                                        ${order.status === s 
                                            ? "bg-blue-600 text-white"
                                            : "border border-gray-300 text-gray-700 hover:bg-gray-50"}`}
                                >
                                    {s === "PENDING" && "Pendiente"}
                                    {s === "CONFIRMED" && "Confirmar"}
                                    {s === "SHIPPED" && "Enviado"}
                                    {s === "DELIVERED" && "Entregado"}
                                    {s === "CANCELLED" && "Cancelar"}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
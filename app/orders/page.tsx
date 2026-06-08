"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

interface Order {
    id: string;
    status: string;
    total: string;
    createdAt: string;
    items: { id: string }[];
}

// Badge de color segun el estado
function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> ={
        PNEDING: "bg-yellow-100 text-yellow-700",
        CONFIRMED: "bg-blue-100 text-blue-700",
        SHIPPED:   "bg-purple-100 text-purple-700",
        DELIVERED: "bg-green-100 text-green-700",
        CANCELLED: "bg-red-100 text-red-700",
    };

    const labels: Record<string, string> = {
        PENDING:   "Pendiente",
        CONFIRMED: "Confirmado",
        SHIPPED:   "Enviado",
        DELIVERED: "Entregado",
        CANCELLED: "Cancelado",
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] ?? "bg-gray-100 text-gray-700"}`}>
            {labels[status] ?? status}
        </span>
    );
}

export default function OrdersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }

        const fetchOrders = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/orders`
                );
                setOrders(data.data ?? []);
            } catch (err) {
                setError("Error al cargar los pedidos");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [status, router]);

    if (status === "loading" || loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    {session?.user.role === "ADMIN" ? "Todos los pedidos" : "Mis pedidos"}
                </h1>

                {orders.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                        <p className="text-lg mb-4">No hay pedidos todavía</p>
                        <Link
                            href="/products"
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                Ir a productos
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <Link
                                key={order.id}
                                href={`/orders/${order.id}`}
                                className="block bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">
                                            Pedido #{order.id.slice(-8).toUpperCase()}
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            {new Date(order.createdAt).toLocaleDateString("es-ES", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {order.items.length} producto(s)
                                        </p>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-2">
                                        <StatusBadge status={order.status} />
                                        <p className="text-xl font-bold text-gray-900">
                                            ${parseFloat(order.total).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
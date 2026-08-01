"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";

interface CartItem {
    id: string;
    quantity: number;
    product: {
        id: string;
        name: string;
        price: string;
        imageUrl: string | null;
    };
}

export default function CheckoutPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [items, setItems] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(true);
    const [placing, setPlacing] = useState(false);

    // Redirigir si no hay sesión
    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") { router.push("/login"); return; }

        const fetchCart = async () => {
            try {
                const { data } = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/cart`
                );
                const cartItems = data.data?.items ?? [];
                if (cartItems.length === 0) {
                    toast.error("Tu carrito está vacío");
                    router.push("/products");
                    return;
                }
                setItems(cartItems);
            } catch {
                router.push("/cart");
            } finally {
                setLoading(false);
            }
        };
        fetchCart();
    }, [status, router]);

    const total = items.reduce((sum, item) =>
        sum + parseFloat(item.product.price) * item.quantity, 0
    );

    const handlePlaceOrder = async () => {
        setPlacing(true);
        try {
            const { data } = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/orders`
            );
            toast.success("¡Pedido confirmado");
            router.push(`/orders/${data.data.id}`);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.error ?? "Error al crear el pedido");
            }
        } finally {
            setPlacing(false);
        }
    };
    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-ts-cyan border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="max-w-3xl mx-auto px-6 py-12">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <Link href="/cart" className="text-xs font-mono text-ts-gray hover:text-ts-cyan transition-colors flex items-center gap-1 mb-4">
                        ← Volver al carrito
                    </Link>
                    <span className="text-xs font-mono text-ts-cyan">/ checkout</span>
                    <h1 className="text-4xl font-bold mt-2">Confirmar pedido</h1>
                </motion.div>

                {/* Items */}
                <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-strong rounded-2xl overflow-hidden mb-6">
                    <div className="p-5 border-b border-ts-border">
                        <h2 className="font-semibold">
                            Productos ({items.length})
                        </h2>
                    </div>
                    <div className="divide-y divide-ts-border">
                        {items.map((item) => (
                            <div key={item.id} className="p-4 flex items-center gap-4">
                                <div className="h-14 w-14 rounded-xl flex-shrink-0 overflow-hidden" style={{ backgroundColor: "#f8f9fa" }}>
                                    {item.product.imageUrl ? (
                                        <img
                                        src={item.product.imageUrl}
                                        alt={item.product.name}
                                        className="h-full w-full object-contain p-1.5" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-ts-gray"> 📦</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">{item.product.name}</p>
                                    <p className="text-xs text-ts-gray mt-0.5">
                                        {item.quantity} × ${parseFloat(item.product.price).toFixed(2)}
                                    </p>
                                </div>
                                <p className="font-mono font-bold text-sm">
                                    ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                                </p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-strong rounded-2xl p-6"
                >
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-lg font-semibold">Total a pagar</span>
                        <span className="text-3xl font-bold font-mono text-gradient">
                            ${total.toFixed(2)}
                        </span>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handlePlaceOrder}
                        disabled={placing}
                        className="w-full py-3.5 rounded-xl bg-ts-gradient text-black font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {placing && (
                            <span className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                            )}
                        {placing ? "Procesando..." : "Confirmar pedido"}
                    </motion.button>
                    <p className="text-center text-xs text-ts-gray mt-4 font-mono">
                        Al confirmar aceptas los términos de compra de Techstack
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
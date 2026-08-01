"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import { setuid } from "process";

interface CartItem {
    id: string;
    quantity: number;
    product: {
        id: string;
        name: string;
        price: string;
        imageUrl: string | null;
        stock: number;
    };
}

interface Cart {
    items: CartItem[];
}

export default function CartPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);

    
    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") { router.push("/login"); return; }

        const fetchCart = async () => {
        try {
            const { data } = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL}/cart`
            );
            setCart(data.data);
        } catch {
            toast.error("Error al cargar el carrito");
        } finally {
            setLoading(false);
        }
    };
    fetchCart();
    }, [status, router]);

    const handleUpdateQuantity = async (itemId: string, quantity: number) => {
        if (quantity < 1) return;
        setUpdating(itemId);
        try {
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/cart/${itemId}`,
                { quantity }
            );
            setCart((prev) =>
                prev ? {
                    ...prev,
                    items: prev.items.map((i) =>
                        i.id === itemId ? {...i, quantity } : i
                    ),
                } : prev
            );
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.error ?? "Error al actualizar");
            }
        } finally {
            setUpdating(null);
        }
    };

    const handleRemove = async (itemId: string) => {
        setUpdating(itemId);
        try {
            await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/cart/${itemId}`
            );
            setCart((prev) =>
                prev ? {
                    ...prev,
                    items: prev.items.filter((i) => i.id !== itemId),
                } : prev
            );
            toast.success("Producto eliminado");
        } catch {
            toast.error("Error al eliminar el producto");
        } finally {
            setUpdating(null);
        }
    };

    const total = cart?.items.reduce((sum, item) =>
        sum + parseFloat(item.product.price) * item.quantity, 0
    ) ?? 0;

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-ts-cyan border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="max-w-5xl mx-auto px-6 py-12">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <span className="text-xs font-mono text-ts-cyan">/ carrito</span>
                    <h1 className="text-4xl font-bold mt-2">Tu carrito</h1>
                    {cart && cart.items.length > 0 && (
                        <p className="text-ts-gray text-sm mt-1">
                            {cart.items.length} producto{cart.items.length !== 1 ? "s" : ""}
                        </p>
                    )}
                </motion.div>

                {/* Carrito vacío */}
                {(!cart || cart.items.length === 0) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-24"
                    >
                        <p className="text-6xl mb-4">🛒</p>
                        <p className="text-xl font-semibold mb-2">Tu carrito está vacío</p>
                        <p className="text-ts-gray text-sm mb-8">Agrega productos para comenzar</p>
                        <Link href="/products">
                            <motion.span
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-ts-gradient text-black font-semibold cursor-pointer"
                            > Explorar productos</motion.span>
                        </Link>
                    </motion.div>
                )}

                {cart && cart.items.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Lista de items */}
                        <div className="lg:col-span-2 space-y-3">
                            <AnimatePresence mode="popLayout">
                                {cart.items.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20, height: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="glass-card rounded-2xl p-4 flex items-center gap-4"
                                    >
                                        {/* Imagen */}
                                        <div className="h-20 w-20 rounded-xl flex-shrink-0 overflow-hidden" style={{ backgroundColor: "#f8f9fa" }}>
                                            {item.product.imageUrl ? (
                                                <img 
                                                    src={item.product.imageUrl}
                                                    alt={item.product.name}
                                                    className="h-full w-full object-contain p-2"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-ts-gray text-2xl"
                                                >
                                                    📦
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-sm truncate">
                                                {item.product.name}
                                            </p>
                                            <p className="font-mono font-bold text-ts-cyan mt-0.5">
                                                ${parseFloat(item.product.price).toFixed(2)}
                                            </p>
                                        </div>

                                        {/* Controles de cantidad */}
                                        <div className="flex items-center gap-2">
                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                disabled={updating === item.id || item.quantity <= 1}
                                                className="w-7 h-7 rounded-lg glass border border-ts-border flex items-center justify-center text-ts-gray hover:text-ts-white disabled:opacity-40 transition-colors text-lg leading-none"
                                            >
                                                -
                                            </motion.button>

                                            <span className="w-8 text-center text-sm font-mono font-bold">
                                                {updating === item.id ? (
                                                    <span className="inline-block h-3 w-3 rounded-full border border-ts-cyan border-t-transparent animate-spin" />
                                                ) : item.quantity}
                                            </span>

                                            <motion.button
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                disabled={updating === item.id || item.quantity >= item.product.stock}
                                                className="w-7 h-7 rounded-lg glass border border-ts-border flex items-center justify-center text-ts-gray hover:text-ts-white disabled:opacity-40 transition-colors text-lg leading-none"
                                            >
                                                +
                                            </motion.button>
                                        </div>

                                        {/* Subtotal */}
                                        <p className="font-mono font-bold text-sm w-20 text-right hidden sm:block">
                                            ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                                        </p>

                                        {/* Eliminar */}
                                        <motion.button
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleRemove(item.id)}
                                            disabled={updating === item.id}
                                            className="p-2 rounded-lg text-ts-gray hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6" />
                                                <path d="M19 6l-1 14a2 2 0 0 1-2 2h8a2 2 0 0 1-2-2L5 6" />
                                                <path d="M10 11v6M14 11v6" />
                                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                            </svg>
                                        </motion.button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Resumen de pedido */}
                        <div className="lg:col-span-1">
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="glass-strong rounded-2xl p-6 sticky top-24"
                            >
                                <h2 className="font-semibold text-lg mb-6">Resumen</h2>

                                <div className="space-y-3 mb-6">
                                    {cart.items.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span className="text-ts-gray truncate flex-1 mr-2">
                                                {item.product.name} × {item.quantity}
                                            </span>
                                            <span className="font-mono font-medium flex-shrink-0">
                                                ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-ts-border pt-4 mb-6">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">Total</span>
                                        <span className="text-2xl font-bold font-mono text-gradient">
                                            ${total.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => router.push("/checkout")}
                                    className="w-full py-3 rounded-xl bg-ts-gradient text-black font-semibold text-sm hover:opacity-90 transition-opacity"
                                >
                                    Proceder al pago →
                                </motion.button>

                                <Link href="/products" className="block text-center text-sm text-ts-gray hover:text-ts-white mt-4 transition-colors">
                                    Seguir comprando
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
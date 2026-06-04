"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";

interface CartItem {
    id: string;
    quantity: number;
    product: {
        id: string;
        name: string;
        price: string;
        imageUrl: string | null
    };
}

interface Cart {
    id: string;
    items: CartItem[];
}

const API = process.env.NEXT_PUBLIC_API_URL;

export default function CartPage() {
    const { status } = useSession();
    const router = useRouter();
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchCart = async () => {
        try {
            const { data } = await axios.get(`${API}/cart`);
            setCart(data.data);
        } catch {
            setError("No se pudo cargar el carrito");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === "authenticated") fetchCart();
        if (status === "unauthenticated") router.push("/login");
    }, [status]);

    const updateQty = async (itemId: string, quantity: number) => {
        try {
            const { data } = await axios.put(`${API}/cart/${itemId}`, { quantity });
            setCart(data.data);
        } catch (e: any) {
            alert(e.response?.data?.error || "Error al actualizar");
        }
    };

    const removeItem = async (itemId: string) => {
        try {
            const { data } = await axios.delete(`${API}/cart/${itemId}`);
            setCart(data.data);
        } catch {
            alert("Error al eliminar el item");
        }
    };

    const total =
    cart?.items.reduce(
        (sum, item) => sum + Number(item.product.price) * item.quantity,
        0
    ) ?? 0;

    if (loading || status === "loading") {
        return <div className="p-8 text-center">Cargando carrito...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">{error}</div>;
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Tu carrito</h1>

            {!cart || cart.items.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                    <p className="text-lg mb-4">Tu carrito está vacío</p>
                    <button
                        onClick={() => router.push("/products")}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
                        Ver productos
                    </button>
                </div>
            ) : (
                <>
                <ul className="space-y-4">
                    {cart.items.map((item) => (
                        <li
                            key={item.id}
                            className="flex items-center gap-4 border rounded-lg p-4">
                                {item.product.imageUrl && (
                                    <img
                                        src={item.product.imageUrl}
                                        alt={item.product.name}
                                        className="w-16 h-16 object-cover rounded"/>
                                )}
                                <div className="flex-1">
                                    <p className="font-medium">{item.product.name}</p>
                                    <p className="text-gray-500 text-sm">
                                        ${Number(item.product.price).toFixed(2)} c/u
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => updateQty(item.id, item.quantity - 1)}
                                        disabled={item.quantity <= 1}
                                        className="w-8 h-8 rounded border text-lg font-bold disabled:opacity-30 hover:bg-gray-100">
                                            -
                                    </button>
                                    <span className="w-6 text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQty(item.id, item.quantity + 1)}
                                        className="w-8 h-8 rounded border text-lg font-bold hover:bg-gray-100">
                                        +
                                    </button>
                                </div>
                                <p className="w-20 text-right font-semibold">
                                    ${(Number(item.product.price) * item.quantity).toFixed(2)}
                                </p>
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="text-red-500 hover:text-red-700 text-sm ml-2">
                                    Eliminar
                                </button>
                        </li>
                    ))}
                </ul>

                <div className="mt-6 border-t pt-5 flex justify-between items-center">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-xl font-bold text-blue-600">
                        ${total.toFixed(2)}
                    </span>
                </div>

                <button
                    onClick={() => router.push("/checkout")}
                    className="mt-4 w-full bg-blue-600 text-white py-3 rounded-l font-semibold hover:bg-blue-700">
                    Proceder al pago
                </button>
                </>
            )}
        </div>
    );
}
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

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

interface Cart {
    items: CartItem[];
}

export default function CheckoutPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [placing, setPlacing] = useState(false);

    // Redirigir si no hay sesión
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    // Cargar carrito
    useEffect(() => {
        if (status !== "authenticated") return;

        const fetchCart = async () => {
            try {
                const { data } = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/cart`
                );
                setCart(data.data);

                if (!data.data || data.data.items.length === 0) {
                    toast.error("Tu carrito está vacío");
                    router.push("/products");
                }
            } catch {
                toast.error("Error al cargar el carrito");
                router.push("/cart");
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, [status, router]);

    const total = cart?.items.reduce((sum, item) => {
        return sum + parseFloat(item.product.price) * item.quantity;
    }, 0) ?? 0;

    const handlePlaceOrder = async () => {
        setPlacing(true);
        try {
            const { data } = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/orders`
            );

            toast.success("¡Pedido creado correctamente!");
            router.push(`/orders/${data.data.id}`);

        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.error ?? "Error al crear el pedido");
            } else {
                toast.error("Error al crear el pedido");
            }
        } finally {
            setPlacing(false);
        }
    };

    if (loading || status === "loading") {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    Confirmar pedido
                </h1>

                {/* Resumen de items */}
                <div className="bg-white rounded-xl shadow-sm -sm overflow-hidden mb-6">
                    <div className="p-6 border-b">
                        <h2 className="font-semibold text-gray-900">
                            Resumen ({cart?.items.length} productos)
                        </h2>
                    </div>

                    <div className="divide-y">
                        {cart?.items.map((item) => (
                            <div key={item.id} className="p-4 flex items-center gap-4">
                                {/* Imagen */}
                                <div className="h-16 w-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                                    {item.product.imageUrl ? (
                                        <img src={item.product.imageUrl}
                                        alt={item.product.name}
                                        className="h-full w-full object-cover"/>
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                                            Sin imagen
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">
                                        {item.product.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Cantidad: {item.quantity}
                                    </p>
                                </div>

                                {/* Subtotal */}
                                <p className="font-semibold text-gray-900">
                                    ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Total y botón */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-xl font-semibold text-gray-900"> Total</span>
                        <span className="text-2xl font-bold text-blue-600">
                            ${total.toFixed(2)}
                        </span>
                    </div>

                    <button 
                        onClick={handlePlaceOrder}
                        disabled={placing}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-semibold text-lg">
                            {placing ? "Procesando pedido..." : "Confirmar pedido"}
                    </button>

                    <button
                        onClick={() => router.push("/cart")}
                        className="w-full mt-3 text-gray-500 hover:text-gray-700 transition-colors text-sm"
                    >
                        Volver al carrito
                    </button>
                </div>
            </div>
        </div>
    );
}
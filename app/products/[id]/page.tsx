"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";

interface Product {
    id: string;
    name: string;
    description: string | null;
    price: string;
    stock: number;
    imageUrl: string | null;
    category: { id: string; name: string; slug: string } | null;
    createdAt: string;
}

export default function ProductDetailPage({
    params,
} : {
    params: { id: string };
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/products/${params.id}`
                );
                setProduct(data.data);
            } catch {
                router.push("/products");
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [params.id, router]);

    const handleAddToCart = async () => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }
        setAdding(true);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
                productId: product!.id,
                quantity,
            });
            toast.success("Producto agregado al carrito");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.error ?? "Error al agregar");
            }
        } finally {
            setAdding(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-ts-cyan border-t-transparent" />
            </div>
        );
    }

    if (!product) return null;

    const isOutOfStock = product.stock === 0;
    const isLowStock = product.stock > 0 && product.stock <= 5;

    return (
        <div className="min-h-screen">
            <div className="max-w-6xl mx-auto px-6 py-12">

                {/* Breadcrumb */}
                <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-xs font-mono text-ts-gray mb-10"
                >
                    <Link href="/" className="hover:text-ts-cyan transition-colors">
                        Inicio
                    </Link>
                    <span></span>
                    <Link href="/products" className="hover:text-ts-cyan transition-colors" >
                        Productos
                    </Link>
                    <span></span>
                    <span className="text-ts-white truncate max-w-[200px]">
                        {product.name}
                    </span>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

                    {/* Imagen */}
                    <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    >
                        <div className="aspect-square rounded-3xl overflow-hidden glass-card"
                        style={{ backgroundColor: "#f8f9fa" }}
                        >
                            {product.imageUrl ? (
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="h-full w-full object-contain p-8"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-ts-gray text-8xl">
                                    📦
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Info */}
                    <motion.div
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex flex-col gap-6"
                    >
                        {/* Categoría */}
                        {product.category && (
                            <span className="inline-flex w-fit px-3 py-1 rounded-full text-xs font-mono glass border border-ts-border text-ts-cyan">
                                {product.category.name}
                            </span>
                        )}

                        {/* Nombre */}
                        <div>
                            <h1 className="text-4xl font-bold leading-tight">
                                {product.name}
                            </h1>
                        </div>

                        {/* Precio */}
                        <div  className="glass-strong rounded-2xl p-5">
                            <p className="text-xs font-mono text-ts-gray mb-1">Precio</p>
                            <p className="text-4xl font-bold font-mono text-gradient">${parseFloat(product.price).toFixed(2)}</p>
                        </div>

                        {/* Botón agregar al carrito */}
                        <div className="flex items-center gap-3">
                            {/* Selector cantidad */}
                            <div className="flex items-center glass rounded-xl border border-ts-border overflow-hidden">
                                <button
                                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                    disabled={isOutOfStock}
                                    className="px-4 py-3 text-gray-800 dark:text-ts-gray hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                                >-</button>
                                <span className="px-4 py-3 font-mono font-bold text-sm border-x border-gray-300 dark:border-ts-border min-w-[48px] text-center text-gray-900 dark:text-ts-white">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                                    disabled={isOutOfStock}
                                    className="px-4 py-3 text-gray-800 dark:text-ts-gray hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                                >+</button>
                            </div>

                            <motion.button
                                whileHover={{ scale: isOutOfStock ? 1 : 1.02 }}
                                whileTap={{ scale: isOutOfStock ? 1 : 0.97 }}
                                onClick={handleAddToCart}
                                disabled={adding || isOutOfStock}
                                className="flex-1 py-3 rounded-xl font-semibold text-sm bg-ts-gradient text-black hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {adding && (
                                    <span className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                                )}
                                {isOutOfStock ? "Sin stock" : adding ? "Agregando..." : "Agregar al carrito"}
                            </motion.button>
                        </div>

                        {/* Descripcion */}
                        {product.description && (
                            <div>
                                <p className="text-xs font-mono text-ts-gray mb-2">Descripción</p>
                                <p className="text-sm leading-relaxed text-ts-gray">
                                    {product.description}
                                </p>
                            </div>
                        )}

                        {/* Stock */}
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                                isOutOfStock ? "bg-red-400" :
                                isLowStock   ? "bg-yellow-400" :
                                            "bg-green-400"
                            }`} />
                            <span className={`text-sm font-mono ${
                                isOutOfStock ? "text-red-400" :
                                isLowStock   ? "text-yellow-400" :
                                            "text-ts-gray"
                            }`} >
                                {isOutOfStock
                                    ? "Sin stock"
                                    : isLowStock
                                    ? `¡Solo quedan ${product.stock} unidades!`
                                    : `${product.stock} unidades disponibles` }
                            </span>
                        </div>

                        {/* Cantidad */}
                        {isOutOfStock && (
                            <div className="flex items-center gap-3">
                                {/* Selector cantidad */}
                                <div className="flex items-center glass rounded-xl border border-ts-border overflow-hidden">
                                    <button
                                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                        disabled={isOutOfStock}
                                        className="px-4 py-3 text-ts-gray hover:text-ts-white hover:bg-white/5 transition-all text-lg disabled:opacity-40 disabled:cursor-not-allowed" >
                                            −
                                    </button>
                                    <span className="px-4 py-3 font-mono font-bold text-sm border-x border-ts-border min-w-[48px] text-center"
                                    >
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                                        disabled={isOutOfStock}
                                        className="px-4 py-3 text-ts-gray hover:text-ts-white hover:bg-white/5 transition-all text-lg disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        +
                                    </button>
                                </div>

                                {/* Boton agregar */}
                                <motion.button
                                    whileHover={{ scale: isOutOfStock ? 1 : 1.02 }}
                                    whileTap={{ scale: isOutOfStock ? 1 : 0.97 }}
                                    onClick={handleAddToCart}
                                    disabled={adding || isOutOfStock}
                                    className="flex-1 py-3 rounded-xl font-semibold text-sm transition-opacity flex items-center justify-center gap-2 disabled:cursor-not-allowed bg-ts-gradient text-black hover:opacity-90 disabled:opacity-50"
                                >
                                    {adding && (
                                        <span className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                                    )}
                                    {isOutOfStock
                                    ? "Sin stock"
                                    : adding
                                    ? "Agregando..."
                                    :"Agregar al carrito"}
                                </motion.button>
                            </div>
                        )}

                        {/* Specs */}
                        <div className="glass rounded-2xl p-5 space-y-3">
                            <p className="text-xs font-mono text-ts-gray mb-3">
                                Especificaciones
                            </p>
                            {[
                                { label: "SKU",        value: product.id.slice(-8).toUpperCase() },
                                { label: "Categoría",  value: product.category?.name ?? "—" },
                                { label: "Estado",     value: "Disponible" },
                                { label: "Agregado",   value: new Date(product.createdAt).toLocaleDateString("es-ES") },
                            ].map((spec) => (
                                <div key={spec.label}
                                className="flex justify-between items-center py-2border-b border-ts-border last:border-0">
                                    <span className="text-xs font-mono text-ts-gray">
                                        {spec.label}
                                    </span>
                                    <span className="text-xs font-mono font-medium">
                                        {spec.value}
                                    </span>
                                </div>
                            ))}
                        </div>

                    </motion.div>
                </div>
            </div>
        </div>
    );
}
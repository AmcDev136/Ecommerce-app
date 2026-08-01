"use client"; // Componente que corre en navegador

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";

// Tipo local para productos 
interface Product {
    id: string;
    name: string;
    description: string | null;
    price: string;
    stock: number;
    imageUrl: string | null;
    category: { id: string; name: string } | null;
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

function ProductCard({ product, onAddToCart }: {
    product: Product;
    onAddToCart: (id: string) => void;
}) {
    const [hovered, setHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            className="glass-card rounded-2xl overflow-hidden group"
        >
            {/* Imagen */}
            <Link href={`/products/${product.id}`}>
                <div className="relative h-52 overflow-hidden"
                style={{ backgroundColor: "#f8f9fa"}}>
                    {product.imageUrl ? (
                        <img 
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-contain p-4
                                        transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-ts-gray text-5xl">
                            📦
                        </div>
                    )}

                    {/* Badge categoria */}
                    {product.category && (
                        <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-mono glass border border-ts-border text-ts-cyan">
                            {product.category.name}
                        </span>
                    )}

                    {/* Badge agotado */}
                    {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="px-3 py-1 rounded-full text-xs font-mono bg-red-500/20 border border-red-500/40 text-red-400">
                                Agotado
                            </span>
                        </div>
                    )}

                    {/* Overlay hover */}
                    <AnimatePresence>
                        {hovered && product.description && product.stock > 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute inset-0 bg-black/70 flex items-center justify-center p-4"
                            >
                                <p className="text-xs text-gray-200 text-center line-clamp-4">
                                    {product.description}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </Link>

            {/* Infor */}
            <div className="p-4">
                <Link href={`/products/${product.id}`}>
                    <h3 className="font-semibold text-sm mb-1 truncate hover:text-ts-cyan transition-colors">
                        {product.name}
                    </h3>
                </Link>

                <div className="font-semibold text-sm mb-1 truncate hover:text-ts-cyan transition-colors">
                    <p className="font-mono font-bold text-lg text-gradient">
                        ${parseFloat(product.price).toFixed(2)}
                    </p>
                    <span className={`text-xs font-mono ${
                        product.stock === 0
                        ? "text-red-400"
                        : product.stock <= 5
                        ? "text-yellow-400"
                        : "text-ts-gray"
                    }`}>
                        {product.stock === 0
                        ? "Agotado"
                        : product.stock <= 5
                        ? `¡Solo ${product.stock}!`
                        : `${product.stock} uds.`}
                    </span>
                </div>

                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onAddToCart(product.id)}
                    disabled={product.stock === 0}
                    className="mt-3 w-full py-2 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-ts-gradient text-black hover:opacity-90"
                >
                    {product.stock === 0 ? "Sin stock" : "Agregar al carrito"}
                </motion.button>
            </div>
        </motion.div>
    );
}

// Skeleton loader
function ProductSkeleton() {
    return(
        <div className="glass-card rounded-2xl overflow-hidden animate-pulse">
            <div className="h-52 bg-ts-surface-2" />
            <div className="p-4 space-y-3">
                <div className="h-4 bg-ts-surface-2 rounded w-3/4" />
                <div className="h-6 bg-ts-surface-2 rounded w-1/2" />
                <div className="h-9 bg-ts-surface-2 rounded-xl" />
            </div>
        </div>
    );
}

export default function ProductsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [categoryId, setCategoryId] = useState("");

    // Cargar productos una sola vez
    useEffect(() => {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/categories`)
        .then(({ data }) => setCategories(data.data ?? []))
        .catch(() => {});
    }, []);

    //Cargar productos
    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "9",
                ...(search && { search }),
                ...(categoryId && { categoryId }),
            });

            const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/products?${params}`);
            setProducts(data.data.items);
            setTotalPages(data.data.totalPages);
            setTotal(data.data.total);
        } catch {
            toast.error("Error al cargar los productos");
        } finally {
            setLoading(false);
        }
    }, [page, search, categoryId]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // Reiniciar a la primera página al buscar
        setSearch(searchInput);
    };

    const handleAddToCart = async (productId: string) => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
                productId,
                quantity: 1,
            });
            toast.success("Producto agregado al carrito");
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.error ?? "Error al agregar al carrito");
            }
        }
    };

    return (
        <div className="min-h-screen">
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-10"
                >
                    <span className="text-xs font-mono text-ts-cyan">/ catálogo</span>
                    <h1 className="text-4xl font-bold mt-2">
                        Todos los productos
                    </h1>
                    {!loading && (
                        <p className="text-ts-gray text-sm mt-1">
                            {total} producto{total !==1 ? "s" : ""} disponibles
                        </p>
                    )}
                </motion.div>

                {/* Filtros */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="glass rounded-2xl p-4 mb-8 flex flex-col sm:flex-row gap-3"
                >
                    {/* Buscador */}
                    <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                        <div className="relative flex-1">
                            <svg
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-ts-gray"
                                xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            >
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Buscar productos..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full glass rounded-xl pl-9 pr-4 py-2 text-sm placeholder:text-ts-gray focus:outline-none focus:border-ts-cyan/40 transition-all"
                            />
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-ts-gradient text-black text-sm font-semibold"
                        >
                            Buscar
                        </motion.button>
                    </form>

                    {/* Filtro por categoría */}
                    {categories.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => { setCategoryId(""); setPage(1); }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                                categoryId === ""
                                    ? "bg-ts-gradient text-black font-semibold"
                                    : "glass border border-ts-border text-ts-gray hover:text-ts-white"
                                }`}
                            >
                                Todos
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => { setCategoryId(cat.id); setPage(1); }}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                                        categoryId === cat.id
                                        ? "bg-ts-gradient text-black font-semibold"
                                        : "glass border border-ts-border text-ts-gray hover:text-ts-white"
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Grid productos */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 9}).map((_, i) => (
                            <ProductSkeleton key={i} />
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-24"
                    >
                        <p className="text-4xl mb-4">🔍</p>
                        <p className="text-ts-gray">No se encontraron productos</p>
                        <button
                            onClick={() => { setSearch(""); setSearchInput(""); setCategoryId(""); setPage(1); }}
                            className="mt-4 text-ts-cyan text-sm hover:underline"
                        >
                            Limpiar filtros
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {products.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                >
                                    <ProductCard
                                    product={product}
                                    onAddToCart={handleAddToCart}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Paginacion */}
                {totalPages > 1 && !loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-center items-center gap-3 mt-12"
                    >
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 rounded-xl glass border border-ts-border text-sm disabled:opacity-40 hover:border-ts-cyan/30 transition-all"
                        >
                            ← Anterior
                        </motion.button>
                        <span className="text-sm text-ts-gray font-mono">
                            {page} / {totalPages}
                        </span>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 rounded-xl glass border border-ts-border text-sm disabled:opacity-40 hover:border-ts-cyan/30 transition-all"
                        >
                            Siguiente →
                        </motion.button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

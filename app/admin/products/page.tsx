"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";
import { ErrorHandlerSource } from "next/dist/server/app-render/create-error-handler";
import { ZodVoid } from "zod";
import { Rock_3D } from "next/font/google";

interface Product {
    id: string;
    name: string;
    price: string;
    stock: number;
    isActive: boolean;
    imageUrl: string | null;
    category: { id: string; name: string } | null;
}

interface ProductsResponse {
    success: boolean;
    data: {
        items: Product[];
        total: number;
        page: number;
        totalPages: number;
    };
}

export default function AdminProductsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "10",
                ...(search && { search }),
                ...(filterActive !== "all" && {
                    isActive: filterActive === "active" ? "true" : "false",
                }),
            });

            const { data } = await axios.get<ProductsResponse>(
                `${process.env.NEXT_PUBLIC_API_URL}/products?${params}`
            );
            setProducts(data.data.items);
            setTotalPages(data.data.totalPages);
            setTotal(data.data.total);
        } catch {
            toast.error("Error al cargar los productos");
        } finally {
            setLoading(false);
        }
    }, [page, search, filterActive]);

    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") { router.push("/login"); return; }
        if (session?.user.role !== "ADMIN") { router.push("/"); return; }
        fetchProducts();
    }, [status, session, router, fetchProducts]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        setSearch(searchInput);
    };

    const handleToggleActive = async (product: Product) => {
        try {
            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/products/${product.id}`,
                { isActive: !product.isActive }
            );
            toast.success(
                product.isActive ? "Producto desactivado" : "Producto activado"
            );
            fetchProducts();
        } catch {
            toast.error("Error al actualizar el producto");
        }
    };

    const handleDelete = async (product: Product) => {
        if (!confirm(`¿Desactivar "${product.name}"?`)) return;
        try {
            await axios.delete(
                `${process.env.NEXT_PUBLIC_API_URL}/products/${product.id}`
            );
            toast.success("Producto desactivado correctamente");
            fetchProducts();
        } catch {
            toast.error("Error al desactivaar el producto");
        }
    };

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
                        <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
                        <p className="text-gray-500 text-sm mt-1">{total} productos en total</p>
                    </div>
                    <Link
                        href="/admin/products/new"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                        + Nuevo producto
                    </Link>
                </div>

                {/* Filtros */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
                    <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                        >
                            Buscar
                        </button>
                    </form>

                    {/* Filtro por estado */}
                    <div className="flex gap-2">
                        {(["all", "active", "inactive"] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => { setFilterActive(f); setPage(1); }}
                                className={`px-3 py-2 rounded-lg text-sm transition-colors ${ filterActive === f
                                    ? "bg-blue-600 text-white"
                                    : "border border-gray-300 text-gray-600 hover:bg-gray-50"
                                }`}
                            >
                                {f === "all" ? "Todos" : f=== "active" ? "Activos" : "Inactivos" }
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tabla */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                                    Producto
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                                    Categoría
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                                    Precio
                                </th>
                                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                                    Stock
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
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-gray-400">
                                        No se encontraron productos
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                        {/* Imagen y nombre */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                                                    {product.imageUrl ? (
                                                        <img 
                                                            src={product.imageUrl}
                                                            alt={product.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-gray-300 text-xs">
                                                            📦
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium text-gray-900 max-w-[200px] truncate">
                                                    {product.name}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Categoría */}
                                        <td className="px-4 py-3">
                                            {product.category ? (
                                                <span className="text-sm text-gray-600">
                                                    {product.category.name}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-gray-300">-</span>
                                            )}
                                        </td>

                                        {/* Precio */}
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-medium text-gray-900">
                                                ${parseFloat(product.price).toFixed(2)}
                                            </span>
                                        </td>

                                        {/* Stock */}
                                        <td className="px-4 py-3">
                                            <span className={`text-sm font-medium ${
                                                product.stock === 0
                                                ? "text-red-500"
                                                : product.stock <= 5
                                                ? "text-yellow-500"
                                                : "text-gray-900"
                                            }`}>
                                                {product.stock}
                                            </span>
                                        </td>

                                        {/* Estado */}
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => handleToggleActive(product)}
                                                className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                                                product.isActive
                                                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                                }`}
                                            >
                                                {product.isActive ? "Activo" : "Inactivo"}
                                            </button>
                                        </td>

                                        {/* Acciones */}
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/admin/products/${product.id}/edit`}
                                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                    Editar
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product)}
                                                    className="text-sm text-red-500 hover:text-red-600 font-medium">
                                                        Desactivar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Paginación */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-3 p-4 border-t border-gray-100">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                            >
                                Anterior
                            </button>
                            <span className="text-sm text-gray-600">
                                {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1.5 border rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                            >
                                Siguiente
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
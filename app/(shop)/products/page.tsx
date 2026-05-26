"use client"; // Componente que corre en navegador

import { useEffect, useState } from "react";
import axios from "axios";

// Tipo local para productos 
interface Product {
    id: string;
    name: string;
    description: string | null;
    price: string;
    stock: number;
    imageUrl: string | null;
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

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");

    // Cargar productos desde la Api cada que cambia de página
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const params = new URLSearchParams({
                    page: page.toString(),
                    limit: "8",
                    ...(search && { search }),
                });

                const { data } = await axios.get<ProductsResponse>(
                    `${process.env.NEXT_PUBLIC_API_URL}/products?${params}`
                );

                setProducts(data.data.items);
                setTotalPages(data.data.totalPages);
            } catch (err) {
                setError("Error al cargar productos");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [page, search]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1); // Reiniciar a la primera página al buscar
        setSearch(searchInput);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7x1 mx-auto px-4 py-6">
                    <h1 className="text-3x1 font-bold text-gray-900">Productos</h1>

                    {/* Buscador*/}
                    <form onSubmit={handleSearch} className="mt-4 flex gap-2">
                        <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >Buscar
                        </button>
                    </form>
                </div>
            </div>

            <div className="max-w-7x1 mx-auto px-4 py-8">
                {/* Estado de cargar */}
                {loading && (
                    <div className= "flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                    </div>
                )}

                {/* Error */}
                {error && !loading && (
                    <div className="text-center text-gray-500 py-12">
                        No se encontraron productos
                    </div>
                )}

                {/* Grid productos */}
                {!loading && !error && products.length > 0 && (
                    <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div
                            key={product.id}
                            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                {/* Imagen */}
                                <div className="h-48 bg-gray-100 flex items-center justify-center">
                                    {product.imageUrl ? (
                                        <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="h-full w-full object-cover"/>
                                    ) : (
                                        <span className="text-gray-400 text-sm">Sin imagen</span>
                                    )}
                                </div>

                                {/* Info del producto */}
                                <div className="p-4">
                                    <h2 className="font-semibold text-gray-900 truncate">
                                        {product.name}
                                    </h2>
                                    {product.description && (
                                        <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                                            {product.description}
                                        </p>
                                    )}
                                    <div className="mt-3 flex items-center justify-between">
                                        <span className="text-blue-600 font-bold text-lg">
                                            ${parseFloat(product.price).toFixed(2)}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            Stock: {product.stock}
                                        </span>
                                    </div>
                                    <button className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                        Agregar al carrito
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Paginacion */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-3 mt-8">
                            <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors"
                            >
                                Anterior
                            </button>
                            <span className="text-gray-600">
                                Página {page} de {totalPages}
                            </span>
                            <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100 transition-colors"
                            >
                                Siguiente
                            </button>
                        </div>
                    )}
                    </>
                )}
            </div>
        </div>
    );
}

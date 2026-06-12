"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface ProductFormData {
    name: string;
    description: string;
    price: string;
    stock: string;
    imageUrl: string;
    categoryId: string;
    isActive: boolean;
}

interface ProductFormProps {
  // Si se pasa initialData, es modo edición. Si no, es modo creación.
    initialData?: Partial<ProductFormData> & { id?: string };
    mode: "create" | "edit";
}

const EMPTY_FORM: ProductFormData = {
    name: "",
    description: "",
    price: "",
    stock: "0",
    imageUrl: "",
    categoryId: "",
    isActive: true,
};

export default function ProductFrom({ initialData, mode }: ProductFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState<ProductFormData> ({
        ...EMPTY_FORM,
        ...initialData,
    });
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null> (
        initialData?.imageUrl ?? null
    );

    // Cargar categorías
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/categories`
                );
                setCategories(data.data);
            } catch {
                toast.error("Error al cargar las categorías");
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value, type } = e.target;
        const newValue =
            type === "checkbox"
            ? (e.target as HTMLInputElement).checked
            : value;

        setFormData((prev) => ({ ...prev, [name]: newValue }));

        // Previe de imagen
        if (name === "imageUrl" && value) {
            setImagePreview(value);
        } else if (name === "imageUrl" && value) {
            setImagePreview(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                name: formData.name,
                description: formData.description || undefined,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                imageUrl: formData.imageUrl || undefined,
                categoryId: formData.categoryId || undefined,
                isActive: formData.isActive,
            };

            if (mode === "create") {
                await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/products`,
                    payload
                );
                toast.success("Producto creado correctamente");
            } else {
                await axios.put(
                    `${process.env.NEXT_PUBLIC_API_URL}/products/${initialData?.id}`,
                    payload
                );
                toast.success("Producto actualizado correctamente");
            }

            router.push("/admin/products");
            router.refresh();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.error ?? "Error al guardar el producto");
            } else {
                toast.error("Error al guardar el producto");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols- lg:grid-cols-3 gap-6">

                {/* Columna principal */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Informacion básica */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="font-semibold text-gray-900 mb-4">
                            Información básica
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre <span className="text-red-500">*</span>
                                </label>
                                <input type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nombre del producto"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descripción
                                </label>
                                <textarea 
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    placeholder="Descripcion del producto (opcional)"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Precio (MXN) <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="number"
                                        name="price"
                                        required
                                        min="0.01"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Stock <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="number"
                                        name="stock"
                                        required
                                        min="0"
                                        step="1"
                                        value={formData.stock}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Imagen */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="font-semibold text-gray-900 mb-1">
                            Imagen principal
                        </h2>
                        <p className="text-xs text-gray-400 mn-4">
                            Ingresa una URL de imagen. Soporte para múltiples imágenes próximamente.
                        </p>
                        <input 
                            type="url"
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://ejemplo.com/imagen.jpg"
                        />
                        {/* Preview */}
                        {imagePreview && (
                            <div className="mt-4 relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                                <img 
                                    src={imagePreview}
                                    alt="Preview" 
                                    className="h-full w-full object-contain"
                                    onError={() => setImagePreview(null)}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Columna lateral */}
                <div className="space-y-6">

                    {/* Estado y categoría */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="font-semibold text-gray-900 mb-4">
                            Organización
                        </h2>
                        <div className="space-y-4">

                            {/* Estado */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Estado</p>
                                    <p className="text-xs text-gray-400">
                                        {formData.isActive ? "Visible en la tienda" : "Oculto en la tienda"}
                                    </p>
                                </div>
                                <button type="button"
                                    onClick={() =>
                                        setFormData((prev) => ({ ...prev, isActive: !prev.isActive}))
                                    }
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isActive ? "bg-blue-600" : "bg-gray-300"}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isActive ? "translate-x-6" : "translate-x-1"}`}
                                    />
                                </button>
                            </div>

                            {/* Categoría */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Categoría
                                </label>
                                <select 
                                    name="categoryId"
                                    value={formData.categoryId}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="">Sin categoría</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                {categories.length === 0 && (
                                    <p className="text-xs text-gray-400 mt-1">
                                        No hay categorías.{" "}
                                        <a  href="/admin/categories"
                                            className="text-blue-600 hover:underline">
                                                Crear una
                                        </a>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium text-sm"
                        >
                            {loading
                                ? "Guardando..."
                                : mode === "create"
                                ? "Crear producto"
                                : "Guardar cambios"}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push("/admin/products")}
                            className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}
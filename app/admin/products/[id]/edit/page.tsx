"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import ProductForm from "@/app/components/admin/ProductForm";

interface Product {
    id: string;
    name: string;
    description: string | null;
    price: string;
    stock: number;
    imageUrl: string | null;
    isActive: boolean;
    categoryId: string | null;
}

export default function EditProductPage({
    params,
}: {
    params: { id: string };
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") { router.push("/login"); return; }
        if (session?.user.role !== "ADMIN") { router.push("/"); return; }

        const fetchProduct = async () => {
            try {
                const { data } = await axios.get(
                    `${process.env.NEXT_PUBLIC_API_URL}/products/${params.id}`
                );
                setProduct(data.data);
            } catch {
                router.push("/admin/products");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [status, session, router, params.id]);

    if (status === "loading" || loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="mb-6">
                    <Link
                        href="/admin/products"
                        className="text-sm text-blue-600 hover:underline block mb-1"
                    >
                        ← Productos
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Editar producto
                    </h1>
                </div>
                <ProductForm 
                    mode="edit"
                    initialData={{
                        id: product.id,
                        name: product.name,
                        description: product.description ?? "",
                        price: parseFloat(product.price).toString(),
                        stock: product.stock.toString(),
                        imageUrl: product.imageUrl ?? "",
                        categoryId: product.categoryId ?? "",
                        isActive: product.isActive,
                    }}
                />
            </div>
        </div>
    );
}
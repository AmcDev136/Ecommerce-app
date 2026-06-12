"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProductForm from "@/app/components/admin/ProductForm";

export default function NewProductPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") { router.push("/login"); return; }
        if (session?.user.role !== "ADMIN") router.push("/");
    }, [status, session, router]);

    if (status === "loading") {
        return(
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
        );
    }

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
                    <h1 className="text-3xl font-bold text-gray-900">Nuevo producto</h1>
                </div>
                <ProductForm mode="create" />
            </div>
        </div>
    );
}
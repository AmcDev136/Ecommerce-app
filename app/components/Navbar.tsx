"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Navbar() {
    const { data: session, status } = useSession();
    const loading = status === "loading";
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        if (session) {
            axios
                .get(`${process.env.NEXT_PUBLIC_API_URL}/cart`)
                .then(({ data }) => {
                    const count = data.data?.items?.reduce(
                        (sum: number, item: any) => sum + item.quantity,
                        0
                    ) ?? 0;
                    setCartCount(count);
                })
                .catch(() => {});
        }
    }, [session]);

    return (
        <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="text-x1 font-bold text-blue-600">
                E-commerce
                </Link>

                {/* Links centrales */}
                <div className="flex items-center gap-6">
                    <Link
                    href="/products"
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                        Productos
                    </Link>
                    <Link
                    href="/cart"
                    className="relative hover:text-blue-600"
                    >
                        Carrito
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-3 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                </div>

                {/* Auth */}
                <div className="flex items-center gap-3">
                    {loading && (
                        <div className="h-8 w-24 bg-gray-100 animate-pulse rounded-lg"/>
                    )}

                    {!loading && !session && (
                        <>
                            <Link
                            href="/login"
                            className="text-gray-600 hover:text-blue-600 transition-colors"
                            >
                                Iniciar sesión
                            </Link>
                            <Link
                            href="/register"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                                Registrarse
                            </Link>
                        </>
                    )}

                    {!loading && session && (
                        <div className="flex items-center gap-3">
                            {/* Nombre de usuario */}
                            <span className="text-gray-600 text-sm">
                                Hola, {session?.user.name ?? session?.user.email}
                            </span>

                            {/* Badge de admin */}
                            {session?.user.role === "ADMIN" && (
                                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium">
                                    Admin
                                </span>
                            )}

                            {/* Dashboard del admin */}
                            {session.user.role === "ADMIN" && (
                                <Link
                                href="/admin"
                                className="text-purple-600 hover:text-purple-700 transition-colors text-sm font-medium">
                                    Dashboard
                                </Link>
                            )}

                            {/* Pedidos */}
                            <Link
                            href="/orders"
                            className="text-gray-600 hover:text-blue-600 transition-colors text-sm"
                            >
                                Mis pedidos
                            </Link>

                            {/* Cerrar sesion */}
                            <button
                                onClick={() => signOut({ callbackUrl: "/"})}
                                className="text-red-500 hover:text-red-700 transition-colors text-sm"
                                >
                                    Salir
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
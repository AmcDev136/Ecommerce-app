"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const registered = searchParams.get("registered");

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                setError("Email o contraseña incorrectas");
                return;
            }
            router.push("/products");
            router.refresh();
        } catch (err) {
            setError("Error al iniciar sesión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-8 w-full max-w-md">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Iniciar sesión
            </h1>

            {/* Mensaje de registro exitoso */}
            {registered && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">
                    ¡Cuenta creada correctamente! Ya puedes iniciar sesión.
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="tu@email.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña
                    </label>
                    <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
                >
                    {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                </button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-600">
                ¿No tienes cuenta?{" "}
                <Link href="/register" className="text-blue-600 hover:underline">
                    Regístrate
                </Link>
            </p>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <Suspense fallback={<div>Cargando...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Paso 1: Registrar usuario en la API
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
            formData
            );

            // Paso 2: Login automático después del registro
            router.push("/login?registered=true");
            
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.error ?? "Error al registrarse");
            } else {
                setError("Error al registrarse");
            }
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-xl shadow-sm p-8 w-full max-w-md">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    Crear cuenta
                </h1>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre
                        </label>
                        <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tu nombre"
                        />
                    </div>

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
                        placeholder="Mínimo 8 caracteres, 1 mayúscula, 1 minúscula y un caracter especial (@$!%*?&)"
                        />
                    </div>
                    <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
                    >
                        {loading ? "Creando cuenta..." : "Crear cuenta"}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    ¿Ya tienes cuenta?{" "}
                    <Link href="/login" className="text-blue-600 hover:underline">
                        Inicia sesión
                    </Link>
                </p>
            </div>
        </div>
    );
}

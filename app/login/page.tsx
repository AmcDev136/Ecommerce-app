"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

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
        } catch {
            setError("Error al iniciar sesión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-ts-cyan/10 blur-[100px] -z-10" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-ts-purple/10 blur-[100px] -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Card */}
                <div className="glass-strong rounded-3xl p-8">

                    {/* Logo y titulo */}
                    <div className="flex flex-col items-center mb-8">
                        <Image 
                        src="/Logo-v2.png"
                        alt="Techstack"
                        width={56}
                        height={56}
                        className="rounded-2xl mb-4"
                        />
                        <h1 className="text-2xl font-bold">Bienvenido de vuelta</h1>
                        <p className="text-ts-gray text-sm mt-1">
                            Inicia sesión en tu cuenta
                        </p>
                    </div>

                    {/* Mensaje registro exitoso */}
                    {registered && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mb-4 px-4 py-3 rounded-xl bg-ts-cyan/10 border border-ts-cyan/20 text-ts-cyan text-sm text-center"
                        >
                            ¡Cuenta creada! Ya pedes iniciar sesión.
                        </motion.div>
                    )}

                    {/* Error */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Formulario */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-ts-gray mb-1.5">
                                Email
                            </label>
                            <input type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="tu@email.com"
                            className="w-full glass rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-ts-white placeholder:text-ts-gray focus:outline-none focus:border-ts-cyan/40 transition-all"
                            />
                        </div>


                        <div>
                            <label className="block text-sm font-medium text-ts-gray mb-1.5">
                                Contraseña
                            </label>
                            <input type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                            className="w-full glass rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-ts-white placeholder:text-ts-gray focus:outline-none focus:border-ts-cyan/40 transition-all"
                            />
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 rounded-xl font-semibold text-sm bg-ts-gradient text-black hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                        >
                            {loading && (
                                <span className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                            )}
                            {loading ? "Iniciado sesión..." : "Iniciar sesión"}
                        </motion.button>
                    </form>

                    {/* Footer */}
                    <p className="mt-6 text-center text-sm text-ts-gray">
                        ¿No tienes cuenta?{" "}
                        <Link href="/register" className="text-ts-cyan hover:underline font-medium">
                        Regístrate gratis
                        </Link>
                    </p>
                </div>

                {/* Eslogan */}
                <p className="text-center text-xs text-ts-gray font-mono mt-6">
                    Puro rendimiento. Cero fricción.
                </p>
            </motion.div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-ts-cyan border-t-transparent" />
            </div>}>
            <LoginForm />
        </Suspense>
    );
}

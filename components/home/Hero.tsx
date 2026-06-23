"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface FeaturedProduct {
    id: string;
    name: string;
    price: string;
    imageUrl: string | null;
}

export default function Hero({ product }: { product: FeaturedProduct | null }) {
    return (
        <section className="relative min-h-[85vh] flex items-center overflow-hidden">

            {/* Fondo */}
            <div className="absolute inset-0 -z-10 bg-ts-radial opacity-60" />

            <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 right-[10%] w-72 h-72 rounded-full bg-ts-cyan/10 blur-[100px] -z-10"
            />
            <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-1/4 left-[5%] w-72 h-72 rounded-full bg-ts-purple/10 blur-[100px] -z-10"
            />


            <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Columna texto */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >

                    <span className="inline-block px-3 py-1 rounded-full text-xs font-mono glass border border-ts-border text-ts-cyan mb-6">
                        Nueva colección disponible
                    </span>

                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6">
                        Puro rendimiento.
                        <br />
                        <span className="text-gradient">Cero fricción</span>
                    </h1>
                    <p className="text-lg text-ts-gray max-w-md mb-8">
                        Equipos de alto rendimiento diseñados para quienes no aceptan compromisos. Tecnología premium, entrega inmediata.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <Link href="/products">
                            <motion.span
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-ts-gradient text-black font-semibold glow-cyan cursor-pointer"
                            >
                                Explorar catálogo
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                    <polyline points="12 5 19 12 12 19" />
                                </svg>
                            </motion.span>
                        </Link>
                    </div>

                    {/* Indicador */}
                    <motion.div
                        animate={{ y: [0, 6, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="hidden lg:flex items-center gap-2 mt-16 text-xs text-ts-gray font-mono"
                    >
                        <span>Descubre más</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <polyline points="19 12 12 19 5 12" />
                        </svg>
                    </motion.div>
                </motion.div>

                {/* Producto destacado */}
                {product && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                        className="relative max-w-lg mx-auto lg:mx-0 w-full"
                        style={{ perspective: 1000 }}
                    >
                        <Link href={`/products/${product.id}`}>
                            <motion.div
                                whileHover={{ y: -8 }}
                                transition={{ duration: 0.3 }}
                                className="relative glass-strong rounded-3xl p-7 glow-cyan-strong cursor-pointer"
                            >
                                {/* Badge flotante */}
                                <span className="absolute -top-3 left-7 px-3 py-1 rounded-full text-xs font-mono bg-ts-gradient text-black font-semibold">
                                    Destacado
                                </span>

                                <div className="aspect-square rounded-2xl overflow-hidden bg-ts-surface-2 mb-4">
                                    {product.imageUrl ? (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-ts-gray text-4xl">
                                            📦
                                        </div>
                                    )}
                                </div>

                                <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                                <p className="text-2xl font-bold font-mono text-gradient">
                                    ${parseFloat(product.price).toFixed(2)}
                                </p>
                            </motion.div>
                        </Link>
                    </motion.div>
                )}
            </div>
        </section>
    );
}
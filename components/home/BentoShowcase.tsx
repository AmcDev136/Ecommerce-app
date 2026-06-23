"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface Product {
    id: string;
    name: string;
    description: string | null;
    price: string;
    imageUrl: string | null;
    stock: number;
}

interface BentoShowcaseProps {
    products: Product[];
}

// Define tamaño de cada celda
function getCellClass(index: number): string {
    // Patrón grnd, peq, peq, horizont, peq, grnd
    const patterns = [
        "lg:col-span-2 lg:row-span-2",
        "lg:col-span-1 lg:row-span-1",
        "lg:col-span-1 lg:row-span-1",
        "lg:col-span-2 lg:row-span-1",
        "lg:col-span-1 lg:row-span-1",
        "lg:col-span-1 lg:row-span-1",
    ];
    return patterns[index % patterns.length];
}

export default function BentoShowcase({ products}: BentoShowcaseProps) {
    if (products.length === 0) return null;

    return (
        <section className="max-w-7xl mx-auto px-6 py-24">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="mb-10"
            >
                <span className="text-xs font-mono text-ts-cyan">/ catálogo</span>
                <h2 className="text-3xl sm:text-4xl font-bold mt-2">
                    Lo más reciente
                </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[200px] gap-4">
                {products.slice(0, 6).map((product, index) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.08 }}
                        className={getCellClass(index)}
                    >
                        <Link
                            href={`/products/${product.id}`}
                            className="block h-full"
                        >
                            <motion.div
                                whileHover="hover"
                                className="relative h-full glass-card rounded-2xl overflow-hidden group cursor-pointer"
                            >
                                {/* Imagen de fondo */}
                                <div className="absolute inset-0">
                                    {product.imageUrl ? (
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105 p-4"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-ts-surface-2 flex items-center justify-center text-ts-gray text-5xl">
                                            📦
                                        </div>
                                    )}
                                    {/* Overlay para legibilidad */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                </div>

                                {/* Contenido */}
                                <div className="relative h-full flex flex-col justify-end p-4">
                                    <h3 className="font-semibold text-white text-sm sm:text-base truncate">
                                        {product.name}
                                    </h3>

                                    {/* Specs progresivos */}
                                    <motion.div
                                        variants={{
                                            hover: { opacity:1, height:"auto", marginTop: 8 },
                                        }}
                                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className="overflow-hidden"
                                    >
                                        {product.description && (
                                            <p className="text-xs text-gray-300 line-clamp-2 mb-2">
                                                {product.description}
                                            </p>
                                        )}
                                        <span className="text-[10px] font-mono text-ts-cyan">
                                            {product.stock > 0 ? `${product.stock} disponibles` : "Agotado"}
                                        </span>
                                    </motion.div>

                                    <p className="font-mono font-bold text-white mt-1">
                                        ${parseFloat(product.price).toFixed(2)}
                                    </p>
                                </div>
                            </motion.div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* CTA */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mt-10 text-center"
            >
                <Link
                    href="/products"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass border border-ts-border text-sm font-medium hover:border-ts-cyan/30 transition-all duration-200"
                >
                    Ver catálogo completo
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                    </svg>
                </Link>
            </motion.div>
        </section>
    );
}
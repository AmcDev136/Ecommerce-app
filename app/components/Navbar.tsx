"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import ThemeToggle from "./ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);

    // Detectar scroll
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
    }, []);

    // Cargar contador carrito
    useEffect(() => {
        if(status !== "authenticated") { setCartCount(0); return; }
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/cart`)
            .then(({ data }) => {
                const items = data?.data?.items ?? [];
                const total = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
                setCartCount(total);
            })
            .catch(() => setCartCount(0));
    }, [status]);

    const loading = status === "loading";

    return (
        <>
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{ left: "10%", transform: "translateX(-50%" }}
                className={`fixed top-4 z-50 w-[95%] max-w-6xl rounded-2xl px-4 py-3 flex items-center justify-between gap-4 transition-all duration-300
                    ${scrolled
                    ? "glass-strong shadow-lg shadow-black/20"
                    : "glass"
                    }
                `}
            >
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                    <Image 
                        src="/Logo-v2.png"
                        alt="Techstack"
                        width={32}
                        height={32}
                        className="rounded-lg"
                    />
                    <span className="font-bold text-sm hidden sm:block text-gradient">
                        Techstack
                    </span>
                </Link>

                {/* Links centrales */}
                <nav className="hidden md:flex items-center gap-1">
                    {[
                        { href: "/products", label: "Productos" },
                        { href: "/cart", label: "Carrito" },
                        ...(session?.user.role === "ADMIN"
                            ? [{ href: "/admin", label: "Dashboard" }]
                            : []
                        ),
                    ].map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="px-3 py-1.5 rounded-lg text-sm text-gray-200 hover:text-white hover:bg-white/5 transition-all duration-200"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Derecha: carrito + auth + theme */}
                <div className="flex items-center gap-2">
                    {/* Contador de carrito */}
                    {status === "authenticated" && (
                        <Link
                            href="/cart"
                            className="relative p-2 rounded-xl glass border border-ts-border text-gray-200 hover:text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="21" r="1" />
                                <circle cx="20" cy="21" r="1" />
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                            </svg>
                            <AnimatePresence>
                                {cartCount > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-ts-gradient text-black text-[10px] font-bold flex items-center justify-center"
                                    >
                                        {cartCount > 9 ? "9+" : cartCount}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </Link>
                    )}

                    {/* ThemeToggle */}
                    <ThemeToggle />

                    {/* Auth */}
                    {!loading && !session && (
                        <div className="hidden sm:flex items-center gap-2">
                            <Link
                                href="/login"
                                className="px-3 py-1.5 text-sm text-gray-200 hover:text-white transition-colors"
                            >
                                Iniciar sesión
                            </Link>
                            <Link
                                href="/register"
                                className="px-3 py-1.5 text-sm rounded-xl bg-ts-gradient text-black font-semibold hover:opacity-90 transition-opacity"
                            >
                                Registrarse
                            </Link>
                        </div>
                    )}

                    {!loading && session && (
                        <div className="hidden sm:flex items-center gap-2">
                            {/* Badge admin */}
                            {session.user.role === "ADMIN" && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-ts-cyan/10 text-xs-cyan border border-ts-cyan/20">
                                    Admin
                                </span>
                            )}
                            {/* Nombre */}
                            <span className="text-sm text-gray-200 hidden lg:block">
                                {session.user.name ?? session.user.email}
                            </span>
                            {/* Cerrar sesión */}
                            <button
                                onClick={() => signOut({ callbackUrl: "/"})}

                                className="px-3 py-1.5 text-sm rounded-xl glass border border-ts-border text-gray-200 hover:text-red-400 hover:border-red-500/30 transition-all duration-200"
                            >
                                Salir
                            </button>
                        </div>
                    )}

                    {/* Menú móvil */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden p-2 rounded-xl glass border border-ts-border text-gray-200 hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        >
                            {menuOpen
                            ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                            : <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>
                            }
                        </svg>
                    </button>
                </div>
            </motion.header>

            {/* Menú móvil desplegable */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y:0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2}}
                        className="fixed top-20 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-6xl glass-strong rounded-2xl p-4 flex flex-col gap-2"
                    >
                        <Link
                            href="/products"
                            onClick={() => setMenuOpen(false)}
                            className="px-3 py-2 rounded-lg text-sm text-gray-200 hover:text-white hover:bg-white/5 transition-all"
                        >
                            Productos
                        </Link>
                        <Link
                            href="/cart"
                            onClick={() => setMenuOpen(false)}
                            className="px-3 py-2 rounded-lg text-sm text-gray-200 hover:text-white hover:bg-white/5 transition-all"
                        >
                            Carrito
                        </Link>
                        {session?.user.role === "ADMIN" && (
                            <Link
                                href="/admin"
                                onClick={() => setMenuOpen(false)}
                                className="px-3 py-2 rounded-lg text-sm text-gray-200 hover:text-white hover:bg-white/5 transition-all"
                            >
                                Dashboard
                            </Link>
                        )}
                        {!session ? (
                            <>
                                <Link
                                    href="/login"
                                    onClick={() => setMenuOpen(false)}
                                    className="px-3 py-2 rounded-lg text-sm text-gray-200 hover:text-white hover:bg-white/5 transition-all"
                                >
                                    Iniciar sesión
                                </Link>
                                <Link
                                    href="/register"
                                    onClick={() => setMenuOpen(false)}
                                    className="px-3 py-2 rounded-xl text-sm bg-ts-gradient text-black font-semibold text-center"
                                >
                                    Registrarse
                                </Link>
                            </>
                        ) : (
                            <button
                                onClick={() => { signOut({ callbackUrl: "/" }); setMenuOpen(false); }}
                                className="px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all text-left"
                            >
                                Cerrar sesión
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="h-20" />
        </>
    );
}
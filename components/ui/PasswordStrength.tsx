"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Rule {
    label: string;
    test: (password: string) => boolean;
}

const RULES: Rule[] = [
    { label: "8 caracteres",  test: (p) => p.length >= 8 },
    { label: "1 mayúscula",   test: (p) => /[A-Z]/.test(p) },
    { label: "1 número",      test: (p) => /[0-9]/.test(p) },
];

interface PasswordStrengthProps {
    password: string;
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
    // No mostrar si el usuario no ha escrito
    if (!password) return null;

    return(
        <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 mt-2 flex-wrap"
        >
            {RULES.map((rule) => {
                const passes = rule.test(password);
                return (
                    <motion.div
                    key={rule.label}
                    className="flex items-center gap-1.5"
                    >
                        {/* Circulo indicador */}
                        <motion.div
                            animate={{
                                backgroundColor: passes
                                    ? "rgb(0, 180, 216)"
                                    : "rgba(107, 114, 128, 0.2)",
                                    scale: passes ? [1, 1.3, 1] : 1,
                            }}
                            transition={{ duration: 0.25 }}
                            className="w-4 h-4 rounded-full flex items-center justify-center border flex-shrink-0"
                            style={{
                                borderColor: passes
                                ? "rgba(0, 180, 216, 0.6)"
                                : "rgba(107, 114, 128, 0.3)",
                            }}
                        >
                            <AnimatePresence>
                                {passes && (
                                    <motion.svg
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0 }}
                                        transition={{ duration: 0.15 }}
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="8" height="8"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="black"
                                        strokeWidth="3.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="20 6 9 17 4 12" />
                                    </motion.svg>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Label */}
                        <motion.span
                            animate={{
                                color: passes ? "#00B4D8" : "#B5563",
                            }}
                            transition={{ duration: 0.2 }}
                            className="text-xs font-mono dark:text-ts-gray"
                        >
                            {rule.label}
                        </motion.span>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}

// Helper para saber si la contraseña cumple todos los requisitos
export function isPasswordValid(password: string): boolean {
    return RULES.every((rule) => rule.test(password));
}
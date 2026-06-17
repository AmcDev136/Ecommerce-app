"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { span } from "framer-motion/client";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size    = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    loading?: boolean;
    children: React.ReactNode;
}

const variants: Record<Variant, string> = {
    primary:   "bg-ts-gradient text-black font-semibold hover:opacity-90 glow-cyan",
    secondary: "glass border-ts-border text-ts-white hover:border-ts-cyan/30",
    ghost:     "text-ts-gray hover:text-ts-white hover:bg-white/5",
    danger:    "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20",
};

const sizes: Record<Size, string> = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-4 py-2 text-sm rounded-xl",
    lg: "px-6 py-3 text-base rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = "primary", size = "md", loading, children, className = "", disabled, ...props }, ref) => {
        return (
            <motion.button
                ref = {ref}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.15 }}
                disabled={disabled || loading}
                className={`
                    inline-flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed
                    ${variants[variant]}
                    ${sizes[size]}
                    ${className}
                `}
                {...(props as any)}
            >
                {loading && (
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                )}
                {children}
            </motion.button>
        );
    }
);

Button.displayName = "Button";
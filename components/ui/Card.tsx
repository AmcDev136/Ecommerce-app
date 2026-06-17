"use client";

import { motion } from "framer-motion";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    onClick?: () => void;
}

export function Card({ children, className = "", hover = false, onClick }: CardProps) {
    return (
        <motion.div
            onClick={onClick}
            whileHover={hover ? { y: -2, borderColor: "rgba(0,242,254,0.2)" }: undefined}
            transition={{ duration: 0.2 }}
            className={`glass-card rounded-2xl ${onClick ? "cursor-pointer" : ""} ${className}`}
        >
            {children}
        </motion.div>
    );
}
import { span } from "framer-motion/client";

type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "cyan";

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    className?: string;
}

const variants: Record<BadgeVariant, string> = {
    default: "bg-white/5 text-ts-gray border-white/10",
    success: "bg-green-500/10 text-green-400 border-green-500/20",
    warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    error:   "bg-red-500/10 text-red-400 border-red-500/20",
    info:    "bg-blue-500/10 text-blue-400 border-blue-500/20",
    cyan:    "bg-ts-cyan/10 text-ts-cyan border-ts-cyan/20",
};

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
    return (
        <span className={`
            inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border
            ${variants[variant]} ${className}
        `}>
            {children}
        </span>
    );
}
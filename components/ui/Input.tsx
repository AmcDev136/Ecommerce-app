"use client";

import { div, p } from "framer-motion/client";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, className = "", ...props }, ref) => {
        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <label className="text-sm font-medium text-ts-gray">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ts-gray">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`
                            w-fll glass rounded-xl px-4 py-2.5 text-sm text-ts-white placeholder:text-ts-gray focus:outline-none focus:border-ts-cyan/40 transition-all duration-200 
                            ${icon ? "pl-0" : ""}
                            ${error ? "border-red-500/50" : ""}
                            ${className}
                        `}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="text-xs text-red-400">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
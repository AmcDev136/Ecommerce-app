"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted ] = useState(false);

    // Evita hydration mismatch - renderiza solo en cliente
    useEffect(() => setMounted(true), []);
    if (!mounted) return <div style={{ width: 60, height:30 }} />;

    const isDark = theme === "dark";

    return (
        <>
            <style>{`
                .ts-toggle {
                position: relative;
                width: 60px;
                height: 30px;
                --light: #d8dbe0;
                --dark: #28292c;
                }
                .ts-toggle-label {
                    position: absolute;
                    width: 100%;
                    height: 30px;
                    background-color: var(--dark);
                    border-radius: 25px;
                    cursor: pointer;
                    border: 2px solid var(--dark);
                }
                .ts-toggle-input {
                    position: absolute;
                    display: none;
                }
                .ts-toggle-slider {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border-radius: 25px;
                    transition: 0.3s;
                }
                .ts-toggle-input:checked ~ .ts-toggle-slider {
                    background-color: var(--light);
                }
                .ts-toggle-slider::before {
                    content: "";
                    position: absolute;
                    top: 5px;
                    left: 5px;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    box-shadow: inset 7px -2px 0px 0px var(--light);
                    background-color: var(--dark);
                    transition: 0.3s;
                }
                .ts-toggle-input:checked ~ .ts-toggle-slider::before {
                    transform: translateX(30px);
                    background-color: var(--dark);
                    box-shadow: none;
                }
            `}</style>

            <div className="ts-toggle">
                <label className="ts-toggle-label">
                    <input
                        type="checkbox"
                        className="ts-toggle-input"
                        checked={isDark}
                        onChange={() => setTheme(isDark ? "light" : "dark" )}
                    />
                    <span className="ts-toggle-slider" />
                </label>
            </div>
        </>
    );
}
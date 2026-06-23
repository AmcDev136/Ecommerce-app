import type { Metadata } from "next";
import "./globals.css";
import { geistSans, geistMono } from "@/lib/fonts";
import Providers from "./providers";
import Navbar from "@/app/components/Navbar";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Techstack - Puro rendimiento. Cero fricción.",
  description: "La tienda de tecnología premium. Equipos de alto rendimiento.",
  icons: {
    icon: "/favicon-v2.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable}`}
      // supress evita el warning de next-themes
      suppressHydrationWarning
    >
      <body style={{ backgroundColor: "var(--bg)", color: "var(--white)" }} className="font-sans antialiased">
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#141414",
                color: "#EDEDED",
                border: "1px solid rgba(255,255,255,0.08",
                borderRadius: "12px",
                fontSize: "14px",
              },
              success: {
                iconTheme: { primary: "#00F2FE", secondary: "#050505" },
              },
              error: {
                iconTheme: { primary: "#EF4444", secondary: "#050505" },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
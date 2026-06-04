import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "E-commerce App",
    description: "Tu tienda online favorita!",
};

export default function RootLayout ({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          <Toaster position="bottom-right" />
          <Navbar />
            {children}
        </Providers>
      </body>
    </html>
  );
}
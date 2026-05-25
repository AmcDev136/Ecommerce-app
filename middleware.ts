import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(request) {
        const { pathname } = request.nextUrl;
        const token = request.nextauth.token;

        // Si un CLIENTE intenta acceder a rutas de admin, lo redirigimos
        if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/", request.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            // authorized define si el usuario puede acceder a la ruta
            // Si devuelve false, NextAuth redirige al login automáticamente
            authorized: ({ token, req }) => {
                const { pathname } = req.nextUrl;

                // Rutas que requieren autenticación
                const protectedRoutes = ["/profile", "orders", "/cart", "/admin"];
                const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

                // Si la ruta esta protegida, verificamos que haya token
                if (isProtected) return !!token;

                // Rutas públicas, cualquiera puede acceder
                return true;
            },
        },
    }
);

// Le decimos a Next.js en qué rutas ejecutar el middleware
// Excluimos archivos estáticos y rutas de la API para no interferir
export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
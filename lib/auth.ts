import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

// NextAuth exige extender los tipos para agregar campos custom (role, id)
// Esto evita errores de TypeScript al acceder a session.user.role
declare module "next-auth" {
    interface User {
        role: "ADMIN" | "CLIENTE";
    }
    interface Session {
        user: {
            id: string;
            email: string;
            name?: string | null;
            role: "ADMIN" | "CLIENTE";
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: "ADMIN" | "CLIENTE";
    }
}

export const authOptions: NextAuthOptions = {
    // JWT para guardar sesion (no base de datos)
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, //30 dias
    },

    pages: {
        signIn: "/login",
    },

    providers: [
        CredentialsProvider({
            // provider para login con email y password
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email"},
                password: { label: "Password", type: "password"},
            },

            async authorize(credentials) {
                try {
                    // Si no hay email o password, no autorizamos
                    if(!credentials?.email || !credentials.password) {
                        return null;
                    }

                // Buscamos usuario en BD
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if(!user) return null;

                // Comparamos password con hash en BD
                const passMatch = await bcrypt.compare(
                    credentials.password, 
                    user.password
                );

                if(!passMatch) return null;

                // Devolvemos el objeto usuario (NextAuth lo guardará en JWT)
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                };
            } catch (error) {
                console.error("Auth error:", error);
                return null;
            }
        },
    }),
],

    callbacks: {
        async jwt({ token, user }) { //jwt() se ejecuta cuando se crea o actualiza el token
            // La primera vez que se llama, 'user' contiene el objeto devuelto por authorize()
            if(user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },

        // Session() se ejecuta cuando el front pide sesión
        async session({ session, token }) {
            // Pasamos datos de token a la sesion accesible en el front
            if(token) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        },
    },

    secret: process.env.NEXTAUTH_SECRET,
};
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ApiResponse } from "@/types";
import { NextResponse } from "next/server";

// Verifica que el usuario esté autenticado
// Devuelve la sesion con 401
export async function requireAuth() {
    const session = await getServerSession(authOptions);

    if (!session) {
        const response: ApiResponse = {
            success: false,
            error: "No autenticado",
        };
        return { session: null, errorResponse: NextResponse.json(response, { status: 401 }) };
    }

    return { session, errorResponse: null };
}

// Verifica que el usuario sea ADMIN
// Devuelve la sesion con 403
export async function requireAdmin() {
    const { session, errorResponse } = await requireAuth();

    if (errorResponse) return { session: null, errorResponse };

    if(session!.user.role !== "ADMIN") {
        const response: ApiResponse = {
            success: false,
            error: "No tienes permisos para realizar esta acción",
        };
        return { session: null, errorResponse: NextResponse.json(response, { status: 403 }),
        };
    }

    return { session, errorResponse: null };
}
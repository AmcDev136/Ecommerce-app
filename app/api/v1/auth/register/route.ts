import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations/auth.schema";
import { authService } from "@/services/auth.service";
import { ApiResponse } from "@/types";

export async function POST(request: NextRequest) {
    try {
        // Parseamos body
        const body = await request.json();

        // Validamos con Zod
        const validation = registerSchema.safeParse(body);

        if (!validation.success) {
            // safeParse no lanza error, devuelve { success: false, error }
            const response: ApiResponse = {
                success: false,
                error: validation.error.errors[0].message,
            };
            return NextResponse.json(response, { status: 400 });
        }

        // Llamar servicio para crear usuario
        const user = await authService.register(validation.data);

        const response: ApiResponse<typeof user> = {
            success: true,
            message: "Usuario registrado exitosamente",
            data: user,
        };

        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        // error conocido (email duplicado)
        if (error instanceof Error) {
            const response: ApiResponse = {
                success: false,
                error: error.message,
            };
            return NextResponse.json(response, { status: 400 });
        }

        // Error desconocido
        const response: ApiResponse = {
            success: false,
            error: "Error interno del servidor",
        };
        return NextResponse.json(response, { status: 500 });
    }
}
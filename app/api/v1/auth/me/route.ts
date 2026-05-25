import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { authService } from "@/services/auth.service";
import { ApiResponse } from "@/types";

export async function GET() {
  try {
    // getServerSession lee el JWT automáticamente
    const session = await getServerSession(authOptions);

    if (!session) {
      const response: ApiResponse = {
        success: false,
        error: "No autenticado",
      };
      return NextResponse.json(response, { status: 401 });
    }

    // Obtenemos datos frescos de la BD (no solo los del token)
    const user = await authService.getUserById(session.user.id);

    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: "Usuario no encontrado",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<typeof user> = {
      success: true,
      data: user,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    const response: ApiResponse = {
      success: false,
      error: "Error interno del servidor",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
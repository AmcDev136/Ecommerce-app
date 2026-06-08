import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/services/order.service";
import { requireAuth, requireAdmin } from "@/lib/api-auth";
import { ApiResponse } from "@/types";

// Crear pedido desde el carrito (autenticado)
export async function POST(request: NextRequest) {
    try {
        const { session, errorResponse } = await requireAuth();
        if (errorResponse) return errorResponse;

        const order = await orderService.createOrder(session!.user.id);

        const response: ApiResponse<typeof order> = {
            success: true,
            message: "Pedido creado correctamente",
            data: order,
        };

        return NextResponse.json(response, { status: 201 });

    } catch (error) {
        if (error instanceof Error) {
            const response: ApiResponse = {
                success: false,
                error: error.message,
            };

            return NextResponse.json(response, { status: 400 });
        }

        const response: ApiResponse = {
            success: false,
            error: "Error interno del servidor",
        };
        return NextResponse.json(response, { status: 500 });
    }
}

// Historial del usuario (auth)
// Si es Admin, devuelve todos los pedidos
export async function GET(request: NextRequest) {
    try {
        const { session, errorResponse } = await requireAuth();
        if (errorResponse) return errorResponse;

        const isAdmin = session!.user.role === "ADMIN";

        const orders = isAdmin
            ? await orderService.getAllOrders()
            : await orderService.getOrders(session!.user.id);

        const response: ApiResponse<typeof orders> = {
            success: true,
            data: orders,
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
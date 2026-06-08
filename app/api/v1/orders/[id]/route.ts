import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/services/order.service";
import { requireAuth } from "@/lib/api-auth";
import { ApiResponse } from "@/types";
import { TypeOf } from "zod";

// Detalle del pedido (Auth)
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }

) {
    try {
        const { session, errorResponse } = await requireAuth();
        if (errorResponse) return errorResponse;

        const isAdmin = session!.user.role === "ADMIN";

        const order = await orderService.getOrderById(
            session!.user.id,
            params.id,
            isAdmin
        );

        const response: ApiResponse<typeof order> = {
            success: true,
            data: order,
        };

        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        if (error instanceof Error) {
            const response: ApiResponse = {
                success: false,
                error: error.message,
            };
            // 403 no tiene permiso, 404 no existe
            const status = error.message.includes("permiso") ? 403 : 404;
            return NextResponse.json(response, { status });
        }

        const response: ApiResponse = {
            success: false,
            error: "Error interno del servidor",
        };

        return NextResponse.json(response, { status: 500 });
    }
}
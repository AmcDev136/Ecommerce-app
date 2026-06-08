import { NextRequest, NextResponse } from "next/server";
import { orderService } from "@/services/order.service";
import { updateOrderStatusSchema } from "@/lib/validations/order.schema";
import { requireAdmin } from "@/lib/api-auth";
import { ApiResponse } from "@/types";

// Cambiar estado (solo Admin)
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { errorResponse } = await requireAdmin();
        if (errorResponse) return errorResponse;

        const body = await request.json();
        const validation = updateOrderStatusSchema.safeParse(body);

        if (!validation.success) {
            const response: ApiResponse = {
                success: false,
                error: validation.error.errors[0].message,
            };
            return NextResponse.json(response, { status: 400 });
        }

        const order = await orderService.updateOrderStatus(
            params.id,
            validation.data.status
        );

        const response: ApiResponse<typeof order> = {
            success: true,
            message: `Estado actualizado a ${validation.data.status}`,
            data: order,
        };

        return NextResponse.json(response, { status: 200 });

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
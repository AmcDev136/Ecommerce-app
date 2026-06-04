import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { cartService } from "@/services/cart.service";
import { updateCartItemSchema } from "@/lib/validations/cart.schema";

// PUT - Actualizar cantidad
export async function PUT(
    request: NextRequest, 
    { params }: { params: { itemId: string } }
) {
    const { session, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    try {
        const body = await request.json();
        const result = updateCartItemSchema.safeParse(body);
        if(!result.success) {
            return NextResponse.json(
                { success: false, error: result.error.errors[0].message },
                { status: 400 }
            );
        }

        const cart = await cartService.updateItem(
            session.user.id,
            params.itemId,
            result.data.quantity
        );
        return NextResponse.json({ success: true, data: cart });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 400}
            );
        }
        return NextResponse.json(
            { success: false, error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}

// DELETE - Eliminar item
export async function DELETE(
    _request: NextRequest,
    { params }: { params: { itemId: string } }
) {
    const { session, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    try {
        const cart = await cartService.removeItem(session.user.id, params.itemId);
        return NextResponse.json({ success: true, data: cart });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
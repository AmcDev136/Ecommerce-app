import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { cartService } from "@/services/cart.service";
import { addToCartSchema } from "@/lib/validations/cart.schema";

// Obtener carrito del usuario
export async function GET() {
    const { session, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    try {
        const cart = await cartService.getCart(session.user.id);
        return NextResponse.json({ success: true, data: cart });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}

// Agregar producto al carrito
export async function POST(request: NextRequest) {
    const { session, errorResponse } = await requireAuth();
    if (errorResponse) return errorResponse;

    try {
        const body = await request.json();
        const result = addToCartSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error.errors[0].message },
                { status: 400 }
            );
        }

        const cart = await cartService.addItem(
            session.user.id,
            result.data.productId,
            result.data.quantity
        );
        return NextResponse.json({ success: true, data: cart }, { status: 201 });
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
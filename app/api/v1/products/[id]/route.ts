import { NextRequest, NextResponse } from 'next/server';
import { productService } from "@/services/product.service";
import { updateProductSchema } from "@/lib/validations/product.schema";
import { requireAdmin } from "@/lib/api-auth";
import { ApiResponse } from "@/types";

// GET publico
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const product = await productService.getById(params.id);

        if (!product) {
            const response: ApiResponse= {
                success: false,
                error: "Producto no encontrado",
            };
            return NextResponse.json(response, { status: 404 });
        }

        const response: ApiResponse<typeof product> = {
            success: true,
            data: product,
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

// PUT solo admin
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string }}
) {
    try {
        const { errorResponse } = await requireAdmin();
        if (errorResponse) return errorResponse;

        const body = await request.json();
        const validation = updateProductSchema.safeParse(body);

        if (!validation.success) {
            const response: ApiResponse = {
                success: false,
                error: validation.error.errors[0].message,
            };
            return NextResponse.json(response, { status: 400 });
        }

        const product = await productService.update(params.id, validation.data);

        const response: ApiResponse<typeof product> = {
            success: true,
            message: "Producto actualizado correctamente",
            data: product,
        };

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            const response: ApiResponse = {
                success: false,
                error: error.message,
            };
            return NextResponse.json(response, { status: 404 });
        }

        const response: ApiResponse = {
            success: false,
            error: "Error interno del servidor",
        };
        return NextResponse.json(response, { status: 500 });
    }
}

//Delete solo admin
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string }}
) {
    try {
        const { errorResponse } = await requireAdmin();
        if (errorResponse) return errorResponse;

        await productService.delete(params.id);

        const response: ApiResponse = {
            success: true,
            message: "Producto eliminado correctamente",
        };

        return NextResponse.json(response, { status: 200 });

    } catch (error) {
        if (error instanceof Error) {
            const response: ApiResponse = {
                success: false,
                error: error.message,
            };
            return NextResponse.json(response, { status: 404 });
        }

        const response: ApiResponse = {
            success: false,
            error: "Error interno del servidor",
        };
        return NextResponse.json(response, { status: 500 });
    }
}
import { NextRequest, NextResponse } from "next/server";
import { categoryService } from "@/services/category.service";
import { updateCategorySchema } from "@/lib/validations/category.schema";
import { requireAdmin } from "@/lib/api-auth";
import { ApiResponse } from "@/types";

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { errorResponse } = await requireAdmin();
        if (errorResponse) return errorResponse;

        const body = await request.json();
        const validation = updateCategorySchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: validation.error.errors[0].message },
                { status: 400 }
            );
        }

        const category = await categoryService.update(params.id, validation.data);
        const response: ApiResponse<typeof category> = {
            success: true,
            message: "Categoria actualizada correctamente",
            data: category,
        };

        return NextResponse.json(response, { status: 200 });
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

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { errorResponse } = await requireAdmin();
        if (errorResponse) return errorResponse;

        await categoryService.delete(params.id);

        return NextResponse.json(
            { success: true, message: "Categoria eliminada correctamente" },
            { status: 200 }
        );

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
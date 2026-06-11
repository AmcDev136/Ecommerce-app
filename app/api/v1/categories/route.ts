import { NextRequest, NextResponse } from "next/server";
import { categoryService } from "@/services/category.service";
import { createCategorySchema } from "@/lib/validations/category.schema";
import { requireAdmin } from "@/lib/api-auth";
import { ApiResponse } from "@/types";

// GET - Publico
export async function GET() {
    try {
        const categories = await categoryService.getAll();
        const response: ApiResponse<typeof categories> = {
            success: true,
            data: categories,
        };
        return NextResponse.json(response, { status: 200 });
    } catch {
        return NextResponse.json(
            { success: false, error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}

// POST - Solo admin
export async function POST(request: NextRequest) {
    try {
        const { errorResponse } = await requireAdmin();
        if (errorResponse) return errorResponse;

        const body = await request.json();
        const validation = createCategorySchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: validation.error.errors[0].message },
                { status: 400 }
            );
        }

        const category = await categoryService.create(validation.data);
        const response: ApiResponse<typeof category> = {
            success: true,
            message: "Categoria creada correctamente",
            data: category,
        };
        return NextResponse.json(response, { status: 201 });

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
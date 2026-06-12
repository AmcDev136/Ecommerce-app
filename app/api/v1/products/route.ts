import { NextRequest, NextResponse } from "next/server";
import { productService } from "@/services/product.service";
import { createProductSchema, productQuerySchema } from "@/lib/validations/product.schema";
import { requireAdmin } from "@/lib/api-auth";
import { ApiResponse } from "@/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        // Extraemos los query params de la URL
        const { searchParams } = new URL(request.url);

        // Verificamos si es admin para ver inactivos
        const session = await getServerSession(authOptions);
        const isAdmin = session?.user.role === "ADMIN";

        const rawQuery = {
            page: searchParams.get("page") ?? undefined,
            limit: searchParams.get("limit") ?? undefined,
            search: searchParams.get("search") ?? undefined,
            minPrice: searchParams.get("minPrice") ?? undefined,
            maxPrice: searchParams.get("maxPrice") ?? undefined,
            categoryId: searchParams.get("categoryId") ?? undefined,
            // Si NO es admin, forzamos isActive=true ignorando lo que venga en la query
            // Si ES admin, usamos lo que venga en la query (o undefined para ver todos)
            isActive: isAdmin
                ? (searchParams.get("isActive") ?? undefined)
                : true,
        };

        // Validamos y transformamos los query params
        const validation = productQuerySchema.safeParse(rawQuery);

        if (!validation.success) {
            const response: ApiResponse = {
                success: false,
                error: validation.error.errors[0].message,
            };
            return NextResponse.json(response, { status: 400 });
        }

        const result = await productService.getAll(validation.data);

        const response: ApiResponse<typeof result> = {
            success: true,
            data: result,
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

// POST /api/v1/products — Solo admin
export async function POST(request: NextRequest) {
    try {
        // Verificamos que sea admin antes de continuar
        const { errorResponse } = await requireAdmin();
        if (errorResponse) return errorResponse;

        const body = await request.json();
        const validation = createProductSchema.safeParse(body);

        if (!validation.success) {
            const response: ApiResponse = {
                success: false,
                error: validation.error.errors[0].message,
            };
        return NextResponse.json(response, { status: 400 });
        }

        const product = await productService.create(validation.data);

        const response: ApiResponse<typeof product> = {
            success: true,
            message: "Producto creado correctamente",
            data: product,
        };

        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        const response: ApiResponse = {
            success: false,
            error: "Error interno del servidor",
        };
        return NextResponse.json(response, { status: 500 });
    }
}

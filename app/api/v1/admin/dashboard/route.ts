import { NextResponse } from "next/server";
import { dashboardService } from "@/services/dashboard.service";
import { requireAdmin } from "@/lib/api-auth";
import { ApiResponse } from "@/types";

// GET - solo admin
export async function GET() {
    try {
        const { errorResponse } = await requireAdmin();
        if (errorResponse) return errorResponse;
        
        const stats = await dashboardService.getStats();
        
        const response: ApiResponse<typeof stats> = {
            success: true,
            data: stats,
        };
    
    return NextResponse.json(response, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
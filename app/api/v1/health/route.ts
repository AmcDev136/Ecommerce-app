import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApiResponse } from '@/types';

export async function GET() {
    try{
        await prisma.$queryRaw`SELECT 1`;

        const response: ApiResponse<{
            status: string;
            database: string;
            timestamp: string;
            version: string;
        }> = {
            success: true,
            data: {
                status: 'ok',
                database: 'connected',
                timestamp: new Date().toISOString(),
                version: "1.0.0",
        },
    };

    return NextResponse.json(response, { status: 200 });

} catch (error) {
    const response: ApiResponse = {
        success: false,
        error: 'Database connection failed',
    };

    return NextResponse.json(response, { status: 503 });
    }
}
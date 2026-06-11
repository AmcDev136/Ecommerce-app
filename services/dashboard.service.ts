import prisma from "@/lib/prisma";

export const dashboardService = {

    async getStats() {
        // ejecutamos todas las queries en paralelo
        const [
            totalOrders,
            totalRevenue,
            totalProducts,
            totalUsers,
            loStockProducts,
            outOfStock,
            recentOrders,
            topProducts,
            ordersByStatus,
            revenueByDay,
        ] = await Promise.all([

            // Total pedidos
            prisma.order.count(),

            // Ingresos totales (solo pedidos no cancelados)
            prisma.order.aggregate({
                _sum: { total: true },
                where: { status: { not: "CANCELLED" } },
            }),

            // Total productos activos
            prisma.product.count({ where: { isActive: true } }),

            // Total usuarios
            prisma.user.count({ where: { role: "CLIENTE" } }),

            // Productos con stock bajo (1-5 unidades)
            prisma.product.findMany({
                where: { isActive: true, stock: { gt: 0, lte: 5 } },
                select: { id: true, name: true, stock: true },
                orderBy: { stock: "asc" },
                take: 5,
            }),

            // Productos agotados
            prisma.product.count({
                where: { isActive: true, stock: 0},
            }),

            // Actividad reciente (ultimos 5 pedidos)
            prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: "desc" },
                include: {
                    user: { select: { name: true, email: true } },
                    items: { select: { id: true } },
                },
            }),

            // Productos más vendidos ( por cantidad total vendida)
            prisma.orderItem.groupBy({
                by: ["productId"],
                _sum: { quantity: true },
                orderBy: { _sum: { quantity: "desc" } },
                take: 5,
            }),

            // Pedidos agrupados por estado
            prisma.order.groupBy({
                by: ["status"],
                _count: { id: true },
            }),

            // Ingresos ultimos 7 dias
            prisma.order.findMany({
                where: {
                    status: { not: "CANCELLED" },
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    },
                },
                select: { total: true, createdAt: true },
                orderBy: { createdAt: "asc" },
            }),
        ]);

        // Enriquecer los productos más vendidos con su nombre
        const topProductIds = topProducts.map((p) => p.productId);
        const topProductDetails = await prisma.product.findMany({
            where: { id: { in: topProductIds } },
            select: { id: true, name: true, price: true, imageUrl: true },
        });

        const topProductsEnriched = topProducts.map((item) => ({
            productId: item.productId,
            totalSold: item._sum.quantity ?? 0,
            product: topProductDetails.find((p) => p.id === item.productId),
        }));

        const revenueChartData = groupRevenueByDay(revenueByDay);

        return {
            kpis: {
                totalOrders,
                totalRevenue: Number(totalRevenue._sum.total ?? 0),
                totalProducts,
                totalUsers,
                outOfStockProducts: outOfStock,
            },
            lowStockProducts: loStockProducts,
            recentOrders,
            topProducts: topProductsEnriched,
            ordersByStatus,
            revenueChartData,
        };
    },
};

// Agrupa ingresos por dia
function groupRevenueByDay(
    orders: { total: any; createdAt: Date }[]
) {
    const days: Record<string, number> = {};

    // Inicializar ultimos 7 dias en 0
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const key = date.toLocaleDateString("es-ES", {
            weekday: "short",
            day: "numeric",
        });
        days[key] = 0;
    }

    // Sumar ingresos por dia
    for (const order of orders) {
        const key = new Date(order.createdAt).toLocaleDateString("es-ES", {
            weekday: "short",
            day: "numeric",
        });

        if (days[key] !== undefined) {
            days[key] += Number(order.total);
        }
    }

    return Object.entries(days).map(([date, revenue]) => ({ date, revenue }));
}
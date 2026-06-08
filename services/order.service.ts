import prisma from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

export const orderService = {
    // Crear pedido desde carrito de usuario
    // Usar $transaction para asegurar atomicidad
    async createOrder(userId: string) {
        // Obtener carrito con items y precios
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: true, //precio y stock actual
                    },
                },
            },
        });

        // Validar que el carrito existe con items
        if (!cart || cart.items.length === 0) {
            throw new Error("El carrito está vacío");
        }

        // Validar stock antes de la transaction
        for (const item of cart.items) {
            if (!item.product.isActive) {
                throw new Error(`El producto "${item.product.name}" ya no está disponible`);
            }
            if (item.product.stock < item.quantity) {
                throw new Error(
                    `Stock insuficiente para "${item.product.name}". Disponible: ${item.product.stock}`
                );
            }
        }

        // Calcular total
        const total = cart.items.reduce((sum, item) => {
            return sum + Number(item.product.price) * item.quantity;
        }, 0);

        // Ejecutar todo en transaccion atomica
        const order = await prisma.$transaction(async (tx) => {
            // Crear pedido
            const newOrder = await tx.order.create({
                data: {
                    userId,
                    total,
                    status: "PENDING",
                    items: {
                        create: cart.items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.product.price, // copiamos precio actual
                        })),
                    },
                },
                include: {
                    items: {
                        include: { product: true },
                    },
                },
            });

            // Descontar stock de cada producto
            for (const item of cart.items) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { stock: { decrement: item.quantity } },
                });
            }

            // Vaciar carrito
            await tx.cartItem.deleteMany({
                where: { cartId: cart.id },
            });

            return newOrder;
        });

        return order;
    },

    // Obtener historial de pedidos del usuario
    async getOrders(userId: string) {
        return prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            select: { id: true, name: true, imageUrl: true},
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" }, // mas recientes primero
        });
    },

    async getOrderById(userId: string, orderId: string, isAdmin: boolean = false) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: {
                            select: { id: true, name: true, imageUrl: true },
                        },
                    },
                },
                user: {
                    select: { id: true, name: true, email: true },
                },
            },
        });

        if (!order) {
            throw new Error("Pedido no encontrado");
        }

        // Usuario puede ver sus propios pedidos
        // admin puede ver cualquier pedido
        if (!isAdmin && order.userId !== userId) {
            throw new Error("No tienes permiso para ver este pedido");
        }

        return order;
    },

    // Obtener todos los pedidos (Admin)
    async getAllOrders() {
        return prisma.order.findMany({
            include: {
                items: {
                    include: {
                        product: {
                            select: { id: true, name: true, imageUrl: true },
                        },
                    },
                },
                user: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { createdAt: "desc"},
        });
    },

    // Cambiar estado de un pedido (Admin)
    async updateOrderStatus(orderId: string, status: OrderStatus) {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            throw new Error("Pedido no encontrado");
        }

        // No se puede cambiar un estado de un pedido cancelado o entregado
        if (order.status === "CANCELLED" || order.status === "DELIVERED") {
            throw new Error(`No se puede modificar un pedido en estado ${order.status}`);
        }

        return prisma.order.update({
            where: { id: orderId },
            data: { status },
        });
    },
};
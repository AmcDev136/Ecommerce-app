import prisma from "@/lib/prisma";

const cartInclude = {
    items: {
        include: { product: true },
        orderBy: { id: "asc" as const },
    },
};

export const cartService = {
    //obtiene o crea el carrito
    async getOrCreateCart(userId: string) {
        return prisma.cart.upsert({
            where: { userId },
            create: { userId },
            update: {},
            include: cartInclude,
        });
    },

    // Obtiene carrito
    async getCart(userId: string) {
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: cartInclude,
        });
        return cart;
    },

    // Agregar un producto, si existe aumenta cantidad
    async addItem(userId: string, productId: string, quantity: number) {
        //valida que el producto existe
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) throw new Error("Producto no encontrado");
        if (!product.isActive) throw new Error("Producto no disponible");
        if (product.stock < quantity) throw new Error(`Stock insuficiente. Disponible: ${product.stock}`);

        // Obtener o  crear el carrito
        const cart = await this.getOrCreateCart(userId);

        // verificar si el item ya existe
        const existing = await prisma.cartItem.findUnique({
            where: { cartId_productId: { cartId: cart.id, productId } },
        });
        if (existing) {
            const newQty = existing.quantity + quantity;
            if (product.stock < newQty)
                throw new Error(`Stock insuficiente, Disponible: ${product.stock}`);

            await prisma.cartItem.update({
                where: { id:existing.id },
                data: { quantity: newQty },
            });
        } else {
            await prisma.cartItem.create({
                data: { cartId: cart.id, productId, quantity },
            });
        }
        
        return this.getOrCreateCart(userId);
    },

    // actualiza cantidades
    async updateItem(userId: string, itemId: string, quantity: number) {
        const item = await prisma.cartItem.findFirst({
            where: { id:itemId, cart: { userId} },
            include: { product: true },
        });
        if (!item) throw new Error("Item no encontrado");
        if (item.product.stock < quantity) throw new Error(`Stock insuficiente. Disponible: ${item.product.stock}`);

        await prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity },
        });

        return this.getOrCreateCart(userId);
    },

    // Eliminar un item del carrito
    async removeItem(userId: string, itemId: string) {
        const item = await prisma.cartItem.findFirst({
            where: { id: itemId, cart: { userId } },
        });
        if (!item) throw new Error("Item no encontrado");

        await prisma.cartItem.delete({ where: { id: itemId } });
        return this.getOrCreateCart(userId);
    },
};
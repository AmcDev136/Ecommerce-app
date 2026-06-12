import prisma from "@/lib/prisma";
import { CreateProductInput, UpdateProductInput, ProductQueryInput } from "@/lib/validations/product.schema";
import { PaginatedResponse } from "@/types";
import { Product } from "@prisma/client";

export type ProductWithCategory = Product & {
    category: { id: string; name: string; slug: string } | null;
};

export const productService = {

    // Obtener listado de paginacion y filtros
    async getAll(query: ProductQueryInput): Promise<PaginatedResponse<Product>> {
        const { page, limit, search, minPrice, maxPrice, categoryId, isActive } = query;
        const skip = (page - 1) * limit; // Cuantos registros saltar

        // Construir filtros dinámicos
        const where = {
            ...(isActive !!== undefined && { isActive }),
            ...(search && {
                OR: [
                    { name: { contains: search, mode: "insensitive" as const } },
                    { description: { contains: search, mode:"insensitive" as const } },
                ],
            }),
            ...(categoryId && { categoryId }),
            ...(minPrice !== undefined || maxPrice !== undefined
                ? {
                    price: {
                        ...(minPrice !== undefined && { gte: minPrice }),
                        ...(maxPrice !== undefined && { lte: maxPrice }),
                    },
                }
            : {}),
        };

        // Ejecutamos dos queries en paralelo
        const [items, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    category: {
                        select: { id: true, name: true, slug: true },
                    },
                },
            }),
            prisma.product.count({ where }), // Total para calcular paginas
        ]);

        return {
            items,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    },

    // Obtener producto por ID
    async getById(id: string): Promise<ProductWithCategory | null> {
        return prisma.product.findFirst({
            where: { id, isActive: true },
            include: {
                category: {
                    select: { id: true, name: true, slug: true },
                },
            },
        });
    },

    // Incluir productos inactivos
    async getByAdmin(id: string): Promise<ProductWithCategory | null>{
        return prisma.product.findUnique({
            where: { id },
            include: {
                category: {
                    select: { id: true, name: true, slug: true },
                },
            },
        });
    },

    // Crear producto (solo admin)
    async create(data: CreateProductInput): Promise<Product> {
        return prisma.product.create({
            data: {
            name: data.name,
            description: data.description,
            price: data.price,
            stock: data.stock ?? 0,
            imageUrl: data.imageUrl || null,
            categoryId: data.categoryId || null,
            isActive: data.isActive ?? true,
            },
        });
    },

    // Actualizar producto (solo admin)
    async update(id: string, data: UpdateProductInput): Promise<Product> {
        // Verificamos que el producto existe antes de actualizar
        const product = await prisma.product.findUnique({ where: { id } });

        if (!product) {
            throw new Error("Producto no encontrado");
        }

        return prisma.product.update({
            where: { id },
            data: {
                ...data,
                imageUrl: data.imageUrl || null,
                categoryId: data.categoryId || null,
            },
        });
    },

    // Soft delete: marcamos como inactivo en vez de borrar
    async delete(id: string): Promise<void> {
        const product = await prisma.product.findUnique({ where: { id } });

        if (!product) {
            throw new Error("Producto no encontrado");
        }

        await prisma.product.update({
            where: { id },
            data: { isActive: false },
        });
    },

    // Actualizar solo el stock
    async updateStock(id: string, stock: number): Promise<Product> {
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) throw new Error("Producto no encontrado");

        if (stock < 0) throw new Error("El stock no puede ser negativo");

        return prisma.product.update({
            where: { id },
            data: { stock },
        });
    },
};
import prisma from "@/lib/prisma";
import { CreateProductInput, UpdateProductInput, ProductQueryInput } from "@/lib/validations/product.schema";
import { PaginatedResponse } from "@/types";
import { Product } from "@prisma/client";

export const productService = {

    // Obtener listado de paginacion y filtros
    async getAll(query: ProductQueryInput): Promise<PaginatedResponse<Product>> {
        const { page, limit, search, minPrice, maxPrice } = query;
        const skip = (page - 1) * limit; // Cuantos registros saltar

        // Construir filtros dinámicos
        const where = {
            isActive: true, // solo productos activos
            ...(search && {
                // si hay busqueda, filtramos por nombre o desc
                OR: [
                    { name: { contains: search, mode: "insensitive" as const}},
                    { description: { contains: search, mode: "insensitive" as const}},
                ],
            }),

            ...(minPrice !== undefined || maxPrice !== undefined
                ? {
                    price: {
                        ...(minPrice !== undefined && { gte: minPrice }), // mayor o igual a minPrice
                        ...(maxPrice !== undefined && { lte: maxPrice }), // menor o igual a maxPrice
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
                orderBy: { createdAt: "desc" }, // mas recientes primero
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
    async getById(id: string): Promise<Product | null> {
        return prisma.product.findFirst({
            where: {
            id,
            isActive: true,
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
            imageUrl: data.imageUrl,
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
            data,
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
};
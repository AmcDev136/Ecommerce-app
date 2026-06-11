import prisma from "@/lib/prisma";
import { CreateCategoryInput, UpdateCategoryInput } from "@/lib/validations/category.schema";
import { Category } from "@prisma/client";

export const categoryService = {

    async getAll(): Promise<Category[]> {
        return prisma.category.findMany({
            orderBy: { name: "asc" },
        });
    },

    async getById(id: string): Promise<Category | null> {
        return prisma.category.findUnique({ 
            where: { id }
        });
    },

    async create(data: CreateCategoryInput): Promise<Category> {
        // Verificar que nombre y slug no existan
        const existing = await prisma.category.findFirst({
            where: {
                OR: [{ name: data.name }, { slug: data.slug }],
            },
        });

        if (existing) {
            throw new Error("Ya existe una categoría con ese nombre o slug");
        }

        return prisma.category.create({ data });
    },

    async update(id: string, data: UpdateCategoryInput): Promise<Category> {
        const category = await prisma.category.findUnique({ where: { id } });

        if (!category) throw new Error("Categoría no encontrada");

        return prisma.category.update({ where: { id }, data });
    },

    async delete(id: string): Promise<void> {
        const category = await prisma.category.findUnique({
            where: { id },
            include: { _count: { select: { products: true } } },
        });

        if (!category) throw new Error("Categoría no encontrada");

        // No eliminar si tiene productos asignados
        if (category._count.products > 0) {
            throw new Error(
                `No se puede eliminar - tiene ${category._count.products} producto(s) asignado(s)`
            );
        }

        await prisma.category.delete({ where: { id } });
    },
};
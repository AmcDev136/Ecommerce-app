import { z } from "zod";

export const createCategorySchema = z.object({
    name: z
        .string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede tener más de 50 caracteres"),
    slug: z
        .string()
        .min(2, "El slug debe tener al menos 2 caracteres")
        .max(50, "El slug no puede tener más de 50 caracteres")
        .regex(
            /^[a-z0-9-]+$/,
            "El slug solo puede contener letras minúsculas, números y guiones"
        ),
        description: z.string().max(200).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
import { z } from 'zod';

export const createProductSchema = z.object({
    name: z
        .string()
        .min(2, "El nombre del producto debe tener al menos 2 caracteres")
        .max(100, "El nombre del producto no puede tener más de 100 caracteres"),
    description: z
        .string()
        .max(500, "La descripción del producto no puede tener más de 500 caracteres")
        .optional(),
    price: z
        .number()
        .positive("El precio del producto debe ser un número positivo")
        .multipleOf(0.01, "El precio del producto solo puede tener 2 decimales"),
    stock: z
        .number()
        .int("El stock del producto debe ser un número entero")
        .min(0, "El stock no puede ser negativo")
        .default(0),
    imageUrl: z
        .string()
        .url("La URL de la imagen no es válida")
        .optional()
        .or(z.literal("")),
    categoryId: z.string().optional(),
    isActive: z.boolean().optional(),
});

// Para actualizar, todos los campos son opcionales
export const updateProductSchema = createProductSchema.partial();

// Schema para los query params del listado
export const productQuerySchema = z.object({
    page: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 1)),
    limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val) : 10)),
    search: z.string().optional(),
    minPrice: z
        .string()
        .optional()
        .transform((val) => (val ? parseFloat(val) : undefined)),
    maxPrice: z
        .string()
        .optional()
        .transform((val) => (val ? parseFloat(val) : undefined)),
    categoryId: z.string().optional(),
    isActive: z.string().optional()
        .transform((val) => {
            if (val === "true") return true;
            if (val === "false") return false;
            return undefined;
        }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
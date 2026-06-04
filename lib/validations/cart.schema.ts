import { z } from "zod";

export const addToCartSchema = z.object({
    productId: z.string().min(1, "El ID del producto es requerido"),
    quantity: z.number().int().min(1,  "La cantidad minima es 1").max(99),
});

export const updateCartItemSchema = z.object({
    quantity: z.number().int().min(1, "La cantidad minima es 1").max(99),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
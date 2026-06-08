import { z } from "zod";

//El pedido se crear desde el carrito activo
// Valida cambio de estado (admin)
export const updateOrderStatusSchema = z.object({
    status: z.enum(
        ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"],
        { errorMap: () => ({ message: "Estado inválido" }) }
    ),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
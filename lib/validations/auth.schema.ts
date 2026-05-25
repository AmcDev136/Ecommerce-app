import { z } from "zod";

//Schema para registro de usuario
export const registerSchema = z.object({
    name: z
        .string()
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede tener más de 50 caracteres"),
    email: z
        .string()
        .email("Email inválido"),
    password: z
        .string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .regex(/[A-Z]/, "La contraseña debe contener al menos una letra mayúscula")
        .regex(/[a-z]/, "La contraseña debe contener al menos una letra minúscula")
        .regex(/[0-9]/, "La contraseña debe contener al menos un número")
        .regex(/[@$!%*?&]/, "La contraseña debe contener al menos un carácter especial (@$!%*?&)"),
});

// Schema para login
export const loginSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(1, "La contraseña es requerida"),
});

// Tipos TypeScript inferidos desde los schemas
// Así no repetimos la definición de tipos a mano
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { RegisterInput } from '@/lib/validations/auth.schema';
import { SafeUser } from '@/types';

export const authService = {
    // Registrar nuevo usuario
    async register(data: RegisterInput): Promise<SafeUser> {
        // Verificar si email existe
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new Error("Email ya registrado");
        }

        // Hashear password, 10 para buen balance entre seguridad y performance
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Crear usuario en BD
        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                // role asignado por defecto como cliente
            },
        });

        // Devolvemos user sin contraseña
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt,
        };
    },

    // Obtener user por ID (sin password)
    async getUserById(id: string): Promise<SafeUser | null> {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });

        return user;
    },
};
import { AppError } from "../../common/errors/AppError.js";
import { hashPassword } from "../../common/password.js";
import { prisma } from "../../lib/prisma.js";

import type { RegisterInput } from "./auth.validation.js";


export async function registerUser(input: RegisterInput) {
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email: input.email },
                { phone: input.phone },
            ],
        },

    });

    if (existingUser) {
        if(existingUser.email === input.email) {
            throw new AppError("User with this email already exists", 409);
        }
        
        throw new AppError(
            "User with this phone already exists", 409,
        );
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
        data: {
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            phone: input.phone,
            passwordHash,
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
            status: true,
            isEmailVerified: true,
            isPhoneVerified: true,
            createdAt: true,
        },
    });

    return user;
}
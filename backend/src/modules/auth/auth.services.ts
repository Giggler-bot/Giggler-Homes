import { AppError } from "../../common/errors/AppError.js";
import { generateAccessToken } from "../../common/jwt.js";
import { hashPassword, comparePasswords} from "../../common/password.js";
import { prisma } from "../../lib/prisma.js";

import type { RegisterInput, LoginInput } from "./auth.validation.js";

export async function registerUser(input: RegisterInput) {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: input.email }, { phone: input.phone }],
    },
  });

  if (existingUser) {
    if (existingUser.email === input.email) {
      throw new AppError("User with this email already exists", 409);
    }

    throw new AppError("User with this phone already exists", 409);
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

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  if(user.status !== "ACTIVE") {
    throw new AppError("This account is not active", 403);
  }

  const isPasswordValid = await comparePasswords(
    input.password,
    user.passwordHash,
  );

  if(!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  };

  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
  });

  return {
    accessToken, 
    user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        createdAt: user.createdAt,
    },
  };

}

export async function getCurrentUser( userId: string, ) {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
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
            updatedAt: true,
        },
    });

    if(!user) {
        throw new AppError(
            "User account no longer exists", 404,
        );
    }

    return user;
}
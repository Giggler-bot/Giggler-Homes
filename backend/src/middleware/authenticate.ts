import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

import { AppError } from "../common/errors/AppError.js";
import { verifyAccessToken } from "../common/utils/jwt.js";
import { prisma } from "../lib/prisma.js";

export const authenticate: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError("Authorization header is required", 401);
    }

    const parts = authHeader.trim().split(/\s+/);

    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
      throw new AppError("Invalid authorization header format", 401);
    }

    const payload = verifyAccessToken(parts[1]);

    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
      select: {
        id: true,
        role: true,
        status: true,
        deletedAt: true,
      },
    });

    if (!user || user.deletedAt) {
      throw new AppError("Invalid access token", 401);
    }

    if (user.status !== "ACTIVE") {
      throw new AppError("This account is not active", 403);
    }

    req.user = {
      id: user.id,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError("Access token has expired", 401));
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError("Invalid access token", 401));
      return;
    }
    next(error);
  }
};

import { RequestHandler } from "express";

import jwt from "jsonwebtoken";

import { AppError } from "../common/errors/AppError.js";
import { verifyAccessToken } from "../common/utils/jwt.js";

export const authenticate: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const authHeader = req.headers.authorization;

    if(!authHeader) {
        throw new AppError("Authorization header is required", 401);
    }

    const [scheme, token] = authHeader.split(" ");

    if (
        scheme !== "Bearer" || !token
    ) {
        throw new AppError("Invalid authorization header format", 401);
    }

    const payload = verifyAccessToken(token);

    req.user = {
        id: payload.userId,
        role: payload.role,
    };

    next();

  } catch (error) {
    if(error instanceof jwt.TokenExpiredError){
        next(
            new AppError(
                "Access token has expired",
                401,
            ),
        );
        return;
    }
    if(error instanceof jwt.JsonWebTokenError){
        next(
            new AppError(
                "Invalid access token",
                401
            ),
        );
        return;
    }
    next(error);
  }
};

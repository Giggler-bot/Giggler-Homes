
import jwt, { type SignOptions } from "jsonwebtoken";

import { env } from "../../config/env.js";

import type { UserRole } from "../types/role.js";

export type AccessTokenPayload = {
  userId: string;
  role: UserRole;
};

export function generateAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn as SignOptions["expiresIn"],
    algorithm: "HS256",
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.jwtAccessSecret, {
    algorithms: ["HS256"],
  });

  if (
    typeof decoded === "string" ||
    typeof decoded.userId !== "string" ||
    !decoded.userId ||
    typeof decoded.role !== "string" ||
    !decoded.role
  ) {
    throw new jwt.JsonWebTokenError("Invalid access token");
  }

  return {
    userId: decoded.userId,
    role: decoded.role as UserRole,
  };
}

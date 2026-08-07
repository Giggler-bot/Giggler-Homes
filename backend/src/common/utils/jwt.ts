import jwt, { type SignOptions} from "jsonwebtoken";

import { env } from "../../config/env.js";

import type { UserRole } from "../types/role.js";

export type AccessTokenPayload = {
  userId: string;
  role: UserRole;
};

export function generateAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn as SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.jwtAccessSecret);
  
  if (typeof decoded === "string" || !decoded.userId || !decoded.role) {
    throw new Error("Invalid access token");
  }

  return {
    userId: decoded.userId,
    role: decoded.role,
  };
}

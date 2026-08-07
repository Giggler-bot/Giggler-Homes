import { RequestHandler } from "express";

import { AppError } from "../common/errors/AppError.js";
import type { UserRole } from "../common/types/role.js";

export function authorizeRoles(...allowedRoles: UserRole[]): RequestHandler {
  return (req, res, next) => {
    if (!req.user) {
      next(new AppError("Authentication is required", 401));
      return;
    }

    const isAllowed = allowedRoles.includes(req.user.role);
    if (!isAllowed) {
      next(
        new AppError("You do not have permission to perform this action", 403)
      );
      return;
    }

    next();
  };
}
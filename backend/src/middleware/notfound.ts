
import type { Request, Response, NextFunction } from "express";

import { AppError } from "../common/errors/AppError.js";

export function notFound(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  next(
    new AppError(
      `Route ${req.method} ${req.originalUrl} was not found`,
      404,
    ),
  );
}

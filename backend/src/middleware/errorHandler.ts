import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from "express";

import { env } from "../config/env.js";

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const statuscode =
    "statusCode" in error && typeof error.statusCode === "number"
      ? error.statusCode
      : 500;
  const message = statuscode === 500 ? "internal server error" : error.message;

  res.status(statuscode).json({
    success: false,
    message,
    ...(env.nodeEnv === "development" && {
      stack: error.stack,
    }),
  });
}

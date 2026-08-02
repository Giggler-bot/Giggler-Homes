import type { ErrorRequestHandler } from "express";

import { env } from "../config/env.js";
import { ZodError } from "zod";

import { AppError } from "../common/errors/AppError.js";

export const errorHandler: ErrorRequestHandler = (
  error, req, res, next
) => {
  if(error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.issues.map((issue) => ({
        message: issue.message,
      })),
    });
    return;
  }

  if(error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  console.error(error);

  res.status(500).json({
    success: false,
    message: "internal server error",
    ...(env.nodeEnv === "development" && {
      stack: error.stack,
    }),
  });
}

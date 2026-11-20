import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import multer from "multer";

import { env } from "../config/env.js";
import { AppError } from "../common/errors/AppError.js";
import { Prisma } from "../generated/prisma/client.js";

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  // ---------------------------------------------------------------------------
  // Zod validation errors
  // ---------------------------------------------------------------------------

  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });

    return;
  }

  // ---------------------------------------------------------------------------
  // Malformed JSON
  // ---------------------------------------------------------------------------

  if (
    error instanceof SyntaxError &&
    "status" in error &&
    error.status === 400 &&
    "type" in error &&
    error.type === "entity.parse.failed"
  ) {
    res.status(400).json({
      success: false,
      message: "Invalid JSON request body",
    });
  }

  // ---------------------------------------------------------------------------
  // Request body too large
  // ---------------------------------------------------------------------------

  if (error.type === "entity.too.large") {
    res.status(413).json({
      success: false,
      message: "Request body is too large",
    });

    return;
  }

  // ---------------------------------------------------------------------------
  // Multer upload errors
  // ---------------------------------------------------------------------------

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        success: false,
        message: "File size exceeds the 50 MB limit",
      });

      return;
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      res.status(400).json({
        success: false,
        message: "Only one file can be uploaded at a time",
      });

      return;
    }

    if (error.code === "LIMIT_FIELD_COUNT") {
      res.status(400).json({
        success: false,
        message: "Too many form fields",
      });

      return;
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      res.status(400).json({
        success: false,
        message: "Unexpected file field",
      });

      return;
    }

    res.status(400).json({
      success: false,
      message: "Invalid file upload",
    });

    return;
  }

  // ---------------------------------------------------------------------------
  // Application errors
  // ---------------------------------------------------------------------------

  if (error instanceof AppError) {
    if (!error.isOperational) {
      console.error(error);
    }

    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });

    return;
  }

  // ---------------------------------------------------------------------------
  // Prisma errors
  // ---------------------------------------------------------------------------

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Duplicate record
    if (error.code === "P2002") {
      res.status(409).json({
        success: false,
        message: "A record with these values already exists",
      });

      return;
    }

    // Selected database connectivity failures
    if (["P1001", "P1002", "P1017"].includes(error.code)) {
      console.error(error);

      res.status(503).json({
        success: false,
        message: "Database service is temporarily unavailable",
      });

      return;
    }
  }

  // Prisma initialization failure
  if (
    error instanceof Error &&
    error.name === "PrismaClientInitializationError"
  ) {
    console.error(error);

    res.status(503).json({
      success: false,
      message: "Database service is temporarily unavailable",
    });

    return;
  }

  // ---------------------------------------------------------------------------
  // Unexpected errors
  // ---------------------------------------------------------------------------

  console.error(error);

  res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(env.nodeEnv === "development" && {
      stack: error instanceof Error ? error.stack : undefined,
    }),
  });
};

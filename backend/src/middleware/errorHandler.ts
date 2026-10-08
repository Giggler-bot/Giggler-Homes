import type { ErrorRequestHandler } from "express";

import { env } from "../config/env.js";
import { ZodError } from "zod";

import { AppError } from "../common/errors/AppError.js";

import { Prisma } from "../generated/prisma/client.js";

import multer from "multer";

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.issues.map((issue) => ({
        message: issue.message,
      })),
    });
    return;
  }

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        success: false,
        message: "File size exceeds the 10 MB limit",
      });
      return;
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      res.status(400).json({
        success: false,
        message:
          "Invalid file type. Allowed types are JPEG, PNG, WebP, and PDF",
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: "Invalid file upload",
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      res.status(409).json({
        success: false,
        message: "A record with these values already exists",
      });
      return;
    }
  }

  console.error(error);

  res.status(500).json({
    success: false,
    message: "internal server error",
    ...(env.nodeEnv === "development" && {
      stack: error.stack,
    }),
  });
};

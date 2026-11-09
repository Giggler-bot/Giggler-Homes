import type { RequestHandler } from "express";
import { fileTypeFromBuffer } from "file-type";
import { AppError } from "../common/errors/AppError.js";

const allowedMediaTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export const validateMediaFile: RequestHandler = async (req, _res, next) => {
  try {
    if (!req.file) {
      throw new AppError("Media file is required", 400);
    }

    const detectedType = await fileTypeFromBuffer(req.file.buffer);

    if (!detectedType || !allowedMediaTypes.includes(detectedType.mime)) {
      throw new AppError("Invalid or unsupported media file type", 400);
    }

    if (detectedType.mime !== req.file.mimetype) {
      throw new AppError(
        "File content does not match the declared media type",
        400,
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

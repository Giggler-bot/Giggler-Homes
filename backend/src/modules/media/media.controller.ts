import type { Request, Response } from "express";
import { createMedia } from "./media.service.js";

export async function createMediaController(req: Request, res: Response) {
  const media = await createMedia(req.body);
  res.status(201).json({
    success: true,
    message: "Media created successfully",
    data: {
      media,
    },
  });
}

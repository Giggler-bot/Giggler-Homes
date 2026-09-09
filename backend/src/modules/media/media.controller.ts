import type { Request, Response } from "express";

import { createMedia, deleteMedia, getMediaById, getPropertyMedia, updateMedia } from "./media.service.js";


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


export async function getPropertyMediaController(req: Request<{ propertyId: string }>, res: Response) {
  const media = await getPropertyMedia(req.params.propertyId); 
  res.status(200).json({
    success: true,
    message: "Property media retrieved successfully",
    data: {
      media,
    },
  });
}

export async function getMediaByIdController(req: Request<{ mediaId: string }>, res: Response) {
  const media = await getMediaById(req.params.mediaId);

  res.status(200).json({
    success: true,
    message: "Media retrieved successfully",
    data: {
      media,
    },
  });
}

export async function updatemediaController(req: Request<{ mediaId: string }>, res: Response) {
  const media = await updateMedia(req.params.mediaId, req.body);  
  res.status(200).json({
    success: true,
    message: "Media updated successfully",
    data: {
      media,
    },
  });
}

export async function deleteMediaController(req: Request<{ mediaId: string }>, res: Response) {
  const media = await deleteMedia(req.params.mediaId);
  res.status(200).json({
    success: true,
    message: "Media deleted successfully",
    data: {
      media,
    },
  });
}
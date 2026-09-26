import type { Request, Response, NextFunction } from "express";
import {
  createAmenity,
  deleteAmenity,
  getAmenities,
  getAmenityById,
  updateAmenity,
  reactivateAmenity,
} from "./amenity.service.js";

export async function createAmenityController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const amentity = await createAmenity(req.body);

    res.status(201).json({
      success: true,
      message: "Amenity created successfully",
      data: amentity,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAmenitiesController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const amentities = await getAmenities(
      req.query.category as
        | "SECURITY"
        | "UTILITIES"
        | "COMFORT"
        | "OUTDOOR"
        | "PARKING"
        | "CONNECTIVITY"
        | undefined,
    );

    res.status(200).json({
      success: true,
      data: amentities,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAmenityByIdController(
  req: Request<{ amenityId: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const amenity = await getAmenityById(req.params.amenityId);
    res.status(200).json({
      success: true,
      data: amenity,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAmenityController(
  req: Request<{ amenityId: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const amenity = await updateAmenity(req.params.amenityId, req.body);

    res.status(200).json({
      success: true,
      message: "Amenity updated successfully",
      data: amenity,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAmenityController(
  req: Request<{ amenityId: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    await deleteAmenity(req.params.amenityId);

    res.status(200).json({
      success: true,
      message: "Amenity deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function reactivateAmenityController(
  req: Request<{ amenityId: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const amenity = await reactivateAmenity(req.params.amenityId);
    res.status(200).json({
      success: true,
      data: amenity,
    });
  } catch (error) {
    next(error);
  }
}

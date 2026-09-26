import type { Request, Response, NextFunction } from "express";
import {
  assignAmenityToProperty,
  createProperty,
  getPropertyAmenities,
  removeAmenityFromProperty,
  updatePropertyAvailability,
} from "./property.service.js";
import { futimesSync } from "node:fs";

export async function createPropertycontroller(req: Request, res: Response) {
  const property = await createProperty({
    ownerId: req.user?.id,
    ...req.body,
  });

  res.status(201).json({
    success: true,
    message: "Property created successfully",
    data: {
      propertyId: req.params.propertyId,
      authenticatedUser: req.user,
    },
  });
}

export async function updatePropertyAvailabilityController(
  req: Request<{ propertyId: string }>,
  res: Response,
) {
  const property = await updatePropertyAvailability(
    req.params.propertyId,
    req.body.isAvailable,
  );

  res.status(200).json({
    success: true,
    message: "Property availability updated successfully",
    data: {
      propertyId: property.id,
      isAvailable: property.isAvailable,
    },
  });
}

export async function assignPropertyAmenityController(
  req: Request<{ propertyId: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const assignment = await assignAmenityToProperty(
      req.params.propertyId,
      req.body.amenityId,
    );

    res.status(201).json({
      success: true,
      message: "Amenity assigned to property successfully",
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPropertyAmenitiesController(
  req: Request<{ propertyId: string }>,
  res: Response,
  next: NextFunction,
) {
   try {
    const amenities = await getPropertyAmenities(
      req.params.propertyId,
    );

    res.status(200).json({
      success: true,
      data: amenities,
    });
  } catch (error) {
    next(error);
  } 
}

export async function removePropertyAmenityController(
  req: Request<{ propertyId: string; amenityId: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    await removeAmenityFromProperty(
      req.params.propertyId,
      req.params.amenityId,
    );

    res.status(200).json({
      success: true,
      message: "Amenity removed from property successfully",
    });
  } catch (error) {
    next(error);
  }
}
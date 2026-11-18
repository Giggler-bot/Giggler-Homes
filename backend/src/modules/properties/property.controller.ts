import type { Request, Response, NextFunction } from "express";
import {
  assignAmenityToProperty,
  createProperty,
  updateProperty,
  getPropertyAmenities,
  removeAmenityFromProperty,
  updatePropertyAvailability,
  softDeleteProperty,
  getRecentlyDeletedProperties,
  restoreProperty,
} from "./property.service.js";

export async function createPropertyController(req: Request, res: Response) {
  const property = await createProperty({
    ...req.body,
    ownerId: req.user?.id,
  });

  res.status(201).json({
    success: true,
    message: "Property created successfully",
    data: {
      property,
    },
  });
}

export async function updatePropertyController(
  req: Request<{ propertyId: string }>,
  res: Response,
) {
  const property = await updateProperty(req.params.propertyId, req.body);

  res.status(200).json({
    success: true,
    message: "Property updated successfully",
    data: {
      property,
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
    const amenities = await getPropertyAmenities(req.params.propertyId);

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

export async function deletePropertyController(
  req: Request<{ propertyId: string }>,
  res: Response,
) {
  const property = await softDeleteProperty(req.params.propertyId);

  return res.status(200).json({
    success: true,
    message: "Property deleted successfully",
    data: {
      property,
    }
  })
}

export async function getRecentlyDeletedPropertiesController(
  req: Request,
  res: Response,
) {
  const ownerId = req.user!.id;

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const result = await getRecentlyDeletedProperties(
    ownerId,
    page,
    limit,
  );

  res.status(200).json({
    success: true,
    message: "Recently deleted properties retrieved successfully",
    data: result,
  });
}

export async function restorePropertyController(
  req: Request<{ propertyId: string }>,
  res: Response,
) {
  const property = await restoreProperty(req.params.propertyId);

  res.status(200).json({
    success: true,
    message: "Property restored successfully",
    data: {
      property,
    },
  });
}
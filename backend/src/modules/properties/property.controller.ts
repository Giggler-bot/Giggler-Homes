import type { Request, Response } from 'express';
import { createProperty, updatePropertyAvailability } from './property.service.js';
import { property } from 'zod';

export async function createPropertycontroller(
    req: Request,
    res: Response
) {

    const property = await createProperty({
        ownerId: req.user?.id,
        ...req.body,
    })

    res.status(200).json({
        success: true,
        message: "Property created successfully",
        data: {
            propertyId: req.params.propertyId,
            authenticatedUser: req.user
        }
    })

}

// export async function updatePropertyController(
//     req: Request,
//     res: Response
// ) {
//     const property = await updateProperty({
//         ownerId: req.user?.id,
//         ...req.body,

//     })
// }


export async function updatePropertyAvailabilityController(
  req: Request<{ propertyId: string}>,
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
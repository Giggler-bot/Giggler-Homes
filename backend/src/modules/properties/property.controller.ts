import type { Request, Response } from 'express';
import { createProperty } from './property.service.js';

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
        message: "You are authorized to update this property",
        data: {
            propertyId: req.params.propertyId,
            authenticatedUser: req.user
        }
    })
}
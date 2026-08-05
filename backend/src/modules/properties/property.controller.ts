import type { Request, Response } from 'express';

export function updateProperty(
    req: Request,
    res: Response
): void {
    res.status(200).json({
        success: true,
        message: "You are authorized to update this property",
        data: {
            propertyId: req.params.propertyId,
            authenticatedUser: req.user
        }
    })
}
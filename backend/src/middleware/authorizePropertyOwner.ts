import { RequestHandler } from "express";

import { AppError } from "../common/errors/AppError.js";
import { prisma } from "../lib/prisma.js";

export function authorizepropertyOwner(): RequestHandler {
    return async (req, res, next) => {
        try {
            if (!req.user){
                throw new AppError("Authentication is required", 401);
            }
            const propertyId = req.params.propertyId as string;

        if(!propertyId){
            throw new AppError("Property ID is required", 400);
        }

        const property = await prisma.property.findUnique({
            where: {
                id: propertyId,
            },
            select: {
                id: true,
                ownerId: true,
            },
        });

        if(!property){
            throw new AppError("Property not found", 404);
        }

        const isAdmin = req.user.role === "ADMIN";
        const isOwner = req.user.id === property.ownerId;

        if(!isAdmin && !isOwner){
            throw new AppError("You do not have permission to perform this action", 403);
        }

        next();
        } catch (error) {
        next(error);
    } 
    }
}
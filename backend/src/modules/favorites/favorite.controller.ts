import type { Request, Response, NextFunction } from "express";
import * as favoritesService from "./favorite.service.js";

export async function createFavoriteController(
  req: Request<{ listingId: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.id;
    const { listingId } = req.params;

    const favorite = await favoritesService.createFavorite(userId, listingId);

    res.status(201).json({
      success: true,
      data: favorite,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteFavoriteController(
  req: Request<{ listingId: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.id;
    const { listingId } = req.params;

    await favoritesService.deleteFavorite(userId, listingId);

    res.status(200).json({
      success: true,
      message: "Favorite removed successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function getFavoriteStatusController(
  req: Request<{ listingId: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.id;
    const { listingId } = req.params;

    const result = await favoritesService.getFavoriteStatus(userId, listingId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyFavoritesController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user!.id;
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    const result = await favoritesService.getMyFavorites(userId, page, limit);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
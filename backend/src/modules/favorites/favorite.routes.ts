import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { favoriteListingSchema, favoriteListsSchema } from "./favorite.validation.js";
import { createFavoriteController, deleteFavoriteController, getFavoriteStatusController, getMyFavoritesController } from "./favorite.controller.js";



const favoriteRouter = Router();

favoriteRouter.use(authenticate);

favoriteRouter.post(
    "/:listingId",
    validateRequest(favoriteListingSchema),
    createFavoriteController,
);

favoriteRouter.get(
    "/",
    validateRequest(favoriteListsSchema),
    getMyFavoritesController,
);

favoriteRouter.get(
    "/:listingId",
    validateRequest(favoriteListingSchema),
    getFavoriteStatusController
);

favoriteRouter.delete(
    "/:listingId",
    validateRequest(favoriteListingSchema),
    deleteFavoriteController,
);

export default favoriteRouter;
import { z } from "zod";


export const favoriteListingSchema = z.object({
    params: z.object({
        listingId: z.uuid(),
    }),
});


export const favoriteListsSchema = z.object({
    query: z.object({
        page: z.coerce.number().int().min(1).optional(),
        limit: z.coerce.number().int().min(1).max(100).optional()
    }),
});
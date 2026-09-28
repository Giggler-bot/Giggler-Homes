import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../common/errors/AppError.js";

export const createFavorite = async (userId: string, listingId: string) => {
  const listing = await prisma.listing.findFirst({
    where: {
      id: listingId,
      status: "ACTIVE",
    },
  });

  if (!listing) {
    throw new AppError("Active listing not found", 404);
  }

  const existingFavorite = await prisma.favorite.findUnique({
    where: {
      userId_listingId: {
        userId,
        listingId,
      },
    },
  });

  if (existingFavorite) {
    throw new AppError("Listing is already favorited", 409);
  }

  return prisma.favorite.create({
    data: {
      userId,
      listingId,
    },
  });
};

export const deleteFavorite = async (userId: string, listingId: string) => {
    const favorite = await prisma.favorite.findUnique({
        where: {
            userId_listingId: {
                userId,
                listingId,
            },
        },
    });  
    
    if(!favorite){
        throw new AppError("Favorite not found", 404);
    }

    await prisma.favorite.delete({
        where: {
            userId_listingId: {
                userId,
                listingId
            },
        },
    });
};


export const getFavoriteStatus = async (
  userId: string,
  listingId: string,
) => {
  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_listingId: {
        userId,
        listingId,
      },
    },
    select: {
      createdAt: true,
    },
  });

  return {
    isFavorited: Boolean(favorite),
    createdAt: favorite?.createdAt ?? null,
  };
};

export const getMyFavorites = async(userId: string, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;

    const [favorites, total] = await prisma.$transaction([
        prisma.favorite.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: "desc",
            },
            skip,
            take: limit,
            include: {
                listing: {
                    include: {
                        property: true,
                    },
                },
            },
        }),

        prisma.favorite.count({
            where: {
                userId,
            },
        }),
    ]);

    return {
        favorites,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        }
    }
}
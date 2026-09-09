import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../common/errors/AppError.js";
import { SortOrder } from "../../generated/prisma/internal/prismaNamespace.js";

export async function createMedia(data: {
  propertyId: string;
  type: "IMAGE" | "VIDEO";
  url: string;
  publicId: string;
  title?: string;
  altText?: string;
  sortOrder?: number;
  isPrimary?: boolean;
}) {
  const property = await prisma.property.findUnique({
    where: {
      id: data.propertyId,
    },
  });

  if (!property) {
    throw new AppError("Property not found", 404);
  }

  if (property.deletedAt) {
    throw new AppError("This property has been deleted", 400);
  }

  if (data.isPrimary) {
    await prisma.media.updateMany({
      where: {
        propertyId: data.propertyId,
        isPrimary: true,
        deletedAt: null,
      },
      data: {
        isPrimary: false,
      },
    });
  }

  const media = await prisma.media.create({
    data: {
      propertyId: data.propertyId,
      type: data.type,
      url: data.url,
      publicId: data.publicId,
      title: data.title,
      altText: data.altText,
      sortOrder: data.sortOrder ?? 0,
      isPrimary: data.isPrimary ?? false,
    },
  });

  return media;
}

export async function getPropertyMedia(propertyId: string) {
  const property = await prisma.property.findUnique({
    where: {
      id: propertyId,
    },
    select: {
      id: true,
    },
  });

  if (!property) {
    throw new AppError("Property not found", 404);
  }

  const media = await prisma.media.findMany({
    where: {
      propertyId,
      deletedAt: null,
    },
    orderBy: [
      {
        sortOrder: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
  });

  return media;
}

export async function getMediaById(mediaId: string) {
  const media = await prisma.media.findUnique({
    where: {
      id: mediaId,
    },
  });

  if (!media || media.deletedAt) {
    throw new AppError("Media not found", 404);
  }

  return media;
}

export async function updateMedia(
  mediaId: string,
  data: {
    title?: string;
    altText?: string;
    sortOrder?: number;
    isPrimary?: boolean;
  }
) {
  const media = await prisma.media.findUnique({
    where: {
      id: mediaId,
    },
  });
  
  if(!media || media.deletedAt) {
    throw new AppError("Media not found", 404);
  }

  if(data.isPrimary === true){
    await prisma.$transaction([
      prisma.media.updateMany({
        where: {
          id: {
            not: mediaId,
          },
          isPrimary: true,
          deletedAt: null,
        },
        data: {
          isPrimary: false,
        },
      }),
      prisma.media.update({
        where: {
          id: mediaId,
        },
        data,
      }),
    ]);
  } else {
    await prisma.media.update({
      where: {
        id: mediaId,
      },
      data,
    });
  }

  return prisma.media.findUnique({
    where: {
      id: mediaId,
    }
  })

}


export async function deleteMedia(mediaId: string){
  const media = await prisma.media.findUnique({
    where: {
      id: mediaId,
    },
  });

  if(!media || media.deletedAt) {
    throw new AppError("Media not found", 404);
  }

  const deletedMedia = await prisma.media.update({
    where: {
      id: mediaId,
    },
    data: {
      deletedAt: new Date(),
      isPrimary: false,
    },
  });

  return deletedMedia;
}
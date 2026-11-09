import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../common/errors/AppError.js";

import {
  uploadMedia,
  deleteMediaAsset,
} from "../../services/cloudinary.service.js";

function getMediaType(resourceType: string): "IMAGE" | "VIDEO" {
  if (resourceType === "image") {
    return "IMAGE";
  }

  if (resourceType === "video") {
    return "VIDEO";
  }

  throw new AppError("Unsupported Cloudinary resource type", 400);
}

export async function createMedia(data: {
  propertyId: string;
  file: Express.Multer.File;
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

  let uploadResult;

  try {
    uploadResult = await uploadMedia(
      data.file.buffer,
      `giggler-homes/properties/${data.propertyId}`,
    );
  } catch (error) {
    console.error("Cloudinary upload failed: ", error);
    throw new AppError("Failed to upload media", 500);
  }

  try {
    const mediaType = getMediaType(uploadResult.resource_type);

    const media = await prisma.$transaction(async (tx) => {
      if (data.isPrimary === true) {
        await tx.media.updateMany({
          where: {
            propertyId: data.propertyId,
            type: mediaType,
            isPrimary: true,
            deletedAt: null,
          },
          data: {
            isPrimary: false,
          },
        });
      }

      return tx.media.create({
        data: {
          propertyId: data.propertyId,
          type: mediaType,
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          title: data.title,
          altText: data.altText,
          sortOrder: data.sortOrder ?? 0,
          isPrimary: data.isPrimary ?? false,
        },
      });
    });

    return media;
  } catch (error) {
    try {
      await deleteMediaAsset(
        uploadResult.public_id,
        uploadResult.resource_type === "video" ? "video" : "image",
      );
    } catch (cleanupError) {
      console.error(
        "Failed to clean up Cloudinary asset after database failure",
        cleanupError,
      );
    }

    throw error;
  }
}

export async function getPropertyMedia(propertyId: string) {
  const property = await prisma.property.findUnique({
    where: {
      id: propertyId,
    },
    select: {
      id: true,
      deletedAt: true,
    },
  });

  if (!property) {
    throw new AppError("Property not found", 404);
  }

  if (property.deletedAt) {
    throw new AppError("This property has been deleted", 400);
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
  },
) {
  const media = await prisma.media.findUnique({
    where: {
      id: mediaId,
    },
  });

  if (!media || media.deletedAt) {
    throw new AppError("Media not found", 404);
  }

  if (data.isPrimary === true) {
    await prisma.$transaction([
      prisma.media.updateMany({
        where: {
          propertyId: media.propertyId,
          type: media.type,
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
    },
  });
}

export async function deleteMedia(mediaId: string) {
  const media = await prisma.media.findUnique({
    where: {
      id: mediaId,
    },
  });

  if (!media || media.deletedAt) {
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

export async function restoreMedia(mediaId: string) {
  const media = await prisma.media.findUnique({
    where: {
      id: mediaId,
    },
    include: {
      property: {
        select: {
          id: true,
          deletedAt: true,
        },
      },
    },
  });

  if (!media) {
    throw new AppError("Media not found", 404);
  }

  if (!media.deletedAt) {
    throw new AppError("Media is already active", 400);
  }

  if (media.property.deletedAt) {
    throw new AppError(
      "Cannot restore media belonging to a deleted property",
      400,
    );
  }

  return prisma.media.update({
    where: {
      id: mediaId,
    },
    data: {
      deletedAt: null,
      isPrimary: false,
    },
  });
}
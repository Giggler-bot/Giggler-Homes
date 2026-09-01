import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../common/errors/AppError.js";

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

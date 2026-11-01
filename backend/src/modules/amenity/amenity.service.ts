import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../common/errors/AppError.js";

import { Prisma } from "../../generated/prisma/client.js";

export async function createAmenity(data: {
  name: string;
  icon?: string;
  category?:
    | "SECURITY"
    | "UTILITIES"
    | "COMFORT"
    | "OUTDOOR"
    | "PARKING"
    | "CONNECTIVITY";
}) {
  const existingAmenity = await prisma.amenity.findFirst({
    where: {
      name: {
        equals: data.name,
        mode: "insensitive",
      },
    },
  });

  if (existingAmenity) {
    throw new AppError("Amenity already exists", 409);
  }

  return prisma.amenity.create({
    data: {
      name: data.name,
      icon: data.icon,
      category: data.category,
    },
  });
}

export async function getAmenities(
  category?:
    | "SECURITY"
    | "UTILITIES"
    | "COMFORT"
    | "OUTDOOR"
    | "PARKING"
    | "CONNECTIVITY",
) {
  return prisma.amenity.findMany({
    where: {
      deletedAt: null,
      ...(category ? { category } : {}),
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getAmenityById(id: string) {
  const amenity = await prisma.amenity.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!amenity) {
    throw new AppError("Amenity not found", 404);
  }

  return amenity;
}

export async function updateAmenity(
  id: string,
  data: {
    name?: string;
    icon?: string;
    category?:
      | "SECURITY"
      | "UTILITIES"
      | "COMFORT"
      | "OUTDOOR"
      | "PARKING"
      | "CONNECTIVITY";
  },
) {
  const amenity = await prisma.amenity.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!amenity) {
    throw new AppError("Amenity not found", 404);
  }

  if (data.name && data.name.toLowerCase() !== amenity.name.toLowerCase()) {
    const existingAmenity = await prisma.amenity.findFirst({
      where: {
        name: {
          equals: data.name,
          mode: "insensitive",
        },
      },
    });

    if (existingAmenity) {
      throw new AppError("Amenity name already exists", 409);
    }
  }

  try {
    return await prisma.amenity.update({
      where: {
        id,
      },
      data,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError("Amenity name already exists", 409);
    }

    throw error;
  }
}

export async function deleteAmenity(id: string) {
  const amenity = await prisma.amenity.findFirst({
    where: {
      id,
      deletedAt: null,
    },
  });

  if (!amenity) {
    throw new AppError("Amenity not found", 404);
  }

  return prisma.amenity.update({
    where: {
      id,
    },
    data: {
      deletedAt: new Date(),
    },
  });
}

export async function reactivateAmenity(amenityId: string) {
  const amenity = await prisma.amenity.findUnique({
    where: {
      id: amenityId,
    },
  });

  if (!amenity) {
    throw new AppError("Amenity not found", 404);
  }

  if (!amenity.deletedAt) {
    throw new AppError("Amenity is already active", 409);
  }

  const existingAmenity = await prisma.amenity.findFirst({
    where: {
      id: {
        not: amenityId,
      },
      name: {
        equals: amenity.name,
        mode: "insensitive",
      },
    },
  });

  if (existingAmenity) {
    throw new AppError("Amenity name already exists", 409);
  }

  try {
    return await prisma.amenity.update({
      where: {
        id: amenityId,
      },
      data: {
        deletedAt: null,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError("Amenity name already exists", 409);
    }

    throw error;
  }
}

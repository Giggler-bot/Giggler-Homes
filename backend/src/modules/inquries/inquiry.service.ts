import { InquiryStatus } from "../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../common/errors/AppError.js";
import { Prisma } from "../../generated/prisma/client.js";

export const createInquiry = async (
  listingId: string,
  senderId: string,
  message: string,
) => {
  const listing = await prisma.listing.findUnique({
    where: {
      id: listingId,
    },
    include: {
      property: {
        select: {
          ownerId: true,
        },
      },
    },
  });

  if (!listing) {
    throw new AppError("Listing not found", 404);
  }

  if (listing.status !== "ACTIVE") {
    throw new AppError("Inquiries can only be sent for active listings", 404);
  }

  const ownerId = listing.property.ownerId;

  if (ownerId === senderId) {
    throw new AppError(
      "You cannot send an inquiry about your own listing",
      403,
    );
  }

  const existingInquiry = await prisma.inquiry.findFirst({
    where: {
      listingId,
      senderId,
      status: InquiryStatus.OPEN,
    },
  });

  if (existingInquiry) {
    throw new AppError(
      "You already have an open inquiry for this listing",
      409,
    );
  }

  try {
    return await prisma.inquiry.create({
      data: {
        listingId,
        senderId,
        ownerId,
        message,
      },
      include: {
        listing: {
          select: {
            id: true,
            listingType: true,
            price: true,
          },
        },
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError(
        "You already have an open inquiry for this listing",
        409,
      );
    }

    throw error;
  }
};

export const getSentInquiries = async (
  senderId: string,
  page: number,
  limit: number,
  status?: InquiryStatus,
) => {
  const skip = (page - 1) * limit;

  const where = {
    senderId,
    ...(status ? { status } : {}),
  };

  const [inquiries, total] = await prisma.$transaction([
    prisma.inquiry.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "asc",
      },
      include: {
        listing: {
          select: {
            id: true,
            listingType: true,
            price: true,
          },
        },
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    }),

    prisma.inquiry.count({
      where,
    }),
  ]);

  return {
    inquiries,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getReceivedInquiries = async (
  ownerId: string,
  page: number,
  limit: number,
  status?: InquiryStatus,
) => {
  const skip = (page - 1) * limit;

  const where = {
    ownerId,
    ...(status ? { status } : {}),
  };

  const [inquiries, total] = await prisma.$transaction([
    prisma.inquiry.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        listing: {
          select: {
            id: true,
            listingType: true,
            price: true,
          },
        },
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    }),

    prisma.inquiry.count({
      where,
    }),
  ]);

  return {
    inquiries,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getInquiryById = async (
  inquiryId: string,
  userId: string,
  isAdmin: boolean,
) => {
  const inquiry = await prisma.inquiry.findUnique({
    where: {
      id: inquiryId,
    },
    include: {
      listing: {
        select: {
          id: true,
          listingType: true,
          price: true,
        },
      },
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  if (!inquiry) {
    throw new AppError("Inquiry not found", 404);
  }

  if (!isAdmin && inquiry.senderId !== userId && inquiry.ownerId !== userId) {
    throw new AppError("You are not authorized to view this inquiry", 403);
  }

  return inquiry;
};

export const respondToInquiry = async (
  inquiryId: string,
  userId: string,
  isAdmin: boolean,
) => {
  const inquiry = await prisma.inquiry.findUnique({
    where: {
      id: inquiryId,
    },
  });

  if (!inquiry) {
    throw new AppError("Inquiry not found", 404);
  }

  if (!isAdmin && inquiry.ownerId !== userId) {
    throw new AppError(
      "You are not authorized to respond to this inquiry",
      403,
    );
  }

  if (inquiry.status !== InquiryStatus.OPEN) {
    throw new AppError("Only opened inquiries can be marked as responded", 409);
  }

  return prisma.inquiry.update({
    where: {
      id: inquiryId,
    },
    data: {
      status: InquiryStatus.RESPONDED,
      respondedAt: new Date(),
    },
  });
};

export const closeInquiry = async (
  inquiryId: string,
  userId: string,
  isAdmin: boolean,
) => {
  const inquiry = await prisma.inquiry.findUnique({
    where: {
      id: inquiryId,
    },
  });

  if (!inquiry) {
    throw new AppError("Inquiry not found", 404);
  }

  if (!isAdmin && inquiry.senderId !== userId && inquiry.ownerId !== userId) {
    throw new AppError("You are not authorized to close this inquiry", 403);
  }

  if (inquiry.status === InquiryStatus.CLOSED) {
    throw new AppError("Inquiry is already closed", 409);
  }

  return prisma.inquiry.update({
    where: {
      id: inquiryId,
    },
    data: {
      status: InquiryStatus.CLOSED,
      closedAt: new Date(),
    },
  });
};

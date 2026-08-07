import { prisma } from "../../src/lib/prisma"
import { GhanaRegion } from "../../src/generated/prisma/client";

import { generateSlug } from "../../src/common/utils/slug";

export async function seedLocation() {
  const regions = [
    GhanaRegion.GREATER_ACCRA,
    GhanaRegion.ASHANTI,
    GhanaRegion.CENTRAL,
    GhanaRegion.EASTERN,
    GhanaRegion.WESTERN,
    GhanaRegion.WESTERN_NORTH,
    GhanaRegion.VOLTA,
    GhanaRegion.OTI,
    GhanaRegion.NORTHERN,
    GhanaRegion.NORTH_EAST,
    GhanaRegion.SAVANNAH,
    GhanaRegion.UPPER_EAST,
    GhanaRegion.UPPER_WEST,
    GhanaRegion.BONO,
    GhanaRegion.BONO_EAST,
    GhanaRegion.AHAFO,
  ];

  for (const region of regions) {
    await prisma.location.upsert({
      where: {
        slug: generateSlug(region),
      },
      update: {},
      create: {
        region,
        slug: generateSlug(region),
      },
    });
  }

  console.log("✅ Locations");
}

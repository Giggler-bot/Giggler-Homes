import { prisma } from "../../src/lib/prisma"

export async function seedPropertyTypes() {
  const residential = await prisma.propertyCategory.findUnique({
    where: {
      name: "Residential",
    },
  });

  const commercial = await prisma.propertyCategory.findUnique({
    where: {
      name: "Commercial",
    },
  });

  const hospitality = await prisma.propertyCategory.findUnique({
    where: {
      name: "Hospitality",
    },
  });
  const land = await prisma.propertyCategory.findUnique({
    where: {
      name: "Land",
    },
  });

  if (!residential || !commercial || !hospitality || !land) {
    throw new Error("Property categories must be seeded first.");
  }

  const propertyTypes = [
    // Residential
    ["Apartment", residential.id],
    ["Studio Apartment", residential.id],
    ["Self Contained", residential.id],
    ["Chamber & Hall", residential.id],
    ["Detached House", residential.id],
    ["Semi Detached House", residential.id],
    ["Townhouse", residential.id],
    ["Villa", residential.id],

    // Commercial
    ["Office", commercial.id],
    ["Shop", commercial.id],
    ["Warehouse", commercial.id],
    ["Factory", commercial.id],

    // Hospitality
    ["Hotel", hospitality.id],
    ["Guest House", hospitality.id],
    ["Hostel", hospitality.id],
    ["Resort", hospitality.id],

    // Land
    ["Residential Land", land.id],
    ["Commercial Land", land.id],
    ["Farm Land", land.id],
  ];

  for (const [name, categoryId] of propertyTypes) {
    await prisma.propertyType.upsert({
      where: {
        categoryId_name: {
          categoryId,
          name,
        },
      },
      update: {},
      create: {
        name,
        categoryId,
      },
    });
  }

  console.log("✅ Property types seeded.")
}

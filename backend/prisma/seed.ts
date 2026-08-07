import { prisma } from "../src/lib/prisma";

import { seedPropertyCategories } from "./seeds/property-category.seed";
import { seedPropertyTypes } from "./seeds/property-type.seed";
import { seedLocation } from "./seeds/location.seed";


async function main() {
  console.log("🌱 Seeding database...");

  await seedPropertyCategories();
  await seedPropertyTypes();
  await seedLocation();

  console.log("✅ Database seeding completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

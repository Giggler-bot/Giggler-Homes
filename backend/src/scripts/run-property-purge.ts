
import { prisma } from "../lib/prisma.js";
import { purgeExpiredProperties } from "../modules/properties/property-cleanup.service.js";

async function main() {
  const result = await purgeExpiredProperties();
  console.log("Property purge result:", result);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

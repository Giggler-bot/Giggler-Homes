import { prisma } from "../lib/prisma.js";

const propertyId = "6cbed7db-aba7-4be6-a2b7-ebee6188f949";

async function main() {
  const property = await prisma.property.update({
    where: { id: propertyId },
    data: {
      permanentDeletionAt: new Date(Date.now() - 60_000),
    },
    select: {
      id: true,
      deletedAt: true,
      permanentDeletionAt: true,
    },
  });

  console.log("Test property expired:", property);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });

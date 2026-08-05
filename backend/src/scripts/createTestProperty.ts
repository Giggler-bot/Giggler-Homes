import { prisma } from "../lib/prisma.js";

async function main() {
  const ownerId = "7c3a5b54-6ee2-4253-b33b-862e76adc993";

  const property = await prisma.property.create({
    data: {
      ownerId,
      title: "Test Property for Ownership Authorization",
    },
  });

  console.log("Test property created:");
  console.log(property);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
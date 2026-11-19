import { prisma } from "../lib/prisma.js";

async function main() {
  const record = await prisma.mediaAssetCleanup.create({
    data: {
      publicId: "giggler-homes/__cleanup_retry_test__",
      resourceType: "IMAGE",
    },
  });

  console.log("Retry test record created:", record);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
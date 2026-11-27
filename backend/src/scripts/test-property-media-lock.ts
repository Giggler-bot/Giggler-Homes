
import { prisma } from "../lib/prisma.js";

const PROPERTY_ID = "3920feb2-4a52-48eb-8d25-d62c08c8a719";

function createDeferred() {
  let resolve!: () => void;

  const promise = new Promise<void>((res) => {
    resolve = res;
  });

  return { promise, resolve };
}

async function main() {
  const property = await prisma.property.findUnique({
    where: { id: PROPERTY_ID },
    select: {
      id: true,
      deletedAt: true,
      permanentDeletionAt: true,
    },
  });

  if (!property) {
    throw new Error("Test property does not exist.");
  }

  if (property.deletedAt || property.permanentDeletionAt) {
    throw new Error("Test property is not active. Aborting.");
  }

  const lockAcquired = createDeferred();
  const releaseFirstTransaction = createDeferred();

  const firstTransaction = prisma.$transaction(async (tx) => {
    await tx.$queryRaw`
      SELECT "id"
      FROM "Property"
      WHERE "id" = ${PROPERTY_ID}
      FOR UPDATE
    `;

    lockAcquired.resolve();

    await releaseFirstTransaction.promise;
  });

  try {
    await lockAcquired.promise;

    const secondTransaction = prisma.$transaction(async (tx) => {
      await tx.property.updateMany({
        where: {
          id: PROPERTY_ID,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    });

    // Give the second transaction time to attempt its update.
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const stillActive = await prisma.property.findUnique({
      where: { id: PROPERTY_ID },
      select: { deletedAt: true },
    });

    if (!stillActive || stillActive.deletedAt !== null) {
      throw new Error(
        "Expected the second transaction to wait for the row lock.",
      );
    }

    console.log("PASS: Property update is blocked by the row lock.");

    releaseFirstTransaction.resolve();

    await Promise.all([firstTransaction, secondTransaction]);

    const finalProperty = await prisma.property.findUnique({
      where: { id: PROPERTY_ID },
      select: { deletedAt: true },
    });

    if (!finalProperty?.deletedAt) {
      throw new Error("Expected the second transaction to complete.");
    }

    console.log("PASS: Property update completed after lock release.");
  } finally {
    releaseFirstTransaction.resolve();

    await firstTransaction.catch(() => undefined);

    // Restore the test property's original active state.
    await prisma.property.update({
      where: { id: PROPERTY_ID },
      data: {
        deletedAt: null,
        permanentDeletionAt: null,
      },
    });

    console.log("Test property restored to its original state.");
  }
}

main()
  .catch((error) => {
    console.error("Concurrency test failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

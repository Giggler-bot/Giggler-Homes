
import { prisma } from "../lib/prisma.js";
import { createMedia } from "../modules/media/media.service.js";
import { deleteMediaAsset } from "../services/cloudinary.service.js";
import { softDeleteProperty } from "../modules/properties/property.service.js";

const PROPERTY_ID = "3920feb2-4a52-48eb-8d25-d62c08c8a719";

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function createSignal() {
  let resolve!: () => void;

  const promise = new Promise<void>((res) => {
    resolve = res;
  });

  return { promise, resolve };
}

async function waitForBlockedQuery(
  blockerPid: number,
  queryPattern: string,
  timeoutMs = 30000,
): Promise<number> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const result = await prisma.$queryRaw<
      Array<{ pid: number }>
    >`
      SELECT pid
      FROM pg_stat_activity
      WHERE wait_event_type = 'Lock'
        AND query ILIKE ${queryPattern}
        AND pg_blocking_pids(pid) @> ARRAY[${blockerPid}]::int[]
      LIMIT 1
    `;

    if (result.length > 0) {
      return result[0].pid;
    }

    await sleep(100);
  }

  throw new Error(
    `Timed out waiting for a blocked query: ${queryPattern}`,
  );
}

async function waitForBackendLock(
  backendPid: number,
  timeoutMs = 30000,
) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const result = await prisma.$queryRaw<
      Array<{ waiting: boolean }>
    >`
      SELECT cardinality(pg_blocking_pids(${backendPid})) > 0
        AS waiting
    `;

    if (result[0]?.waiting) return;

    await sleep(100);
  }

  throw new Error(`Backend ${backendPid} did not become blocked.`);
}

async function main() {
  const originalProperty = await prisma.property.findUnique({
    where: { id: PROPERTY_ID },
    select: {
      id: true,
      deletedAt: true,
      permanentDeletionAt: true,
    },
  });

  if (!originalProperty) {
    throw new Error("Test property does not exist.");
  }

  if (originalProperty.deletedAt || originalProperty.permanentDeletionAt) {
    throw new Error("Test property is not active. Aborting.");
  }

  const originalMedia = await prisma.media.findMany({
    where: { propertyId: PROPERTY_ID },
    select: { id: true },
  });

  const originalMediaIds = new Set(
    originalMedia.map((media) => media.id),
  );

  const lockAcquired = createSignal();
  const releaseLock = createSignal();

  let lockHolder: Promise<void> | undefined;
  let lockHolderPid: number | undefined;
  let deletionTransaction: Promise<unknown> | undefined;

  let mediaOutcome:
    | Promise<
        | {
            success: true;
            value: Awaited<ReturnType<typeof createMedia>>;
          }
        | { success: false; error: unknown }
      >
    | undefined;

  try {
    // Transaction 1: acquire and hold the property row lock.
    lockHolder = prisma.$transaction(
      async (tx) => {
        const [backend] = await tx.$queryRaw<
          Array<{ pid: number }>
        >`
          SELECT pg_backend_pid() AS pid
        `;

        await tx.$queryRaw`
          SELECT "id"
          FROM "Property"
          WHERE "id" = ${PROPERTY_ID}
          FOR UPDATE
        `;

        lockHolderPid = backend.pid;

        // Signal only after the property lock has been acquired.
        lockAcquired.resolve();

        await releaseLock.promise;
      },
      { timeout: 30000 },
    );

    await lockAcquired.promise;

    // Start media creation while the first transaction holds the lock.
    const imageBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p5sAAAAASUVORK5CYII=",
      "base64",
    );

    const mediaCreation = createMedia({
      propertyId: PROPERTY_ID,
      file: {
        fieldname: "file",
        originalname: "concurrency-test-success.png",
        encoding: "7bit",
        mimetype: "image/png",
        buffer: imageBuffer,
        size: imageBuffer.length,
      } as Express.Multer.File,
    });

    mediaOutcome = mediaCreation.then(
      (value) => ({ success: true as const, value }),
      (error) => ({ success: false as const, error }),
    );

    console.log("Waiting for media creation to reach the property lock...");

    // Identify the media transaction waiting behind our lock holder.
    if (lockHolderPid === undefined) {
      throw new Error("Could not identify the lock-holder backend.");
    }

    const mediaPid = await waitForBlockedQuery(
      lockHolderPid,
      "%FOR UPDATE%",
    );

    console.log("PASS: Media creation is waiting for the property lock.");

    // Queue property deletion AFTER media creation is waiting.
   deletionTransaction = softDeleteProperty(PROPERTY_ID);

    // Wait until deletion is blocked behind media creation.
    const deletionPid = await waitForBlockedQuery(
      mediaPid,
      "%UPDATE%",
    );

    await waitForBackendLock(deletionPid);

    console.log("PASS: Property deletion is waiting behind media creation.");

    // Release the original property lock.
    releaseLock.resolve();

    await lockHolder;

    const outcome = await mediaOutcome;

    if (!outcome.success) {
      throw outcome.error;
    }

    console.log("PASS: Media creation committed successfully.");

    // Deletion should now be able to proceed.
    await deletionTransaction;

    console.log("PASS: Property deletion completed.");

    const propertyAfterRace = await prisma.property.findUnique({
      where: { id: PROPERTY_ID },
      select: { deletedAt: true },
    });

    if (!propertyAfterRace?.deletedAt) {
      throw new Error("Expected the property to be soft-deleted.");
    }

    const persistedMedia = await prisma.media.findUnique({
      where: { id: outcome.value.id },
    });

    if (!persistedMedia) {
      throw new Error("Media record was not preserved.");
    }

    if (persistedMedia.deletedAt) {
      throw new Error("Media record was unexpectedly soft-deleted.");
    }

    console.log("PASS: Media record remains intact after property deletion.");

    const mediaAfterRace = await prisma.media.findMany({
      where: { propertyId: PROPERTY_ID },
      select: { id: true },
    });

    const unexpectedMedia = mediaAfterRace.filter(
      (media) => !originalMediaIds.has(media.id),
    );

    if (unexpectedMedia.length !== 1) {
      throw new Error("Unexpected number of new Media records.");
    }

    console.log("PASS: Exactly one new Media record was created.");
  } finally {
    releaseLock.resolve();

    await lockHolder?.catch(() => undefined);
    await deletionTransaction?.catch(() => undefined);

    if (mediaOutcome) {
      const outcome = await mediaOutcome;

      if (outcome.success) {
        // Restore the property before cleaning up the test media.
        await prisma.property.update({
          where: { id: PROPERTY_ID },
          data: {
            deletedAt: originalProperty.deletedAt,
            permanentDeletionAt: originalProperty.permanentDeletionAt,
          },
        });

        try {
          await deleteMediaAsset(outcome.value.publicId, "image");

          await prisma.media.delete({
            where: { id: outcome.value.id },
          });

          console.log("Test Cloudinary asset and Media record cleaned up.");
        } catch (cleanupError) {
          console.error(
            "Test media cleanup failed. Preserve its Media record for manual cleanup:",
            cleanupError,
          );
        }
      } else {
        await prisma.property.update({
          where: { id: PROPERTY_ID },
          data: {
            deletedAt: originalProperty.deletedAt,
            permanentDeletionAt: originalProperty.permanentDeletionAt,
          },
        });
      }
    } else {
      await prisma.property.update({
        where: { id: PROPERTY_ID },
        data: {
          deletedAt: originalProperty.deletedAt,
          permanentDeletionAt: originalProperty.permanentDeletionAt,
        },
      });
    }

    console.log("Test property restored.");
  }
}

main()
  .catch((error) => {
    console.error("Media-first race test failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

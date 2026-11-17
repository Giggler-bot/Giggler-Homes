
import { prisma } from "../lib/prisma.js";
import { encryptVerificationNumber } from "../common/security/verificationEncryption.js";

async function main() {
  console.log("Starting identity number encryption backfill...");

  const records = await prisma.userVerification.findMany({
    select: {
      id: true,
      idNumber: true,
    },
  });

  let encryptedCount = 0;
  let skippedCount = 0;

  for (const record of records) {
    if (record.idNumber.startsWith("enc:v1:")) {
      skippedCount++;
      continue;
    }

    const encryptedNumber = encryptVerificationNumber(record.idNumber);

    await prisma.userVerification.update({
      where: { id: record.id },
      data: { idNumber: encryptedNumber },
    });

    encryptedCount++;
  }

  console.log("Backfill completed.");
  console.log(`Total records: ${records.length}`);
  console.log(`Encrypted: ${encryptedCount}`);
  console.log(`Skipped: ${skippedCount}`);
}

main()
  .catch((error) => {
    console.error("Identity number encryption backfill failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


  
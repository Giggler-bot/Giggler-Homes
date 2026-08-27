-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "title" TEXT,
    "altText" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAT" TIMESTAMP(3) NOT NULL,
    "deleatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Media_propertyId_idx" ON "Media"("propertyId");

-- CreateIndex
CREATE INDEX "Media_type_idx" ON "Media"("type");

-- CreateIndex
CREATE INDEX "Media_isPrimary_idx" ON "Media"("isPrimary");

-- CreateIndex
CREATE INDEX "Media_deleatedAt_idx" ON "Media"("deleatedAt");

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Property` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationId` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `propertyTypeId` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Property` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GhanaRegion" AS ENUM ('GREATER_ACCRA', 'ASHANTI', 'CENTRAL', 'EASTERN', 'WESTERN', 'WESTERN_NORTH', 'VOLTA', 'OTI', 'NORTHERN', 'NORTH_EAST', 'SAVANNAH', 'UPPER_EAST', 'UPPER_WEST', 'BONO', 'BONO_EAST', 'AHAFO');

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "bathrooms" INTEGER,
ADD COLUMN     "bedrooms" INTEGER,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFurnished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "locationId" TEXT NOT NULL,
ADD COLUMN     "parkingSpaces" INTEGER,
ADD COLUMN     "propertyTypeId" TEXT NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "squareMeters" DOUBLE PRECISION,
ADD COLUMN     "toilets" INTEGER,
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "yearBuilt" INTEGER;

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "region" "GhanaRegion" NOT NULL,
    "district" TEXT,
    "area" TEXT,
    "landmark" TEXT,
    "slug" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyType" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Location_slug_key" ON "Location"("slug");

-- CreateIndex
CREATE INDEX "Location_region_district_area_idx" ON "Location"("region", "district", "area");

-- CreateIndex
CREATE UNIQUE INDEX "Location_region_district_area_key" ON "Location"("region", "district", "area");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyCategory_name_key" ON "PropertyCategory"("name");

-- CreateIndex
CREATE INDEX "PropertyCategory_name_idx" ON "PropertyCategory"("name");

-- CreateIndex
CREATE INDEX "PropertyType_categoryId_idx" ON "PropertyType"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyType_categoryId_name_key" ON "PropertyType"("categoryId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Property_slug_key" ON "Property"("slug");

-- AddForeignKey
ALTER TABLE "PropertyType" ADD CONSTRAINT "PropertyType_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PropertyCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

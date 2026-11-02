-- Enforce one active primary image per property
CREATE UNIQUE INDEX "Media_one_primary_image_per_property_key"
ON "Media" ("propertyId")
WHERE "type" = 'IMAGE'
  AND "isPrimary" = true
  AND "deletedAt" IS NULL;

-- Enforce one active primary video per property
CREATE UNIQUE INDEX "Media_one_primary_video_per_property_key"
ON "Media" ("propertyId")
WHERE "type" = 'VIDEO'
  AND "isPrimary" = true
  AND "deletedAt" IS NULL;
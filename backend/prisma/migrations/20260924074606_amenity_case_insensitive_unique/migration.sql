-- This is an empty migration.
CREATE UNIQUE INDEX "Amenity_name_lower_key"
ON "Amenity" (LOWER("name"));
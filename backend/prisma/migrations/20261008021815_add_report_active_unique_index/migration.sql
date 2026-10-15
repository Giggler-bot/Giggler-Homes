-- This is an empty migration.
CREATE UNIQUE INDEX "Report_active_reporter_listing_key"
ON "Report"("reporterId", "listingId")
WHERE "status" IN ('PENDING', 'UNDER_REVIEW');
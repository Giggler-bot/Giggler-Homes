-- This is an empty migration.
CREATE UNIQUE INDEX "Inquiry_open_sender_listing_key"
ON "Inquiry"("senderId", "listingId")
WHERE "status" = 'OPEN';
ALTER TABLE "adult_listings" ADD COLUMN "isPhoneVisible" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "adult_listings" ADD COLUMN "revealCode" TEXT;
ALTER TABLE "adult_listings" ADD COLUMN "codeExpiresAt" TIMESTAMP(3);
CREATE UNIQUE INDEX "adult_listings_revealCode_key" ON "adult_listings"("revealCode");

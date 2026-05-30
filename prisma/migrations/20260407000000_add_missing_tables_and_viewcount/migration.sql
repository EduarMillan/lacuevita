-- AlterTable: add code to listings
ALTER TABLE "listings" ADD COLUMN IF NOT EXISTS "code" TEXT;
UPDATE "listings" SET "code" = 'FDP-' || SUBSTRING("id" FROM 1 FOR 6) WHERE "code" IS NULL;
ALTER TABLE "listings" ALTER COLUMN "code" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "listings_code_key" ON "listings"("code");

-- Fix listings index: replace old with composite
DROP INDEX IF EXISTS "listings_status_createdAt_idx";
CREATE INDEX IF NOT EXISTS "listings_status_isFeatured_createdAt_idx" ON "listings"("status", "isFeatured", "createdAt" DESC);

-- CreateTable: professionals
CREATE TABLE "professionals" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "yearsExperience" INTEGER NOT NULL DEFAULT 0,
    "location" TEXT NOT NULL,
    "region" TEXT,
    "comuna" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "professionals_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "professionals_slug_key" ON "professionals"("slug");
CREATE INDEX "professionals_userId_idx" ON "professionals"("userId");
CREATE INDEX "professionals_categoryId_idx" ON "professionals"("categoryId");
CREATE INDEX "professionals_isActive_createdAt_idx" ON "professionals"("isActive", "createdAt" DESC);
CREATE INDEX "professionals_location_idx" ON "professionals"("location");
CREATE INDEX "professionals_region_comuna_idx" ON "professionals"("region", "comuna");

ALTER TABLE "professionals" ADD CONSTRAINT "professionals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "professionals" ADD CONSTRAINT "professionals_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable: offers
CREATE TABLE "offers" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "comuna" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "imageUrl" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "offers_code_key" ON "offers"("code");
CREATE UNIQUE INDEX "offers_slug_key" ON "offers"("slug");
CREATE INDEX "offers_userId_idx" ON "offers"("userId");
CREATE INDEX "offers_expiresAt_idx" ON "offers"("expiresAt");
CREATE INDEX "offers_region_comuna_idx" ON "offers"("region", "comuna");
CREATE INDEX "offers_isFeatured_createdAt_idx" ON "offers"("isFeatured", "createdAt" DESC);

ALTER TABLE "offers" ADD CONSTRAINT "offers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: offer_promotions
CREATE TABLE "offer_promotions" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,0) NOT NULL,
    "note" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offer_promotions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "offer_promotions_offerId_idx" ON "offer_promotions"("offerId");
CREATE INDEX "offer_promotions_endDate_idx" ON "offer_promotions"("endDate");
CREATE INDEX "offer_promotions_isActive_idx" ON "offer_promotions"("isActive");

ALTER TABLE "offer_promotions" ADD CONSTRAINT "offer_promotions_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: banners
CREATE TABLE "banners" (
    "id" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "linkUrl" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,0) NOT NULL,
    "note" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "banners_isActive_endDate_idx" ON "banners"("isActive", "endDate");
CREATE INDEX "banners_position_idx" ON "banners"("position");

-- CreateTable: promotions
CREATE TABLE "promotions" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,0) NOT NULL,
    "note" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "promotions_listingId_idx" ON "promotions"("listingId");
CREATE INDEX "promotions_endDate_idx" ON "promotions"("endDate");
CREATE INDEX "promotions_isActive_idx" ON "promotions"("isActive");

ALTER TABLE "promotions" ADD CONSTRAINT "promotions_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

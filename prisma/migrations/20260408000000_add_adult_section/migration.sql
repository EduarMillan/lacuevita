-- CreateTable: adult_listings
CREATE TABLE "adult_listings" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "region" TEXT,
    "comuna" TEXT,
    "status" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "adult_listings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "adult_listings_code_key" ON "adult_listings"("code");
CREATE UNIQUE INDEX "adult_listings_slug_key" ON "adult_listings"("slug");
CREATE INDEX "adult_listings_userId_idx" ON "adult_listings"("userId");
CREATE INDEX "adult_listings_status_isFeatured_createdAt_idx" ON "adult_listings"("status", "isFeatured", "createdAt" DESC);
CREATE INDEX "adult_listings_region_comuna_idx" ON "adult_listings"("region", "comuna");

ALTER TABLE "adult_listings" ADD CONSTRAINT "adult_listings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: adult_images
CREATE TABLE "adult_images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPresentation" BOOLEAN NOT NULL DEFAULT false,
    "revealCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "adultListingId" TEXT NOT NULL,

    CONSTRAINT "adult_images_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "adult_images_revealCode_key" ON "adult_images"("revealCode");
CREATE INDEX "adult_images_adultListingId_idx" ON "adult_images"("adultListingId");
CREATE INDEX "adult_images_revealCode_idx" ON "adult_images"("revealCode");

ALTER TABLE "adult_images" ADD CONSTRAINT "adult_images_adultListingId_fkey" FOREIGN KEY ("adultListingId") REFERENCES "adult_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: adult_messages
CREATE TABLE "adult_messages" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "adultListingId" TEXT NOT NULL,

    CONSTRAINT "adult_messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "adult_messages_senderId_idx" ON "adult_messages"("senderId");
CREATE INDEX "adult_messages_receiverId_idx" ON "adult_messages"("receiverId");
CREATE INDEX "adult_messages_adultListingId_idx" ON "adult_messages"("adultListingId");

ALTER TABLE "adult_messages" ADD CONSTRAINT "adult_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "adult_messages" ADD CONSTRAINT "adult_messages_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "adult_messages" ADD CONSTRAINT "adult_messages_adultListingId_fkey" FOREIGN KEY ("adultListingId") REFERENCES "adult_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: adult_promotions
CREATE TABLE "adult_promotions" (
    "id" TEXT NOT NULL,
    "adultListingId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,0) NOT NULL,
    "note" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adult_promotions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "adult_promotions_adultListingId_idx" ON "adult_promotions"("adultListingId");
CREATE INDEX "adult_promotions_endDate_idx" ON "adult_promotions"("endDate");
CREATE INDEX "adult_promotions_isActive_idx" ON "adult_promotions"("isActive");

ALTER TABLE "adult_promotions" ADD CONSTRAINT "adult_promotions_adultListingId_fkey" FOREIGN KEY ("adultListingId") REFERENCES "adult_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

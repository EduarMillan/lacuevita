import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET — Detail of an adult listing
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { prisma } = await import("@/lib/db");

  const listing = await prisma.adultListing.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: "asc" } },
    },
  });

  if (!listing || listing.status !== "ACTIVE") {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  // Increment view count
  await prisma.adultListing.update({
    where: { id: listing.id },
    data: { viewCount: { increment: 1 } },
  });

  const hasBlurredImages = listing.images.some((img) => img.isBlurred);

  // Return sanitized data — no userId, whatsapp only if visible
  const sanitized = {
    id: listing.id,
    code: listing.code,
    alias: listing.alias,
    slug: listing.slug,
    title: listing.title,
    description: listing.description,
    serviceType: listing.serviceType,
    location: listing.location,
    region: listing.region,
    isFeatured: listing.isFeatured,
    isPhoneVisible: listing.isPhoneVisible,
    whatsapp: listing.isPhoneVisible ? listing.whatsapp : null,
    hasBlurredImages,
    viewCount: listing.viewCount + 1,
    createdAt: listing.createdAt,
    images: listing.images.map((img) => ({
      id: img.id,
      url: img.url,
      order: img.order,
      isPresentation: img.isPresentation,
      isBlurred: img.isBlurred,
    })),
  };

  return NextResponse.json(sanitized);
}

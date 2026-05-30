import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// DELETE — Delete one of my adult listings
export async function DELETE(request: NextRequest) {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { prisma } = await import("@/lib/db");
  const { listingId } = await request.json();

  if (!listingId) {
    return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  }

  const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
  if (!dbUser) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const listing = await prisma.adultListing.findUnique({
    where: { id: listingId },
    select: { id: true, userId: true },
  });

  if (!listing) {
    return NextResponse.json({ error: "Anuncio no encontrado" }, { status: 404 });
  }

  if (listing.userId !== dbUser.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  await prisma.adultListing.delete({ where: { id: listingId } });

  return NextResponse.json({ deleted: true });
}

// GET — My adult listings (owner view — includes reveal code)
export async function GET() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { prisma } = await import("@/lib/db");

  const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
  if (!dbUser) {
    return NextResponse.json({ listings: [] });
  }

  const listings = await prisma.adultListing.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
    include: {
      images: { orderBy: { order: "asc" } },
      promotions: {
        where: { isActive: true },
        orderBy: { endDate: "desc" },
        take: 1,
      },
    },
  });

  const result = listings.map((l) => ({
    id: l.id,
    code: l.code,
    alias: l.alias,
    slug: l.slug,
    title: l.title,
    serviceType: l.serviceType,
    location: l.location,
    status: l.status,
    isFeatured: l.isFeatured,
    viewCount: l.viewCount,
    createdAt: l.createdAt,
    revealCode: l.revealCode,
    codeExpiresAt: l.codeExpiresAt,
    promotion: l.promotions[0] || null,
    images: l.images.map((img) => ({
      id: img.id,
      url: img.url,
      order: img.order,
      isPresentation: img.isPresentation,
      isBlurred: img.isBlurred,
    })),
  }));

  return NextResponse.json({ listings: result });
}

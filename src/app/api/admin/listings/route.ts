import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function getAdminUser() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return null;
  }
  return user;
}

// GET — List all listings (admin view)
export async function GET(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { prisma } = await import("@/lib/db");
  const { searchParams } = request.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "12", 10)));
  const q = searchParams.get("q")?.trim();
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  const status = searchParams.get("status");

  if (status) {
    where.status = status;
  }

  if (q) {
    where.OR = [
      { code: { contains: q, mode: "insensitive" } },
      { title: { contains: q, mode: "insensitive" } },
      { user: { email: { contains: q, mode: "insensitive" } } },
    ];
  }

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      skip,
      take: limit,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { name: true, slug: true } },
        user: { select: { name: true, email: true } },
        promotions: {
          where: { isActive: true },
          orderBy: { endDate: "desc" },
          take: 1,
        },
      },
    }),
    prisma.listing.count({ where }),
  ]);

  return NextResponse.json({
    listings,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

// DELETE — Remove a listing (admin)
export async function DELETE(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const listingId = searchParams.get("id");

  if (!listingId) {
    return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  }

  const { prisma } = await import("@/lib/db");

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, title: true, code: true },
  });

  if (!listing) {
    return NextResponse.json({ error: "Anuncio no encontrado" }, { status: 404 });
  }

  await prisma.listing.delete({ where: { id: listingId } });

  return NextResponse.json({
    message: `Anuncio ${listing.code} eliminado`,
    deleted: { id: listing.id, code: listing.code, title: listing.title },
  });
}

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function getAdminUser() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) return null;
  return user;
}

// POST — Promote an adult listing
export async function POST(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { prisma } = await import("@/lib/db");
  const { adultListingId, days, amount, note } = await request.json();

  if (!adultListingId || !days || !amount) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const listing = await prisma.adultListing.findUnique({ where: { id: adultListingId } });
  if (!listing) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + parseInt(days));

  await prisma.$transaction([
    prisma.adultPromotion.create({
      data: {
        adultListingId,
        endDate,
        amount: parseFloat(amount),
        note: note || null,
      },
    }),
    prisma.adultListing.update({
      where: { id: adultListingId },
      data: { isFeatured: true },
    }),
  ]);

  return NextResponse.json({ message: "Anuncio destacado", endDate });
}

// DELETE — Remove promotion
export async function DELETE(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const id = request.nextUrl.searchParams.get("adultListingId");
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  const { prisma } = await import("@/lib/db");

  await prisma.$transaction([
    prisma.adultPromotion.updateMany({
      where: { adultListingId: id, isActive: true },
      data: { isActive: false },
    }),
    prisma.adultListing.update({
      where: { id },
      data: { isFeatured: false },
    }),
  ]);

  return NextResponse.json({ message: "Destacado removido" });
}

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// GET — My offers (owner view)
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
    return NextResponse.json({ offers: [] });
  }

  const offers = await prisma.offer.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
    include: {
      promotions: {
        where: { isActive: true },
        orderBy: { endDate: "desc" },
        take: 1,
      },
    },
  });

  return NextResponse.json({ offers });
}

// DELETE — Delete one of my offers
export async function DELETE(request: NextRequest) {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { prisma } = await import("@/lib/db");
  const { offerId } = await request.json();

  if (!offerId) {
    return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  }

  const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
  if (!dbUser) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    select: { id: true, userId: true },
  });

  if (!offer) {
    return NextResponse.json({ error: "Oferta no encontrada" }, { status: 404 });
  }

  if (offer.userId !== dbUser.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  await prisma.offer.delete({ where: { id: offerId } });

  return NextResponse.json({ deleted: true });
}

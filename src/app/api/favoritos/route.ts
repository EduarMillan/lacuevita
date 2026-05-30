import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ favoriteIds: [] });
    }

    const { prisma } = await import("@/lib/db");

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    if (!dbUser) {
      return NextResponse.json({ favoriteIds: [] });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: dbUser.id },
      select: { listingId: true },
    });

    return NextResponse.json({
      favoriteIds: favorites.map((f) => f.listingId),
    });
  } catch (err) {
    console.error("Error fetching favorites:", err);
    return NextResponse.json({ favoriteIds: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { prisma } = await import("@/lib/db");

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const { listingId } = await request.json();

    if (!listingId) {
      return NextResponse.json({ error: "listingId requerido" }, { status: 400 });
    }

    const existing = await prisma.favorite.findUnique({
      where: { userId_listingId: { userId: dbUser.id, listingId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ favorited: false });
    }

    await prisma.favorite.create({
      data: { userId: dbUser.id, listingId },
    });

    return NextResponse.json({ favorited: true });
  } catch (err) {
    console.error("Error toggling favorite:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 },
    );
  }
}

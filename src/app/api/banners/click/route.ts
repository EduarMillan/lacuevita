import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Falta id" }, { status: 400 });

  const { prisma } = await import("@/lib/db");
  await prisma.banner.update({
    where: { id },
    data: { clicks: { increment: 1 } },
  });

  return NextResponse.json({ ok: true });
}

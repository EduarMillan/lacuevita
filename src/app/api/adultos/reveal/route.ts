import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CODE_TTL_MS = 60 * 60 * 1000; // 1 hour

// POST — Verify a reveal code and reveal all blurred images, then regenerate the code
export async function POST(request: NextRequest) {
  const { prisma } = await import("@/lib/db");
  const body = await request.json();
  const { code } = body;

  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Código requerido" }, { status: 400 });
  }

  const normalizedCode = code.trim().toUpperCase();

  const listing = await prisma.adultListing.findUnique({
    where: { revealCode: normalizedCode },
  });

  if (!listing) {
    return NextResponse.json({ error: "Código inválido o ya utilizado" }, { status: 404 });
  }

  // Check expiration
  if (listing.codeExpiresAt && new Date() > listing.codeExpiresAt) {
    return NextResponse.json({ error: "Código expirado. Solicita uno nuevo al anunciante." }, { status: 410 });
  }

  // Generate a new code with new expiration
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let newCode = "";
  for (let attempt = 0; attempt < 10; attempt++) {
    let candidate = "";
    for (let i = 0; i < 8; i++) {
      candidate += chars[Math.floor(Math.random() * chars.length)];
    }
    const exists = await prisma.adultListing.findUnique({ where: { revealCode: candidate } });
    if (!exists) {
      newCode = candidate;
      break;
    }
  }

  if (!newCode) {
    return NextResponse.json({ error: "Error regenerando código" }, { status: 500 });
  }

  // Update with new code and new expiration
  await prisma.adultListing.update({
    where: { id: listing.id },
    data: {
      revealCode: newCode,
      codeExpiresAt: new Date(Date.now() + CODE_TTL_MS),
    },
  });

  return NextResponse.json({
    listingId: listing.id,
    message: "Imágenes reveladas. El código ha sido actualizado.",
  });
}

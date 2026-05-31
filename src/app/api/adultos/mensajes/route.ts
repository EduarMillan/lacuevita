import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// POST — Send a message to an adult listing owner
export async function POST(request: NextRequest) {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión para enviar mensajes" }, { status: 401 });
  }

  const { prisma } = await import("@/lib/db");
  const body = await request.json();
  const { adultListingId, content, senderPhone } = body;

  if (!adultListingId || !content?.trim()) {
    return NextResponse.json({ error: "Mensaje y anuncio requeridos" }, { status: 400 });
  }

  if (!senderPhone?.trim()) {
    return NextResponse.json({ error: "Debes ingresar tu número de WhatsApp" }, { status: 400 });
  }

  if (content.trim().length > 1000) {
    return NextResponse.json({ error: "Mensaje muy largo (máx. 1000 caracteres)" }, { status: 400 });
  }

  const listing = await prisma.adultListing.findUnique({
    where: { id: adultListingId },
    select: { id: true, userId: true, status: true, whatsapp: true, alias: true },
  });

  if (!listing || listing.status !== "ACTIVE") {
    return NextResponse.json({ error: "Anuncio no encontrado" }, { status: 404 });
  }

  // Ensure sender exists in DB
  const sender = await prisma.user.upsert({
    where: { email: user.email! },
    update: {},
    create: {
      email: user.email!,
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email!.split("@")[0],
    },
  });

  if (sender.id === listing.userId) {
    return NextResponse.json({ error: "No puedes enviarte un mensaje a ti mismo" }, { status: 400 });
  }

  const message = await prisma.adultMessage.create({
    data: {
      content: content.trim(),
      senderPhone: senderPhone.trim(),
      senderId: sender.id,
      receiverId: listing.userId,
      adultListingId: listing.id,
    },
  });

  // Build WhatsApp link to publisher so the message reaches them
  let whatsappUrl: string | null = null;
  if (listing.whatsapp) {
    const phone = listing.whatsapp.replace(/\D/g, "");
    const text = encodeURIComponent(
      `Hola ${listing.alias}, te escribo por tu anuncio en Tu Cuevita.\n\nMi mensaje: ${content.trim()}\n\nMi WhatsApp: ${senderPhone.trim()}`
    );
    whatsappUrl = `https://wa.me/${phone}?text=${text}`;
  }

  return NextResponse.json({ message: "Mensaje enviado", id: message.id, whatsappUrl }, { status: 201 });
}

// GET — Get my received messages (for listing owners)
export async function GET(request: NextRequest) {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { prisma } = await import("@/lib/db");

  const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
  if (!dbUser) {
    return NextResponse.json({ messages: [] });
  }

  const page = parseInt(request.nextUrl.searchParams.get("page") || "1");
  const limit = 20;

  const [messages, total] = await Promise.all([
    prisma.adultMessage.findMany({
      where: { receiverId: dbUser.id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        adultListing: { select: { title: true, alias: true, slug: true } },
      },
    }),
    prisma.adultMessage.count({ where: { receiverId: dbUser.id } }),
  ]);

  // Mark as read
  const unreadIds = messages.filter((m) => !m.isRead).map((m) => m.id);
  if (unreadIds.length > 0) {
    await prisma.adultMessage.updateMany({
      where: { id: { in: unreadIds } },
      data: { isRead: true },
    });
  }

  return NextResponse.json({
    messages: messages.map((m) => ({
      id: m.id,
      content: m.content,
      senderPhone: m.senderPhone,
      createdAt: m.createdAt,
      isRead: m.isRead,
      listing: m.adultListing,
    })),
    pagination: { page, total, totalPages: Math.ceil(total / limit) },
  });
}

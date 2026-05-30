import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const VALID_TYPES = new Set([
  "LISTING_FEATURED",
  "OFFER_FEATURED",
  "BANNER",
  "ADULT_FEATURED",
]);
const VALID_CURRENCIES = new Set(["CUP", "USD", "MLC"]);

async function requireAdmin() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) return null;
  return user;
}

// GET /api/admin/pricing — list all plans (active + inactive)
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { prisma } = await import("@/lib/db");
  const plans = await prisma.pricingPlan.findMany({
    orderBy: [{ type: "asc" }, { order: "asc" }, { days: "asc" }],
  });

  return NextResponse.json({ plans });
}

// POST /api/admin/pricing — create a new plan
export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const { type, days, amount, currency = "CUP", label, note, order = 0, isActive = true } = body;

  if (!VALID_TYPES.has(type)) {
    return NextResponse.json({ error: "Tipo de plan inválido" }, { status: 400 });
  }
  if (!VALID_CURRENCIES.has(currency)) {
    return NextResponse.json({ error: "Moneda inválida" }, { status: 400 });
  }
  if (!Number.isInteger(days) || days <= 0) {
    return NextResponse.json({ error: "Días debe ser entero positivo" }, { status: 400 });
  }
  if (typeof amount !== "number" || amount < 0) {
    return NextResponse.json({ error: "Monto inválido" }, { status: 400 });
  }

  const { prisma } = await import("@/lib/db");

  try {
    const plan = await prisma.pricingPlan.create({
      data: { type, days, amount, currency, label, note, order, isActive },
    });
    return NextResponse.json({ plan }, { status: 201 });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe un plan con este tipo y duración" },
        { status: 409 },
      );
    }
    console.error("[admin/pricing POST]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

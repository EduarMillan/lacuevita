import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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

// PUT /api/admin/pricing/[id] — update an existing plan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { days, amount, currency, label, note, order, isActive } = body;

  const data: Record<string, unknown> = {};
  if (days !== undefined) {
    if (!Number.isInteger(days) || days <= 0) {
      return NextResponse.json({ error: "Días inválidos" }, { status: 400 });
    }
    data.days = days;
  }
  if (amount !== undefined) {
    if (typeof amount !== "number" || amount < 0) {
      return NextResponse.json({ error: "Monto inválido" }, { status: 400 });
    }
    data.amount = amount;
  }
  if (currency !== undefined) {
    if (!VALID_CURRENCIES.has(currency)) {
      return NextResponse.json({ error: "Moneda inválida" }, { status: 400 });
    }
    data.currency = currency;
  }
  if (label !== undefined) data.label = label;
  if (note !== undefined) data.note = note;
  if (order !== undefined) data.order = order;
  if (isActive !== undefined) data.isActive = isActive;

  const { prisma } = await import("@/lib/db");

  try {
    const plan = await prisma.pricingPlan.update({ where: { id }, data });
    return NextResponse.json({ plan });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err) {
      if (err.code === "P2025") {
        return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
      }
      if (err.code === "P2002") {
        return NextResponse.json(
          { error: "Ya existe otro plan con esta combinación tipo + días" },
          { status: 409 },
        );
      }
    }
    console.error("[admin/pricing PUT]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

// DELETE /api/admin/pricing/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const { prisma } = await import("@/lib/db");

  try {
    await prisma.pricingPlan.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && err.code === "P2025") {
      return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
    }
    console.error("[admin/pricing DELETE]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

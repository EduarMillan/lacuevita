"use client";

import { useState, useEffect, useCallback } from "react";

type PlanType = "LISTING_FEATURED" | "OFFER_FEATURED" | "BANNER" | "ADULT_FEATURED";

interface Plan {
  id: string;
  type: PlanType;
  days: number;
  amount: string | number; // Decimal serialized as string
  currency: "CUP" | "USD" | "MLC";
  label: string | null;
  note: string | null;
  isActive: boolean;
  order: number;
}

const TYPE_META: Record<
  PlanType,
  { title: string; icon: string; description: string; colorBg: string; colorIcon: string; colorAccent: string }
> = {
  LISTING_FEATURED: {
    title: "Anuncios Destacados",
    icon: "star",
    description: "El anuncio aparece primero en su categoría y en la página principal",
    colorBg: "bg-amber-50/50",
    colorIcon: "bg-amber-100 text-amber-700",
    colorAccent: "text-amber-700",
  },
  OFFER_FEATURED: {
    title: "Ofertas Destacadas",
    icon: "local_offer",
    description: "La oferta aparece primero en la sección de ofertas",
    colorBg: "bg-rose-50/50",
    colorIcon: "bg-rose-100 text-rose-700",
    colorAccent: "text-rose-700",
  },
  ADULT_FEATURED: {
    title: "Anuncios Adultos Destacados",
    icon: "favorite",
    description: "Anuncio +18 destacado en la sección de adultos",
    colorBg: "bg-fuchsia-50/50",
    colorIcon: "bg-fuchsia-100 text-fuchsia-700",
    colorAccent: "text-fuchsia-700",
  },
  BANNER: {
    title: "Banners Publicitarios",
    icon: "ad",
    description: "Banner rotativo visible en la página principal para comercios",
    colorBg: "bg-violet-50/50",
    colorIcon: "bg-violet-100 text-violet-700",
    colorAccent: "text-violet-700",
  },
};

const TYPE_ORDER: PlanType[] = [
  "LISTING_FEATURED",
  "OFFER_FEATURED",
  "ADULT_FEATURED",
  "BANNER",
];

export default function PricingManager() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [addingType, setAddingType] = useState<PlanType | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/pricing");
      if (!res.ok) throw new Error("No autorizado o error de servidor");
      const data = await res.json();
      setPlans(data.plans);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar planes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  async function updatePlan(id: string, patch: Partial<Plan>) {
    setSavingId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/pricing/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar");
      setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, ...data.plan } : p)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setSavingId(null);
    }
  }

  async function deletePlan(id: string) {
    if (!confirm("¿Eliminar este plan? Esta acción no se puede deshacer.")) return;
    setSavingId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/pricing/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar");
      }
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setSavingId(null);
    }
  }

  async function createPlan(type: PlanType, days: number, amount: number, currency: "CUP" | "USD" | "MLC") {
    setError("");
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, days, amount, currency, order: 999 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear plan");
      setPlans((prev) => [...prev, data.plan]);
      setAddingType(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear plan");
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-10 h-10 border-3 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="text-on-surface-variant text-sm mt-3">Cargando planes…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-on-surface-variant">
        Edita los precios y duraciones de cada plan. Los cambios se reflejan en toda la plataforma.
      </p>

      {error && (
        <div className="bg-error/10 border border-error/30 text-error rounded-xl p-3 text-sm">
          {error}
        </div>
      )}

      {TYPE_ORDER.map((type) => {
        const meta = TYPE_META[type];
        const typePlans = plans
          .filter((p) => p.type === type)
          .sort((a, b) => a.order - b.order || a.days - b.days);

        return (
          <div
            key={type}
            className="bg-surface-lowest rounded-2xl p-6 border border-outline-variant/15"
          >
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${meta.colorIcon}`}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {meta.icon}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-on-surface">{meta.title}</h3>
                  <p className="text-xs text-on-surface-variant">{meta.description}</p>
                </div>
              </div>
              <button
                onClick={() => setAddingType(addingType === type ? null : type)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary rounded-lg font-semibold text-xs hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Agregar
              </button>
            </div>

            {typePlans.length === 0 && (
              <p className="text-sm text-on-surface-variant/70 italic px-2 py-4">
                No hay planes activos. Agrega uno con el botón &quot;Agregar&quot;.
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {typePlans.map((plan) => (
                <PlanRow
                  key={plan.id}
                  plan={plan}
                  accentClass={meta.colorAccent}
                  bgClass={meta.colorBg}
                  saving={savingId === plan.id}
                  onUpdate={(patch) => updatePlan(plan.id, patch)}
                  onDelete={() => deletePlan(plan.id)}
                />
              ))}
            </div>

            {addingType === type && (
              <AddPlanForm
                type={type}
                onCancel={() => setAddingType(null)}
                onSubmit={(days, amount, currency) => createPlan(type, days, amount, currency)}
              />
            )}
          </div>
        );
      })}

      <div className="bg-teal-50/50 rounded-2xl p-6 border border-teal-200/30">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-teal-700 mt-0.5">info</span>
          <div className="text-sm text-on-surface-variant space-y-2">
            <p className="font-semibold text-on-surface">Notas generales</p>
            <p>• Los cambios de precio se reflejan en toda la plataforma en máximo 5 minutos (cache).</p>
            <p>• Desactivar un plan lo oculta sin borrarlo — útil para promociones temporales.</p>
            <p>• Los pagos se gestionan manualmente (transferencia, efectivo, etc.).</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanRow({
  plan,
  accentClass,
  bgClass,
  saving,
  onUpdate,
  onDelete,
}: {
  plan: Plan;
  accentClass: string;
  bgClass: string;
  saving: boolean;
  onUpdate: (patch: Partial<Plan>) => void;
  onDelete: () => void;
}) {
  const [days, setDays] = useState(String(plan.days));
  const [amount, setAmount] = useState(String(plan.amount));
  const [currency, setCurrency] = useState<Plan["currency"]>(plan.currency);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setDays(String(plan.days));
    setAmount(String(plan.amount));
    setCurrency(plan.currency);
    setDirty(false);
  }, [plan.days, plan.amount, plan.currency]);

  function save() {
    const d = parseInt(days, 10);
    const a = parseFloat(amount);
    if (!Number.isInteger(d) || d <= 0) return alert("Días debe ser entero positivo");
    if (Number.isNaN(a) || a < 0) return alert("Monto inválido");
    onUpdate({ days: d, amount: a, currency });
  }

  return (
    <div className={`rounded-xl p-4 ${bgClass} relative ${!plan.isActive ? "opacity-50" : ""}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            value={days}
            onChange={(e) => {
              setDays(e.target.value);
              setDirty(true);
            }}
            className={`w-16 text-2xl font-black ${accentClass} bg-transparent border-b border-current/30 focus:outline-none focus:border-current text-center`}
          />
          <span className="text-xs text-on-surface-variant">días</span>
        </div>
        <button
          onClick={() => onUpdate({ isActive: !plan.isActive })}
          className={`text-xs px-2 py-1 rounded-full font-semibold transition-colors ${
            plan.isActive
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              : "bg-slate-200 text-slate-600 hover:bg-slate-300"
          }`}
          disabled={saving}
        >
          {plan.isActive ? "Activo" : "Inactivo"}
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-on-surface font-bold">$</span>
        <input
          type="number"
          min="0"
          step="1"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setDirty(true);
          }}
          className="flex-1 text-base font-bold text-on-surface bg-transparent border-b border-on-surface-variant/30 focus:outline-none focus:border-primary"
        />
        <select
          value={currency}
          onChange={(e) => {
            setCurrency(e.target.value as Plan["currency"]);
            setDirty(true);
          }}
          className="text-xs font-semibold text-on-surface bg-transparent border-b border-on-surface-variant/30 focus:outline-none focus:border-primary"
        >
          <option value="CUP">CUP</option>
          <option value="USD">USD</option>
          <option value="MLC">MLC</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={save}
          disabled={!dirty || saving}
          className="flex-1 text-xs font-bold bg-primary text-on-primary py-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
        >
          {saving ? "Guardando…" : "Guardar"}
        </button>
        <button
          onClick={onDelete}
          disabled={saving}
          className="text-xs px-2 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Eliminar"
        >
          <span className="material-symbols-outlined text-base">delete</span>
        </button>
      </div>
    </div>
  );
}

function AddPlanForm({
  type,
  onCancel,
  onSubmit,
}: {
  type: PlanType;
  onCancel: () => void;
  onSubmit: (days: number, amount: number, currency: "CUP" | "USD" | "MLC") => void;
}) {
  const [days, setDays] = useState("7");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"CUP" | "USD" | "MLC">("CUP");

  function submit() {
    const d = parseInt(days, 10);
    const a = parseFloat(amount);
    if (!Number.isInteger(d) || d <= 0) return alert("Días debe ser entero positivo");
    if (Number.isNaN(a) || a < 0) return alert("Monto inválido");
    onSubmit(d, a, currency);
  }

  return (
    <div className="mt-4 p-4 bg-surface-low rounded-xl border border-dashed border-primary/30">
      <p className="text-xs font-semibold text-on-surface mb-3">
        Nuevo plan para {TYPE_META[type].title}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">
            Días
          </label>
          <input
            type="number"
            min="1"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-surface-lowest border border-outline-variant/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">
            Monto
          </label>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 rounded-lg bg-surface-lowest border border-outline-variant/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-on-surface-variant mb-1">
            Moneda
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as "CUP" | "USD" | "MLC")}
            className="w-full px-3 py-2 rounded-lg bg-surface-lowest border border-outline-variant/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="CUP">CUP</option>
            <option value="USD">USD</option>
            <option value="MLC">MLC</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={submit}
            className="flex-1 px-3 py-2 bg-primary text-on-primary rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors"
          >
            Crear
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-2 text-on-surface-variant hover:bg-surface-lowest rounded-lg text-sm transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

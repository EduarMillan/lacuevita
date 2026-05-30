"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { regions, type Region } from "@/lib/regions";

interface Professional {
  id: string;
  slug: string;
  title: string;
  description: string;
  yearsExperience: number;
  location: string;
  region: string | null;
  comuna: string | null;
  phone: string | null;
  whatsapp: string | null;
  isVerified: boolean;
  viewCount: number;
  createdAt: string;
  user: { name: string; avatarUrl: string | null; isVerified: boolean };
  category: { name: string; slug: string; icon: string } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ProfessionalDirectory() {
  const [search, setSearch] = useState("");
  const [regionId, setRegionId] = useState("");
  const [comunaId, setComunaId] = useState("");
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const selectedRegion: Region | undefined = regions.find(
    (r) => r.id === regionId,
  );

  const fetchProfessionals = useCallback(
    async (page = 1) => {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (regionId) params.set("region", regionId);
      if (comunaId) params.set("comuna", comunaId);
      params.set("page", String(page));
      params.set("limit", "18");

      try {
        const res = await fetch(`/api/professionals?${params}`);
        const data = await res.json();
        setProfessionals(data.professionals);
        setPagination(data.pagination);
      } catch {
        console.error("Error fetching professionals");
      } finally {
        setLoading(false);
      }
    },
    [search, regionId, comunaId],
  );

  useEffect(() => {
    const timeout = setTimeout(() => fetchProfessionals(), 300);
    return () => clearTimeout(timeout);
  }, [fetchProfessionals]);

  function handleRegionChange(value: string) {
    setRegionId(value);
    setComunaId("");
  }

  return (
    <>
      {/* Search & Filters */}
      <section className="bg-surface-low py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-surface-lowest rounded-2xl p-4 sm:p-6 shadow-sm">
            {/* Search bar */}
            <div className="flex gap-2 mb-4 sm:mb-6">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Buscar profesión o nombre..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 rounded-xl bg-surface-low text-on-surface placeholder:text-on-surface-variant/60 text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>
              <button
                type="button"
                onClick={() => fetchProfessionals()}
                className="inline-flex items-center gap-1.5 bg-primary text-on-primary px-4 sm:px-5 py-3 sm:py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/90 active:scale-95 transition-all shrink-0"
              >
                <span className="material-symbols-outlined text-lg">search</span>
                <span className="hidden sm:inline">Buscar</span>
              </button>
            </div>

            {/* Region / Comuna filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  Provincia
                </label>
                <select
                  value={regionId}
                  onChange={(e) => handleRegionChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface-low text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Todas las regiones</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.romanNumeral} - {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                  Municipio
                </label>
                <select
                  value={comunaId}
                  onChange={(e) => setComunaId(e.target.value)}
                  disabled={!regionId}
                  className="w-full px-4 py-3 rounded-xl bg-surface-low text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="">Todas las comunas</option>
                  {selectedRegion?.comunas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8 gap-3">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-on-surface">
              Profesionales
            </h2>
            {pagination && (
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                {pagination.total}{" "}
                {pagination.total === 1
                  ? "encontrado"
                  : "encontrados"}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-gradient-to-br from-primary to-primary-container text-on-primary px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold text-sm shadow-lg hover:shadow-xl active:scale-95 transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-lg sm:text-xl">
              person_add
            </span>
            <span className="hidden sm:inline">Registrarme</span>
            <span className="sm:hidden">Registro</span>
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface-lowest rounded-2xl p-6 animate-pulse shadow-sm"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full bg-surface-container" />
                  <div className="flex-1">
                    <div className="h-4 bg-surface-container rounded-lg w-3/4 mb-2.5" />
                    <div className="h-3 bg-surface-container rounded-lg w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-surface-container rounded-lg w-full mb-2" />
                <div className="h-3 bg-surface-container rounded-lg w-4/5 mb-5" />
                <div className="h-3 bg-surface-container rounded-lg w-2/3 mb-2" />
                <div className="h-3 bg-surface-container rounded-lg w-1/2 mb-5" />
                <div className="h-11 bg-surface-container rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : professionals.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {professionals.map((pro, i) => (
                <ProfessionalCard key={pro.id} professional={pro} index={i} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <PaginationBar
                current={pagination.page}
                total={pagination.totalPages}
                totalItems={pagination.total}
                onPageChange={fetchProfessionals}
              />
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-surface-lowest rounded-2xl">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4 block">
              person_search
            </span>
            <h3 className="text-xl font-bold text-on-surface mb-2">
              No se encontraron profesionales
            </h3>
            <p className="text-on-surface-variant mb-6 max-w-md mx-auto">
              {search || regionId
                ? "Intenta con otros términos de búsqueda o filtros."
                : "Sé el primero en registrarte como profesional en tu comunidad."}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-br from-primary to-primary-container text-on-primary px-8 py-3 rounded-full font-semibold shadow-lg"
            >
              <span className="material-symbols-outlined">person_add</span>
              Registrarme como profesional
            </button>
          </div>
        )}
      </section>

      {/* Registration Form */}
      {showForm && (
        <RegistrationForm onClose={() => setShowForm(false)} onSuccess={() => {
          setShowForm(false);
          fetchProfessionals();
        }} />
      )}
    </>
  );
}

/* ─── Professional Card ──────────────────────────────────── */

function ProfessionalCard({
  professional: pro,
  index,
}: {
  professional: Professional;
  index: number;
}) {
  const initials = pro.user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const regionData = regions.find((r) => r.id === pro.region);
  const comunaData = regionData?.comunas.find((c) => c.id === pro.comuna);

  return (
    <div
      className="group relative bg-surface-lowest rounded-2xl p-4 sm:p-6 flex flex-col transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_-12px_rgba(0,106,99,0.15)] border border-transparent hover:border-primary/20"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Subtle glow on hover */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm" />

      {/* Header */}
      <div className="flex items-start gap-2.5 sm:gap-4 mb-3 sm:mb-4">
        {pro.user.avatarUrl ? (
          <Image
            src={pro.user.avatarUrl}
            alt={pro.user.name}
            width={56}
            height={56}
            className="w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover ring-2 ring-surface-low group-hover:ring-primary/30 transition-all duration-300 shrink-0"
          />
        ) : (
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary font-bold text-sm sm:text-lg shrink-0 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-sm sm:text-base text-on-surface truncate group-hover:text-primary transition-colors duration-300">
              {pro.user.name}
            </h3>
            {pro.isVerified && (
              <span
                className="material-symbols-outlined text-primary text-sm sm:text-lg shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified
              </span>
            )}
          </div>
          <p className="text-primary font-semibold text-xs sm:text-sm truncate">{pro.title}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs sm:text-sm text-on-surface-variant line-clamp-2 mb-3 sm:mb-4 leading-relaxed">
        {pro.description}
      </p>

      {/* Meta */}
      <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-5">
        {pro.yearsExperience > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-xs sm:text-sm text-tertiary shrink-0">
              workspace_premium
            </span>
            <span className="truncate">
              {pro.yearsExperience}{" "}
              {pro.yearsExperience === 1 ? "año" : "años"} exp.
            </span>
          </div>
        )}
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-xs sm:text-sm text-secondary shrink-0">
            location_on
          </span>
          <span className="truncate">
            {comunaData?.name || pro.comuna || pro.location}
            {regionData ? `, ${regionData.shortName}` : ""}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-xs sm:text-sm text-secondary shrink-0">
            visibility
          </span>
          <span>{pro.viewCount} visitas</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto">
        <Link
          href={`/comunidad/${pro.slug}`}
          className="group/btn relative flex items-center justify-center gap-1.5 w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-primary to-primary-container text-on-primary font-semibold text-xs sm:text-sm overflow-hidden shadow-[0_4px_12px_rgba(0,106,99,0.2)] hover:shadow-[0_8px_24px_rgba(0,106,99,0.3)] active:scale-[0.97] transition-all duration-300"
        >
          Ver más
          <span className="material-symbols-outlined text-base sm:text-lg transition-transform duration-300 group-hover/btn:translate-x-1">
            arrow_forward
          </span>
        </Link>
      </div>
    </div>
  );
}

/* ─── Pagination ─────────────────────────────────────────── */

function PaginationBar({
  current,
  total,
  totalItems,
  onPageChange,
}: {
  current: number;
  total: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}) {
  // Build the page numbers to show: always first, last, current, and neighbors
  function getPageNumbers(): (number | "dots")[] {
    const pages: (number | "dots")[] = [];
    const delta = 2; // how many neighbors around current

    const rangeStart = Math.max(2, current - delta);
    const rangeEnd = Math.min(total - 1, current + delta);

    pages.push(1);

    if (rangeStart > 2) pages.push("dots");

    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    if (rangeEnd < total - 1) pages.push("dots");

    if (total > 1) pages.push(total);

    return pages;
  }

  const pages = getPageNumbers();
  const from = (current - 1) * 18 + 1;
  const to = Math.min(current * 18, totalItems);

  return (
    <div className="mt-14 flex flex-col items-center gap-5">
      {/* Info */}
      <p className="text-sm text-on-surface-variant">
        Mostrando{" "}
        <span className="font-bold text-on-surface">
          {from}-{to}
        </span>{" "}
        de{" "}
        <span className="font-bold text-on-surface">{totalItems}</span>{" "}
        profesionales — Página{" "}
        <span className="font-bold text-on-surface">{current}</span> de{" "}
        <span className="font-bold text-on-surface">{total}</span>
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1.5">
        {/* Prev */}
        <button
          onClick={() => onPageChange(current - 1)}
          disabled={current === 1}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none"
        >
          <span className="material-symbols-outlined text-xl">
            chevron_left
          </span>
        </button>

        {/* Page numbers */}
        {pages.map((p, i) =>
          p === "dots" ? (
            <span
              key={`dots-${i}`}
              className="w-10 h-10 flex items-center justify-center text-on-surface-variant text-sm"
            >
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-10 h-10 rounded-xl font-bold text-sm transition-all duration-200 ${
                current === p
                  ? "bg-primary text-on-primary shadow-md shadow-primary/25 scale-110"
                  : "text-on-surface-variant hover:bg-primary/10 hover:text-primary"
              }`}
            >
              {p}
            </button>
          ),
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(current + 1)}
          disabled={current === total}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none"
        >
          <span className="material-symbols-outlined text-xl">
            chevron_right
          </span>
        </button>
      </div>
    </div>
  );
}

/* ─── Registration Form ──────────────────────────────────── */

function RegistrationForm({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    phone: "",
    whatsapp: "",
    region: "",
    comuna: "",
    yearsExperience: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedRegion = regions.find((r) => r.id === formData.region);

  function updateField(field: string, value: string) {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "region" ? { comuna: "" } : {}),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const comunaData = selectedRegion?.comunas.find(
      (c) => c.id === formData.comuna,
    );
    const location = comunaData
      ? `${comunaData.name}, ${selectedRegion!.shortName}`
      : selectedRegion?.shortName || "";

    try {
      const res = await fetch("/api/professionals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          phone: formData.phone || null,
          whatsapp: formData.whatsapp || null,
          region: formData.region,
          comuna: formData.comuna,
          location,
          yearsExperience: formData.yearsExperience,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al registrar");
        return;
      }

      onSuccess();
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-surface-lowest rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-surface-lowest rounded-t-3xl px-5 sm:px-8 pt-6 sm:pt-8 pb-3 sm:pb-4 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-on-surface">
              Registro Profesional
            </h2>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-surface-low flex items-center justify-center text-on-surface-variant hover:bg-surface-high transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <p className="text-sm text-on-surface-variant mt-1">
            Completa tus datos para aparecer en el directorio
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-5 sm:px-8 pb-6 sm:pb-8 space-y-4 sm:space-y-5">
          {error && (
            <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          {/* Profesión */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Profesión / Oficio *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Electricista, Plomero, Diseñador Web..."
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface-low text-on-surface placeholder:text-on-surface-variant/50 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Descripción de tus servicios *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe qué servicios ofreces, tu especialidad, horarios..."
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface-low text-on-surface placeholder:text-on-surface-variant/50 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          {/* Region / Municipio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Provincia *
              </label>
              <select
                required
                value={formData.region}
                onChange={(e) => updateField("region", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface-low text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer"
              >
                <option value="">Seleccionar</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.romanNumeral} - {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Municipio *
              </label>
              <select
                required
                value={formData.comuna}
                onChange={(e) => updateField("comuna", e.target.value)}
                disabled={!formData.region}
                className="w-full px-4 py-3 rounded-xl bg-surface-low text-on-surface font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer disabled:opacity-50"
              >
                <option value="">Seleccionar</option>
                {selectedRegion?.comunas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Experiencia */}
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
              Años de experiencia
            </label>
            <input
              type="number"
              min="0"
              max="60"
              placeholder="0"
              value={formData.yearsExperience}
              onChange={(e) => updateField("yearsExperience", e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface-low text-on-surface placeholder:text-on-surface-variant/50 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Contacto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                placeholder="+53 5 123 4567"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface-low text-on-surface placeholder:text-on-surface-variant/50 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                WhatsApp
              </label>
              <input
                type="tel"
                placeholder="+53 5 123 4567"
                value={formData.whatsapp}
                onChange={(e) => updateField("whatsapp", e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface-low text-on-surface placeholder:text-on-surface-variant/50 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {submitting ? "Registrando..." : "Registrarme como Profesional"}
          </button>
        </form>
      </div>
    </div>
  );
}

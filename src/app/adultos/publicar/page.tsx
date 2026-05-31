"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AgeGate from "@/components/adultos/AgeGate";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { createClient } from "@/lib/supabase/client";
import { regions } from "@/lib/regions";
import imageCompression from "browser-image-compression";
import { usePricingPlans } from "@/hooks/usePricingPlans";

const SERVICE_TYPES = [
  "Masajes",
  "Compañía",
  "Entretenimiento",
  "Shows",
  "Fotografía",
  "Otro",
];

export default function PublicarAdultoPage() {
  const router = useRouter();
  const { plans: featuredPlans } = usePricingPlans("ADULT_FEATURED");
  const [alias, setAlias] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [location, setLocation] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [regionId, setRegionId] = useState("");
  const [comunaId, setComunaId] = useState("");
  const [images, setImages] = useState<{ url: string; file?: File }[]>([]);
  const [presentationIndex, setPresentationIndex] = useState(0);
  // Images NOT blurred (inverted logic: all non-presentation start blurred)
  const [unblurredSet, setUnblurredSet] = useState<Set<number>>(new Set());
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showFeaturedInfo, setShowFeaturedInfo] = useState(false);

  const selectedRegion = regionId ? regions.find((r) => r.id === regionId) : null;

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 8) {
      setError("Máximo 8 imágenes");
      return;
    }

    setUploading(true);
    setError("");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Debes iniciar sesión para publicar.");
      setUploading(false);
      return;
    }

    for (const file of files) {
      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
        });
        const ext = file.name.split(".").pop() || "jpg";
        const path = `adultos/${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("listing-images")
          .upload(path, compressed, { cacheControl: "3600", upsert: false });
        if (upErr) throw new Error(upErr.message);
        const { data: urlData } = supabase.storage.from("listing-images").getPublicUrl(path);
        setImages((prev) => [...prev, { url: urlData.publicUrl }]);
      } catch (err) {
        setError(`Error subiendo imagen: ${err instanceof Error ? err.message : "Error"}`);
      }
    }
    setUploading(false);
    e.target.value = "";
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (presentationIndex === index) setPresentationIndex(0);
    else if (presentationIndex > index) setPresentationIndex((p) => p - 1);
    setUnblurredSet((prev) => {
      const next = new Set<number>();
      prev.forEach((i) => {
        if (i < index) next.add(i);
        else if (i > index) next.add(i - 1);
      });
      return next;
    });
  }

  function toggleBlur(index: number) {
    setUnblurredSet((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedAlias = alias.trim();
    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();
    const trimmedWhatsapp = whatsapp.trim();

    if (!trimmedAlias || !trimmedTitle || !trimmedDesc || !serviceType || !location || !trimmedWhatsapp) {
      setError("Completa todos los campos obligatorios");
      return;
    }
    if (trimmedAlias.length < 2 || trimmedAlias.length > 50) {
      setError("El alias debe tener entre 2 y 50 caracteres");
      return;
    }
    if (trimmedTitle.length < 5 || trimmedTitle.length > 120) {
      setError("El título debe tener entre 5 y 120 caracteres");
      return;
    }
    if (trimmedDesc.length < 20 || trimmedDesc.length > 2000) {
      setError("La descripción debe tener entre 20 y 2000 caracteres");
      return;
    }
    if (!/^\+?\d{7,15}$/.test(trimmedWhatsapp.replace(/[\s\-()]/g, ""))) {
      setError("Ingresa un número de WhatsApp válido (ej: +5351234567)");
      return;
    }
    if (images.length === 0) {
      setError("Sube al menos una imagen");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/adultos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          alias,
          title,
          description,
          serviceType,
          location,
          whatsapp,
          region: regionId || undefined,
          comuna: comunaId || undefined,
          imageUrls: images.map((img) => img.url),
          presentationIndex,
          blurredIndexes: images
            .map((_, i) => i)
            .filter((i) => i !== presentationIndex && !unblurredSet.has(i)),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push(`/adultos/${data.listing.slug}`);
      } else {
        setError(data.error || "Error al publicar");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AgeGate>
      <div className="min-h-screen">
        {/* Header */}
        <section className="bg-gradient-to-br from-rose-900 via-rose-800 to-pink-900">
          <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto">
            <Breadcrumbs
              variant="light"
              items={[
                { label: "Inicio", href: "/" },
                { label: "Adultos", href: "/adultos" },
                { label: "Publicar" },
              ]}
            />
            <h1 className="text-2xl lg:text-3xl font-black text-white mt-3">
              Publicar Servicio
            </h1>
            <p className="text-sm text-white/70 mt-1">
              Tu identidad real no será visible. Usa un alias para proteger tu privacidad.
            </p>
          </div>
        </section>

        {/* Form */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-100 text-red-800 text-sm font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Privacy notice */}
            <div className="bg-rose-50 rounded-2xl p-5 border border-rose-200/30 flex items-start gap-3">
              <span className="material-symbols-outlined text-rose-600 mt-0.5">shield</span>
              <div className="text-sm text-on-surface-variant">
                <p className="font-bold text-on-surface mb-1">Privacidad protegida</p>
                <p>Tu nombre real, correo y foto de perfil nunca se mostrarán. Solo tu alias será visible.</p>
              </div>
            </div>

            {/* Alias, Title & WhatsApp */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1.5 block">
                  Alias / Nombre artístico *
                </label>
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="Ej: Luna, Valentina"
                  maxLength={40}
                  className="w-full px-4 py-3 rounded-xl bg-surface-lowest border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1.5 block">
                  Título del servicio *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Masajes relajantes profesionales"
                  maxLength={100}
                  className="w-full px-4 py-3 rounded-xl bg-surface-lowest border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1.5 block">
                Tu WhatsApp *
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+53 5 123 4567"
                className="w-full px-4 py-3 rounded-xl bg-surface-lowest border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 max-w-sm"
              />
              <p className="text-[10px] text-on-surface-variant mt-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined" style={{ fontSize: "12px" }}>info</span>
                Los interesados podrán contactarte directamente por WhatsApp.
              </p>
            </div>

            {/* Service type */}
            <div>
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1.5 block">
                Tipo de servicio *
              </label>
              <div className="flex flex-wrap gap-2">
                {SERVICE_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setServiceType(type)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      serviceType === type
                        ? "bg-rose-600 text-white shadow-sm"
                        : "bg-surface-low text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1.5 block">
                Descripción *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe tu servicio en detalle..."
                rows={5}
                maxLength={2000}
                className="w-full px-4 py-3 rounded-xl bg-surface-lowest border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 resize-none"
              />
              <span className="text-[10px] text-on-surface-variant">{description.length}/2000</span>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1.5 block">
                  Ubicación general *
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ej: Centro Habana"
                  className="w-full px-4 py-3 rounded-xl bg-surface-lowest border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1.5 block">
                  Provincia
                </label>
                <select
                  value={regionId}
                  onChange={(e) => { setRegionId(e.target.value); setComunaId(""); }}
                  className="w-full px-4 py-3 rounded-xl bg-surface-lowest border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                >
                  <option value="">Seleccionar</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1.5 block">
                  Municipio
                </label>
                <select
                  value={comunaId}
                  onChange={(e) => setComunaId(e.target.value)}
                  disabled={!selectedRegion}
                  className="w-full px-4 py-3 rounded-xl bg-surface-lowest border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 disabled:opacity-50"
                >
                  <option value="">Seleccionar</option>
                  {selectedRegion?.comunas.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wide mb-1.5 block">
                Imágenes * (máx. 8)
              </label>
              <p className="text-xs text-on-surface-variant mb-3">
                Selecciona una imagen de presentación. Las demás se difuminan automáticamente y solo se revelan con un código único que tú compartes.
              </p>

              <div className="grid grid-cols-4 gap-3 mb-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                    <Image src={img.url} alt="" fill sizes="150px" className="object-cover" />
                    {/* Presentation badge */}
                    <button
                      type="button"
                      onClick={() => setPresentationIndex(idx)}
                      className={`absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full transition-all ${
                        presentationIndex === idx
                          ? "bg-rose-600 text-white"
                          : "bg-black/50 text-white/70 hover:bg-rose-600 hover:text-white"
                      }`}
                    >
                      {presentationIndex === idx ? "Presentación" : "Seleccionar"}
                    </button>
                    {/* Blur toggle — non-presentation images are blurred by default */}
                    {presentationIndex !== idx && (
                      <button
                        type="button"
                        onClick={() => toggleBlur(idx)}
                        className={`absolute bottom-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 transition-all ${
                          !unblurredSet.has(idx)
                            ? "bg-rose-600 text-white"
                            : "bg-black/50 text-white/70 hover:bg-rose-600 hover:text-white"
                        }`}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "10px" }}>
                          {!unblurredSet.has(idx) ? "blur_on" : "blur_off"}
                        </span>
                        {!unblurredSet.has(idx) ? "Difuminada" : "Visible"}
                      </button>
                    )}
                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>close</span>
                    </button>
                  </div>
                ))}
                {images.length < 8 && (
                  <label className={`aspect-square rounded-xl border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center cursor-pointer hover:border-rose-400 transition-colors ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                    <span className="material-symbols-outlined text-2xl text-on-surface-variant/40">
                      {uploading ? "progress_activity" : "add_photo_alternate"}
                    </span>
                    <span className="text-[10px] text-on-surface-variant/60 mt-1">
                      {uploading ? "Subiendo..." : "Agregar"}
                    </span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                )}
              </div>
            </div>

            {/* Featured promo */}
            <div className="rounded-2xl overflow-hidden border border-rose-200/40">
              <button
                type="button"
                onClick={() => setShowFeaturedInfo(!showFeaturedInfo)}
                className="w-full flex items-center justify-between gap-4 bg-gradient-to-r from-rose-50 to-pink-50 px-6 py-5 text-left transition-colors hover:from-rose-100 hover:to-pink-100"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="material-symbols-outlined text-rose-500 text-2xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold text-rose-900 tracking-tight">
                      Destaca tu anuncio
                    </h3>
                    <p className="text-sm text-rose-700/80 mt-0.5">
                      Aparece primero y consigue más contactos
                    </p>
                  </div>
                </div>
                <span className={`material-symbols-outlined text-rose-500 transition-transform ${showFeaturedInfo ? "rotate-180" : ""}`}>
                  expand_more
                </span>
              </button>

              {showFeaturedInfo && (
                <div className="bg-rose-50/50 px-6 py-6 space-y-5 border-t border-rose-200/50">
                  <p className="text-sm text-rose-950 leading-relaxed">
                    Los anuncios destacados aparecen <strong>primero en los resultados</strong> de la sección adultos, con una <strong>insignia especial</strong> que los hace más visibles para los interesados.
                  </p>

                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-rose-900 flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-rose-500">rocket_launch</span>
                      ¿Cómo funciona?
                    </h4>
                    <ol className="space-y-3 text-sm text-rose-950/85">
                      <li className="flex gap-3">
                        <span className="bg-rose-400 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0">1</span>
                        <span><strong>Publica tu anuncio</strong> de forma gratuita como siempre.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="bg-rose-400 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0">2</span>
                        <span>Ve a <strong>Mis Servicios</strong> y copia tu código de anuncio.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="bg-rose-400 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0">3</span>
                        <span>Toca <strong>&quot;Solicitar por WhatsApp&quot;</strong> — el mensaje se genera automáticamente con tu código y plan.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="bg-rose-400 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0">4</span>
                        <span>Una vez confirmado el pago, <strong>activamos tu destacado</strong> en minutos.</span>
                      </li>
                    </ol>
                  </div>

                  <div className="bg-white/70 rounded-xl p-4 border border-rose-200/60">
                    <h4 className="text-sm font-bold text-rose-900 mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-rose-500">sell</span>
                      Planes disponibles
                    </h4>
                    <div className={`grid gap-3 ${featuredPlans.length <= 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"}`}>
                      {featuredPlans.map((plan) => (
                        <div key={plan.id} className="text-center bg-rose-100/60 rounded-lg py-3 px-2">
                          <p className="text-xs font-bold text-rose-800">{plan.label}</p>
                          <p className="text-lg font-extrabold text-rose-950">{plan.price}</p>
                        </div>
                      ))}
                      {featuredPlans.length === 0 && (
                        <p className="col-span-3 text-xs text-rose-900/70 italic py-2 text-center">
                          Cargando planes…
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-xs text-rose-800/70 bg-rose-100/40 rounded-lg p-3">
                    <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">info</span>
                    <p>
                      Los espacios destacados son limitados para garantizar visibilidad.
                      Tu anuncio se publica gratis de forma inmediata, el destacado es opcional.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-2xl font-bold text-lg hover:from-rose-700 hover:to-pink-700 transition-all disabled:opacity-50 shadow-lg"
            >
              {submitting ? "Publicando..." : "Publicar servicio"}
            </button>
          </form>
        </div>
      </div>
    </AgeGate>
  );
}

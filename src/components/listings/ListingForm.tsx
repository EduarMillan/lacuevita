"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { processImage, revokePreview, type ProcessedImage } from "@/lib/image-utils";
import { categories } from "@/lib/categories";
import { regions } from "@/lib/regions";
import { CURRENCIES, type Currency } from "@/lib/format";

const MAX_IMAGES = 10;

const conditionOptions = [
  { value: "NEW", label: "Nuevo" },
  { value: "LIKE_NEW", label: "Como nuevo" },
  { value: "USED", label: "Usado" },
  { value: "FOR_PARTS", label: "Para repuestos" },
];

/* ─── Types ──────────────────────────────────────────────── */

export interface ExistingImage {
  id: string;
  url: string;
  order: number;
  isPrimary: boolean;
}

export interface ListingData {
  id: string;
  title: string;
  description: string;
  price: string;
  currency: Currency;
  condition: string;
  location: string;
  categorySlug: string;
  parentCategorySlug: string;
  regionId: string;
  comunaId: string;
  phone: string;
  images: ExistingImage[];
}

type ImageItem =
  | { type: "existing"; id: string; url: string }
  | { type: "new"; processed: ProcessedImage };

/* ─── Component ──────────────────────────────────────────── */

export default function ListingForm({
  mode,
  initialData,
}: {
  mode: "create" | "edit";
  initialData?: ListingData;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [userId, setUserId] = useState("");
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [parentCategory, setParentCategory] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<Currency>("CUP");
  const [condition, setCondition] = useState("USED");
  const [description, setDescription] = useState("");
  const [regionId, setRegionId] = useState("");
  const [comunaId, setComunaId] = useState("");
  const [phone, setPhone] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showFeaturedInfo, setShowFeaturedInfo] = useState(false);

  // Load user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
      }
    });
  }, [supabase.auth]);

  // Populate form for edit mode
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setPrice(String(parseFloat(String(initialData.price))));
      setCurrency(initialData.currency || "CUP");
      setCondition(initialData.condition);
      setParentCategory(initialData.parentCategorySlug);
      setCategoryId(initialData.categorySlug);
      setRegionId(initialData.regionId);
      setComunaId(initialData.comunaId);
      setPhone(initialData.phone || "");
      setTermsAccepted(true);
      setImageItems(
        initialData.images.map((img) => ({
          type: "existing" as const,
          id: img.id,
          url: img.url,
        })),
      );
    }
  }, [mode, initialData]);

  // Cleanup new image previews on unmount
  const imageItemsRef = useRef(imageItems);
  imageItemsRef.current = imageItems;
  useEffect(() => {
    return () => {
      imageItemsRef.current.forEach((item) => {
        if (item.type === "new") revokePreview(item.processed.preview);
      });
    };
  }, []);

  const selectedRegion = regions.find((r) => r.id === regionId);
  const selectedParent = categories.find((c) => c.slug === parentCategory);

  const locationDisplay = (() => {
    if (!regionId) return "";
    const region = regions.find((r) => r.id === regionId);
    if (!region) return "";
    if (comunaId) {
      const comuna = region.comunas.find((c) => c.id === comunaId);
      return comuna ? `${comuna.name}, ${region.shortName}` : region.shortName;
    }
    return region.shortName;
  })();

  const totalImages = imageItems.length;

  const handleImageSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      const remaining = MAX_IMAGES - imageItems.length;
      if (remaining <= 0) return;
      const selected = Array.from(files).slice(0, remaining);
      setProcessing(true);
      setError("");
      try {
        const processed = await Promise.all(selected.map(processImage));
        setImageItems((prev) => [
          ...prev,
          ...processed.map((p) => ({ type: "new" as const, processed: p })),
        ]);
      } catch {
        setError("Error al procesar las imágenes. Intenta con otras.");
      } finally {
        setProcessing(false);
        e.target.value = "";
      }
    },
    [imageItems.length],
  );

  function removeImage(index: number) {
    setImageItems((prev) => {
      const item = prev[index];
      if (item.type === "new") revokePreview(item.processed.preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  function moveImage(from: number, to: number) {
    if (to < 0 || to >= imageItems.length) return;
    setImageItems((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(from, 1);
      updated.splice(to, 0, moved);
      return updated;
    });
  }

  function getImageSrc(item: ImageItem): string {
    return item.type === "existing" ? item.url : item.processed.preview;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (imageItems.length === 0) {
      setError("Debes subir al menos una imagen.");
      return;
    }
    if (!title.trim()) {
      setError("El título es obligatorio.");
      return;
    }
    if (!categoryId) {
      setError("Selecciona una categoría.");
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      setError("Ingresa un precio válido.");
      return;
    }
    if (!regionId) {
      setError("Selecciona una ubicación.");
      return;
    }

    setSubmitting(true);
    setUploading(true);

    try {
      // Upload only NEW images
      const newImageUrls: string[] = [];
      for (const item of imageItems) {
        if (item.type === "new") {
          const ext = item.processed.file.name.split(".").pop() || "webp";
          const path = `listings/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from("listing-images")
            .upload(path, item.processed.file, { cacheControl: "3600", upsert: false });
          if (uploadError) throw new Error(`Error subiendo imagen: ${uploadError.message}`);
          const { data: urlData } = supabase.storage.from("listing-images").getPublicUrl(path);
          newImageUrls.push(urlData.publicUrl);
        }
      }
      setUploading(false);

      if (mode === "create") {
        const res = await fetch("/api/listings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            price: parseFloat(price),
            currency,
            categoryId,
            condition,
            location: locationDisplay,
            phone: phone.trim() || null,
            imageUrls: [
              // Existing images keep their URLs in order
              ...imageItems.filter((i) => i.type === "existing").map((i) => (i as { type: "existing"; url: string }).url),
              ...newImageUrls,
            ],
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al crear el anuncio");
        const catSlug = data.listing.category?.slug || "";
        router.push(`/mis-anuncios?nuevo=${data.listing.code}&cat=${catSlug}`);
      } else {
        // Edit mode: send keepImageIds (existing images still in the list, in order)
        // and newImageUrls for newly uploaded images
        const keepImageIds = imageItems
          .filter((i) => i.type === "existing")
          .map((i) => (i as { type: "existing"; id: string }).id);

        // Build full order: existing ids + placeholder "new" for new images
        const imageOrder: { type: "existing" | "new"; id?: string }[] = imageItems.map((item) =>
          item.type === "existing"
            ? { type: "existing", id: item.id }
            : { type: "new" },
        );

        const res = await fetch(`/api/listings/${initialData!.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            price: parseFloat(price),
            currency,
            categoryId,
            condition,
            location: locationDisplay,
            phone: phone.trim() || null,
            keepImageIds,
            newImageUrls,
            imageOrder,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al actualizar el anuncio");
        router.push("/mis-anuncios");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setSubmitting(false);
      setUploading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 items-start">
      <form onSubmit={handleSubmit} className="space-y-8">
        <header className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2">
            {mode === "create" ? "Crear nuevo anuncio" : "Editar anuncio"}
          </h1>
          <p className="text-on-surface-variant text-lg">
            {mode === "create"
              ? "Publica lo que vendes en La Cuevita, el rincón de la comunidad cubana."
              : "Modifica los datos de tu anuncio y guarda los cambios."}
          </p>
        </header>

        <div className="space-y-12">
          {/* Step 1: Photos */}
          <div className="bg-surface-low p-8 rounded-xl space-y-6">
            <div className="flex items-center gap-4">
              <span className="bg-primary text-on-primary w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                1
              </span>
              <h2 className="text-xl font-bold tracking-tight">
                Fotos del producto
              </h2>
              <span className="text-sm text-on-surface-variant ml-auto">
                {totalImages}/{MAX_IMAGES}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {imageItems.map((item, i) => (
                <div
                  key={item.type === "existing" ? item.id : item.processed.preview}
                  className="aspect-square bg-surface-lowest rounded-xl overflow-hidden shadow-sm relative group"
                >
                  <Image
                    src={getImageSrc(item)}
                    alt={`Foto ${i + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 20vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-start justify-end gap-1 p-2">
                    {i > 0 && (
                      <button
                        type="button"
                        onClick={() => moveImage(i, i - 1)}
                        className="bg-on-surface/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Mover izquierda"
                      >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                      </button>
                    )}
                    {i < imageItems.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveImage(i, i + 1)}
                        className="bg-on-surface/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Mover derecha"
                      >
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="bg-error/90 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Eliminar"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                  {i === 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-on-primary text-[10px] text-center py-1 font-bold">
                      PRINCIPAL
                    </div>
                  )}
                </div>
              ))}

              {totalImages < MAX_IMAGES && (
                <label className="aspect-square bg-surface-lowest border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary transition-colors group">
                  {processing ? (
                    <>
                      <span className="material-symbols-outlined text-primary animate-spin">
                        progress_activity
                      </span>
                      <span className="text-xs font-medium text-on-surface-variant">
                        Procesando...
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-outline group-hover:text-primary">
                        add_a_photo
                      </span>
                      <span className="text-xs font-medium text-on-surface-variant group-hover:text-primary">
                        Añadir foto
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    multiple
                    onChange={handleImageSelect}
                    disabled={processing}
                  />
                </label>
              )}
            </div>

            <p className="text-xs text-on-surface-variant italic">
              Máximo {MAX_IMAGES} fotos (hasta 2 MB cada una). La primera será la
              portada. Las imágenes grandes se comprimen automáticamente.
            </p>
          </div>

          {/* Step 2: Details */}
          <div className="bg-surface-low p-8 rounded-xl space-y-8">
            <div className="flex items-center gap-4">
              <span className="bg-primary text-on-primary w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                2
              </span>
              <h2 className="text-xl font-bold tracking-tight">
                Detalles del anuncio
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-on-surface-variant ml-1" htmlFor="title">
                  Título del anuncio *
                </label>
                <input
                  className="w-full px-4 py-3 bg-surface-lowest border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-shadow text-on-surface placeholder:text-outline-variant shadow-sm"
                  id="title"
                  placeholder="Ej: Audífonos Sony WH-1000XM4 como nuevos"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                  required
                />
              </div>

              {/* Parent category */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant ml-1" htmlFor="parentCategory">
                  Categoría *
                </label>
                <select
                  className="w-full px-4 py-3 bg-surface-lowest border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-shadow text-on-surface shadow-sm"
                  id="parentCategory"
                  value={parentCategory}
                  onChange={(e) => {
                    setParentCategory(e.target.value);
                    setCategoryId("");
                  }}
                  required
                >
                  <option value="">Selecciona categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Subcategory */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant ml-1" htmlFor="subcategory">
                  Subcategoría *
                </label>
                <select
                  className="w-full px-4 py-3 bg-surface-lowest border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-shadow text-on-surface shadow-sm disabled:opacity-50"
                  id="subcategory"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={!parentCategory}
                  required
                >
                  <option value="">
                    {parentCategory ? "Selecciona subcategoría" : "Elige categoría primero"}
                  </option>
                  {selectedParent?.children?.map((sub) => (
                    <option key={sub.slug} value={sub.slug}>{sub.name}</option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant ml-1" htmlFor="price">
                  Precio *
                </label>
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">$</span>
                    <input
                      className="w-full pl-8 pr-4 py-3 bg-surface-lowest border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-shadow text-on-surface shadow-sm"
                      id="price"
                      placeholder="0"
                      type="number"
                      min="0"
                      step="1"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                  <select
                    className="px-4 py-3 bg-surface-lowest border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-shadow text-on-surface shadow-sm font-semibold"
                    id="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    aria-label="Moneda"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.value}</option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-on-surface-variant ml-1">
                  Selecciona la moneda: CUP (Pesos Cubanos), USD (Dólares) o MLC.
                </p>
              </div>

              {/* Condition */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant ml-1" htmlFor="condition">
                  Estado del producto *
                </label>
                <select
                  className="w-full px-4 py-3 bg-surface-lowest border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-shadow text-on-surface shadow-sm"
                  id="condition"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                >
                  {conditionOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Provincia */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant ml-1" htmlFor="region">
                  Provincia *
                </label>
                <select
                  className="w-full px-4 py-3 bg-surface-lowest border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-shadow text-on-surface shadow-sm"
                  id="region"
                  value={regionId}
                  onChange={(e) => { setRegionId(e.target.value); setComunaId(""); }}
                  required
                >
                  <option value="">Selecciona provincia</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              {/* Municipio */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant ml-1" htmlFor="comuna">
                  Municipio
                </label>
                <select
                  className="w-full px-4 py-3 bg-surface-lowest border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-shadow text-on-surface shadow-sm disabled:opacity-50"
                  id="comuna"
                  value={comunaId}
                  onChange={(e) => setComunaId(e.target.value)}
                  disabled={!regionId}
                >
                  <option value="">
                    {regionId ? "Selecciona municipio (opcional)" : "Elige provincia primero"}
                  </option>
                  {selectedRegion?.comunas.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-on-surface-variant ml-1" htmlFor="description">
                  Descripción *
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-surface-lowest border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-shadow text-on-surface shadow-sm resize-none"
                  id="description"
                  placeholder="Cuéntanos más sobre el estado, uso y detalles importantes..."
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Step 3: Contact */}
          <div className="bg-surface-low p-8 rounded-xl space-y-8">
            <div className="flex items-center gap-4">
              <span className="bg-primary text-on-primary w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                3
              </span>
              <h2 className="text-xl font-bold tracking-tight">
                Información de contacto
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-on-surface-variant ml-1" htmlFor="phone">
                  Teléfono de contacto
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">
                    +53
                  </span>
                  <input
                    className="w-full pl-14 pr-4 py-3 bg-surface-lowest border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-shadow text-on-surface shadow-sm"
                    id="phone"
                    placeholder="9 1234 5678"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Featured info */}
          {mode === "create" && (
            <div className="rounded-2xl border-2 border-amber-300/60 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowFeaturedInfo(!showFeaturedInfo)}
                className="w-full flex items-center justify-between gap-4 bg-gradient-to-r from-amber-50 to-amber-100/80 px-6 py-5 text-left transition-colors hover:from-amber-100 hover:to-amber-200/80"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="material-symbols-outlined text-amber-600 text-2xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold text-amber-900 tracking-tight">
                      Destaca tu anuncio
                    </h3>
                    <p className="text-sm text-amber-700/80 mt-0.5">
                      Aparece primero y vende más rápido
                    </p>
                  </div>
                </div>
                <span className={`material-symbols-outlined text-amber-600 transition-transform ${showFeaturedInfo ? "rotate-180" : ""}`}>
                  expand_more
                </span>
              </button>

              {showFeaturedInfo && (
                <div className="bg-amber-50/50 px-6 py-6 space-y-5 border-t border-amber-200/50">
                  <p className="text-sm text-amber-950 leading-relaxed">
                    Los anuncios destacados aparecen <strong>primero en los resultados</strong> de búsqueda,
                    en la página principal y en su categoría, con un <strong>badge especial</strong> que
                    los hace más visibles para los compradores.
                  </p>

                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-amber-600">rocket_launch</span>
                      ¿Cómo funciona?
                    </h4>
                    <ol className="space-y-3 text-sm text-amber-950/85">
                      <li className="flex gap-3">
                        <span className="bg-amber-400 text-amber-950 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0">1</span>
                        <span><strong>Publica tu anuncio</strong> de forma gratuita como siempre.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="bg-amber-400 text-amber-950 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0">2</span>
                        <span>Ve a <strong>Mis Anuncios</strong> y presiona el botón <strong>&quot;Destacar anuncio&quot;</strong>.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="bg-amber-400 text-amber-950 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0">3</span>
                        <span>Elige tu plan y toca <strong>&quot;Solicitar por WhatsApp&quot;</strong> — el mensaje se genera automáticamente con tu código y plan.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="bg-amber-400 text-amber-950 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0">4</span>
                        <span>Una vez confirmado el pago, <strong>activamos tu destacado</strong> en minutos.</span>
                      </li>
                    </ol>
                  </div>

                  <div className="bg-white/70 rounded-xl p-4 border border-amber-200/60">
                    <h4 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-amber-600">sell</span>
                      Planes disponibles
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { days: "7 días", price: "$500 CUP" },
                        { days: "15 días", price: "$900 CUP" },
                        { days: "30 días", price: "$1500 CUP" },
                      ].map((plan) => (
                        <div key={plan.days} className="text-center bg-amber-100/60 rounded-lg py-3 px-2">
                          <p className="text-xs font-bold text-amber-800">{plan.days}</p>
                          <p className="text-lg font-extrabold text-amber-950">{plan.price}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-xs text-amber-800/70 bg-amber-100/40 rounded-lg p-3">
                    <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">info</span>
                    <p>
                      Los espacios destacados son limitados por categoría para garantizar visibilidad.
                      Tu anuncio se publica gratis de forma inmediata, el destacado es opcional.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-error-container text-on-surface p-4 rounded-xl text-sm flex items-center gap-3">
              <span className="material-symbols-outlined text-error">error</span>
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-6">
            {mode === "create" && (
              <div className="flex items-center gap-3">
                <input
                  className="rounded text-primary focus:ring-primary border-outline-variant"
                  id="terms"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                />
                <label className="text-sm text-on-surface-variant" htmlFor="terms">
                  Acepto los{" "}
                  <a className="text-primary font-bold hover:underline" href="/terminos" target="_blank" rel="noopener noreferrer">
                    términos y condiciones
                  </a>{" "}
                  de la comunidad.
                </label>
              </div>
            )}
            {mode === "edit" && <div />}
            <button
              type="submit"
              disabled={(mode === "create" && !termsAccepted) || submitting}
              className="w-full md:w-auto bg-gradient-to-r from-primary to-primary-container text-on-primary px-12 py-4 rounded-full font-extrabold text-lg active:scale-95 transform transition-transform shadow-[0_20px_40px_rgba(0,106,99,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  {uploading ? "Subiendo imágenes..." : "Guardando..."}
                </>
              ) : mode === "create" ? (
                "Publicar Anuncio"
              ) : (
                "Guardar Cambios"
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Sidebar */}
      <aside className="sticky top-24 space-y-6 hidden lg:block">
        <div className="bg-surface-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10">
          <div className="flex items-center gap-3 mb-4 text-tertiary">
            <span className="material-symbols-outlined">tips_and_updates</span>
            <h3 className="font-bold text-lg">Consejos del Curador</h3>
          </div>
          <ul className="space-y-4">
            {[
              "Usa luz natural para tus fotos, evita el flash.",
              "Sé honesto sobre cualquier detalle estético o funcional.",
              "Los anuncios con precio de mercado se venden un 40% más rápido.",
              "Agrega tu teléfono para que los compradores te contacten directo.",
            ].map((tip) => (
              <li key={tip} className="flex gap-3">
                <span className="material-symbols-outlined text-primary text-sm mt-1">check_circle</span>
                <p className="text-sm text-on-surface-variant">{tip}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-tertiary-container/30 p-6 rounded-2xl border border-tertiary-container/20">
          <div className="flex items-center gap-3 mb-2 text-on-tertiary-container">
            <span className="material-symbols-outlined">verified_user</span>
            <h3 className="font-bold">Venta Segura</h3>
          </div>
          <p className="text-sm text-on-tertiary-container/80 leading-relaxed">
            Tu seguridad es prioridad. Nunca compartas tus claves y realiza
            transacciones en lugares públicos.
          </p>
        </div>

        <div className="bg-primary/5 p-6 rounded-2xl border border-primary-container/10">
          <div className="flex items-center gap-3 mb-2 text-primary">
            <span className="material-symbols-outlined">photo_library</span>
            <h3 className="font-bold">Sobre las fotos</h3>
          </div>
          <ul className="text-sm text-on-surface-variant space-y-2">
            <li>Máximo {MAX_IMAGES} imágenes por anuncio</li>
            <li>Límite de 2 MB por imagen</li>
            <li>Las fotos grandes se comprimen automáticamente</li>
            <li>La primera foto será la portada</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}

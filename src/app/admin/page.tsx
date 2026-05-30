"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

interface Listing {
  id: string;
  code: string;
  title: string;
  slug: string;
  price: string;
  status: string;
  isFeatured: boolean;
  location: string;
  createdAt: string;
  category: { name: string; slug: string } | null;
  images: { url: string }[];
  promotions: { id: string; endDate: string; amount: string; isActive: boolean }[];
  user: { name: string; email: string };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-800",
  PAUSED: "bg-amber-100 text-amber-800",
  DRAFT: "bg-slate-100 text-slate-600",
  EXPIRED: "bg-red-100 text-red-700",
  REMOVED: "bg-red-100 text-red-700",
};

import { formatPrice } from "@/lib/format";

function daysRemaining(endDate: string): number {
  return Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

interface Banner {
  id: string;
  businessName: string;
  imageUrl: string;
  linkUrl: string | null;
  position: number;
  startDate: string;
  endDate: string;
  amount: string;
  note: string | null;
  isActive: boolean;
  clicks: number;
}

export default function AdminPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<"listings" | "ofertas" | "banners" | "pricing" | "adultos">("listings");

  // Listings state
  const [listings, setListings] = useState<Listing[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [promoting, setPromoting] = useState<string | null>(null);
  const [promoteDays, setPromoteDays] = useState(7);
  const [promoteAmount, setPromoteAmount] = useState("");
  const [promoteNote, setPromoteNote] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Banners state
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannersLoading, setBannersLoading] = useState(false);
  const [maxBanners, setMaxBanners] = useState(5);
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [bannerForm, setBannerForm] = useState({ businessName: "", imageUrl: "", linkUrl: "", days: "30", amount: "", note: "" });
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Adult listings state
  interface AdultListing {
    id: string;
    code: string;
    alias: string;
    title: string;
    slug: string;
    status: string;
    isFeatured: boolean;
    serviceType: string;
    location: string;
    viewCount: number;
    createdAt: string;
    images: { url: string }[];
    user: { email: string };
    promotions: { id: string; endDate: string; isActive: boolean }[];
  }
  const [adultListings, setAdultListings] = useState<AdultListing[]>([]);
  const [adultPagination, setAdultPagination] = useState<Pagination | null>(null);
  const [adultLoading, setAdultLoading] = useState(false);
  const [adultSearch, setAdultSearch] = useState("");
  const [adultSearchInput, setAdultSearchInput] = useState("");
  const [adultStatusFilter, setAdultStatusFilter] = useState("");
  const [adultPromoting, setAdultPromoting] = useState<string | null>(null);
  const [adultPromoteDays, setAdultPromoteDays] = useState(7);
  const [adultPromoteAmount, setAdultPromoteAmount] = useState("");
  const [adultPromoteNote, setAdultPromoteNote] = useState("");

  // Offers state
  interface AdminOffer {
    id: string;
    code: string;
    title: string;
    businessName: string;
    address: string;
    region: string;
    comuna: string;
    phone: string;
    whatsapp: string | null;
    isFeatured: boolean;
    viewCount: number;
    expiresAt: string;
    createdAt: string;
    user: { email: string; name: string };
    promotions: { id: string; endDate: string; isActive: boolean }[];
  }
  const [offersList, setOffersList] = useState<AdminOffer[]>([]);
  const [offersPagination, setOffersPagination] = useState<Pagination | null>(null);
  const [offersLoading, setOffersLoading] = useState(false);
  const [offersSearch, setOffersSearch] = useState("");
  const [offersSearchInput, setOffersSearchInput] = useState("");
  const [offersPromoting, setOffersPromoting] = useState<string | null>(null);
  const [offersPromoteDays, setOffersPromoteDays] = useState(7);
  const [offersPromoteAmount, setOffersPromoteAmount] = useState("");
  const [offersPromoteNote, setOffersPromoteNote] = useState("");

  const fetchListings = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "12" });
      if (search) params.set("q", search);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/listings?${params}`);
      if (res.status === 403) {
        setAuthorized(false);
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setAuthorized(false);
        return;
      }
      setAuthorized(true);
      setListings(data.listings || []);
      setPagination(data.pagination);
    } catch {
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
  }

  async function handlePromote(listingId: string) {
    if (!promoteAmount || parseFloat(promoteAmount) <= 0) {
      setMessage({ text: "Ingresa un monto válido", type: "error" });
      return;
    }
    setActionLoading(listingId);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/listings/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          days: promoteDays,
          amount: promoteAmount,
          note: promoteNote || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: `Anuncio destacado por ${promoteDays} días`, type: "success" });
        setPromoting(null);
        setPromoteAmount("");
        setPromoteNote("");
        fetchListings(pagination?.page || 1);
      } else {
        setMessage({ text: data.error || "Error al destacar", type: "error" });
      }
    } catch {
      setMessage({ text: "Error de conexión", type: "error" });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleUnpromote(listingId: string) {
    if (!confirm("¿Quitar destacado de este anuncio?")) return;
    setActionLoading(listingId);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/listings/promote?listingId=${listingId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: "Destacado removido", type: "success" });
        fetchListings(pagination?.page || 1);
      } else {
        setMessage({ text: data.error || "Error", type: "error" });
      }
    } catch {
      setMessage({ text: "Error de conexión", type: "error" });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeleteListing(listingId: string, code: string) {
    if (!confirm(`¿Eliminar el anuncio ${code}? Esta acción no se puede deshacer.`)) return;
    setActionLoading(listingId);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/listings?id=${listingId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: data.message, type: "success" });
        fetchListings(pagination?.page || 1);
      } else {
        setMessage({ text: data.error || "Error al eliminar", type: "error" });
      }
    } catch {
      setMessage({ text: "Error de conexión", type: "error" });
    } finally {
      setActionLoading(null);
    }
  }

  // ─── Banners ─────────────────────────────────────────────
  const fetchBanners = useCallback(async () => {
    setBannersLoading(true);
    try {
      const res = await fetch("/api/admin/banners");
      if (!res.ok) return;
      const data = await res.json();
      setBanners(data.banners || []);
      setMaxBanners(data.maxBanners || 5);
    } catch { /* ignore */ }
    finally { setBannersLoading(false); }
  }, []);

  useEffect(() => {
    if (activeTab === "banners" && banners.length === 0) {
      fetchBanners();
    }
  }, [activeTab, fetchBanners, banners.length]);

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `banners/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (uploadError) throw new Error(uploadError.message);
      const { data: urlData } = supabase.storage.from("listing-images").getPublicUrl(path);
      setBannerForm((prev) => ({ ...prev, imageUrl: urlData.publicUrl }));
    } catch (err) {
      setMessage({ text: `Error al subir: ${err instanceof Error ? err.message : "Error"}`, type: "error" });
    } finally {
      setUploadingBanner(false);
      e.target.value = "";
    }
  }

  async function handleCreateBanner() {
    const { businessName, imageUrl, days, amount, note, linkUrl } = bannerForm;
    if (!businessName || !imageUrl || !amount) {
      setMessage({ text: "Completa nombre, imagen y monto", type: "error" });
      return;
    }
    setActionLoading("banner-create");
    setMessage(null);
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, imageUrl, linkUrl: linkUrl || undefined, days, amount, note: note || undefined }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: `Banner creado. ${data.slotsRemaining} slots restantes.`, type: "success" });
        setShowBannerForm(false);
        setBannerForm({ businessName: "", imageUrl: "", linkUrl: "", days: "30", amount: "", note: "" });
        fetchBanners();
      } else {
        setMessage({ text: data.error || "Error", type: "error" });
      }
    } catch {
      setMessage({ text: "Error de conexión", type: "error" });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeleteBanner(id: string) {
    if (!confirm("¿Eliminar este banner?")) return;
    setActionLoading(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/banners?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage({ text: "Banner eliminado", type: "success" });
        fetchBanners();
      } else {
        const data = await res.json();
        setMessage({ text: data.error || "Error", type: "error" });
      }
    } catch {
      setMessage({ text: "Error de conexión", type: "error" });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleToggleBanner(id: string, isActive: boolean) {
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/banners", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !isActive }),
      });
      if (res.ok) fetchBanners();
    } catch { /* ignore */ }
    finally { setActionLoading(null); }
  }

  // ─── Adult listings ──────────────────────────────────
  const fetchAdultListings = useCallback(async (page = 1) => {
    setAdultLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "12" });
      if (adultSearch) params.set("q", adultSearch);
      if (adultStatusFilter) params.set("status", adultStatusFilter);
      const res = await fetch(`/api/admin/adultos?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      setAdultListings(data.listings || []);
      setAdultPagination(data.pagination);
    } catch { /* ignore */ }
    finally { setAdultLoading(false); }
  }, [adultSearch, adultStatusFilter]);

  useEffect(() => {
    if (activeTab === "adultos") fetchAdultListings();
  }, [activeTab, fetchAdultListings]);

  async function handleDeleteAdult(id: string, code: string) {
    if (!confirm(`¿Eliminar anuncio adulto ${code}? Esta acción no se puede deshacer.`)) return;
    setActionLoading(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/adultos?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: data.message, type: "success" });
        fetchAdultListings(adultPagination?.page || 1);
      } else {
        setMessage({ text: data.error || "Error", type: "error" });
      }
    } catch {
      setMessage({ text: "Error de conexión", type: "error" });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleAdultPromote(id: string) {
    if (!adultPromoteAmount || parseFloat(adultPromoteAmount) <= 0) {
      setMessage({ text: "Ingresa un monto válido", type: "error" });
      return;
    }
    setActionLoading(id);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/adultos/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adultListingId: id, days: adultPromoteDays, amount: adultPromoteAmount, note: adultPromoteNote || undefined }),
      });
      if (res.ok) {
        setMessage({ text: `Destacado por ${adultPromoteDays} días`, type: "success" });
        setAdultPromoting(null);
        setAdultPromoteAmount("");
        setAdultPromoteNote("");
        fetchAdultListings(adultPagination?.page || 1);
      } else {
        const data = await res.json();
        setMessage({ text: data.error || "Error", type: "error" });
      }
    } catch {
      setMessage({ text: "Error de conexión", type: "error" });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleAdultUnpromote(id: string) {
    if (!confirm("¿Quitar destacado?")) return;
    setActionLoading(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/adultos/promote?adultListingId=${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage({ text: "Destacado removido", type: "success" });
        fetchAdultListings(adultPagination?.page || 1);
      } else {
        const data = await res.json();
        setMessage({ text: data.error || "Error", type: "error" });
      }
    } catch {
      setMessage({ text: "Error de conexión", type: "error" });
    } finally {
      setActionLoading(null);
    }
  }

  // ─── Offers ──────────────────────────────────
  const fetchOffers = useCallback(async (page = 1) => {
    setOffersLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "12" });
      if (offersSearch) params.set("q", offersSearch);
      const res = await fetch(`/api/admin/offers?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      setOffersList(data.offers || []);
      setOffersPagination(data.pagination);
    } catch { /* ignore */ }
    finally { setOffersLoading(false); }
  }, [offersSearch]);

  useEffect(() => {
    if (activeTab === "ofertas") fetchOffers();
  }, [activeTab, fetchOffers]);

  async function handleDeleteOffer(id: string, code: string) {
    if (!confirm(`¿Eliminar la oferta ${code}? Esta acción no se puede deshacer.`)) return;
    setActionLoading(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/offers?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: data.message, type: "success" });
        fetchOffers(offersPagination?.page || 1);
      } else {
        setMessage({ text: data.error || "Error", type: "error" });
      }
    } catch {
      setMessage({ text: "Error de conexión", type: "error" });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleOfferPromote(id: string) {
    if (!offersPromoteAmount || parseFloat(offersPromoteAmount) <= 0) {
      setMessage({ text: "Ingresa un monto válido", type: "error" });
      return;
    }
    setActionLoading(id);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/offers/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId: id, days: offersPromoteDays, amount: offersPromoteAmount, note: offersPromoteNote || undefined }),
      });
      if (res.ok) {
        setMessage({ text: `Oferta destacada por ${offersPromoteDays} días`, type: "success" });
        setOffersPromoting(null);
        setOffersPromoteAmount("");
        setOffersPromoteNote("");
        fetchOffers(offersPagination?.page || 1);
      } else {
        const data = await res.json();
        setMessage({ text: data.error || "Error", type: "error" });
      }
    } catch {
      setMessage({ text: "Error de conexión", type: "error" });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleOfferUnpromote(id: string) {
    if (!confirm("¿Quitar destacado de esta oferta?")) return;
    setActionLoading(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/offers/promote?offerId=${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessage({ text: "Destacado removido", type: "success" });
        fetchOffers(offersPagination?.page || 1);
      } else {
        const data = await res.json();
        setMessage({ text: data.error || "Error", type: "error" });
      }
    } catch {
      setMessage({ text: "Error de conexión", type: "error" });
    } finally {
      setActionLoading(null);
    }
  }

  if (authorized === false) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-red-400 mb-4 block">shield</span>
          <h1 className="text-2xl font-bold text-on-surface mb-2">Acceso denegado</h1>
          <p className="text-on-surface-variant">No tienes permisos de administrador.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-on-surface tracking-tight">Panel Admin</h1>
        <p className="text-on-surface-variant mt-1">Gestión de anuncios, ofertas, destacados, banners y sección adultos</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-surface-low rounded-xl p-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("listings")}
          className={`shrink-0 px-3 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
            activeTab === "listings" ? "bg-primary text-on-primary shadow-md" : "text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          <span className="material-symbols-outlined align-middle sm:mr-1.5 text-base">list_alt</span>
          <span className="hidden sm:inline">Anuncios</span>
        </button>
        <button
          onClick={() => setActiveTab("ofertas")}
          className={`shrink-0 px-3 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
            activeTab === "ofertas" ? "bg-amber-600 text-white shadow-md" : "text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          <span className="material-symbols-outlined align-middle sm:mr-1.5 text-base">local_offer</span>
          <span className="hidden sm:inline">Ofertas</span>
        </button>
        <button
          onClick={() => setActiveTab("banners")}
          className={`shrink-0 px-3 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
            activeTab === "banners" ? "bg-primary text-on-primary shadow-md" : "text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          <span className="material-symbols-outlined align-middle sm:mr-1.5 text-base">ad</span>
          <span className="hidden sm:inline">Banners</span>
        </button>
        <button
          onClick={() => setActiveTab("pricing")}
          className={`shrink-0 px-3 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
            activeTab === "pricing" ? "bg-primary text-on-primary shadow-md" : "text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          <span className="material-symbols-outlined align-middle sm:mr-1.5 text-base">payments</span>
          <span className="hidden sm:inline">Precios</span>
        </button>
        <button
          onClick={() => setActiveTab("adultos")}
          className={`shrink-0 px-3 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
            activeTab === "adultos" ? "bg-rose-600 text-white shadow-md" : "text-on-surface-variant hover:bg-surface-container"
          }`}
        >
          <span className="material-symbols-outlined align-middle sm:mr-1.5 text-base">18_up_rating</span>
          <span className="hidden sm:inline">Adultos</span>
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-semibold ${
          message.type === "success" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
        }`}>
          {message.text}
        </div>
      )}

      {/* ─── LISTINGS TAB ─── */}
      {activeTab === "listings" && (<>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por código FDP, título o email..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-lowest border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
        >
          Buscar
        </button>
      </form>

      {/* Status filter + Stats */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { value: "", label: "Todos" },
            { value: "ACTIVE", label: "Activos" },
            { value: "PAUSED", label: "Pausados" },
            { value: "SOLD", label: "Vendidos" },
            { value: "REMOVED", label: "Removidos" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === opt.value
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-surface-low text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {pagination && (
          <span className="text-sm text-on-surface-variant">
            {pagination.total} anuncios
          </span>
        )}
      </div>

      {/* Listings table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {listings.map((listing) => {
              const activePromo = listing.promotions?.find((p) => p.isActive);
              const isPromoting = promoting === listing.id;

              return (
                <div
                  key={listing.id}
                  className={`bg-surface-lowest rounded-2xl p-4 border-2 transition-all ${
                    listing.isFeatured ? "border-amber-300 shadow-md" : "border-transparent"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Image */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-surface-low shrink-0 relative">
                      {listing.images[0]?.url ? (
                        <Image src={listing.images[0].url} alt="" fill sizes="80px" className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-2xl text-on-surface-variant/20">image</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          <span className="material-symbols-outlined" style={{ fontSize: "10px" }}>tag</span>
                          <span className="font-mono">{listing.code}</span>
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[listing.status] || "bg-slate-100 text-slate-600"}`}>
                          {listing.status}
                        </span>
                        {listing.isFeatured && (
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            <span className="material-symbols-outlined" style={{ fontSize: "11px", fontVariationSettings: "'FILL' 1" }}>star</span>
                            Destacado {activePromo ? `(${daysRemaining(activePromo.endDate)}d restantes)` : ""}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-on-surface truncate">{listing.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-on-surface-variant mt-1 flex-wrap">
                        <span className="font-bold text-primary">{formatPrice(listing.price, (listing as { currency?: string }).currency as "CUP" | "USD" | "MLC" | undefined)}</span>
                        <span>{listing.location}</span>
                        <span>{listing.user.email}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="shrink-0 flex flex-col gap-1.5">
                      {listing.isFeatured ? (
                        <button
                          onClick={() => handleUnpromote(listing.id)}
                          disabled={actionLoading === listing.id}
                          className="px-3 py-2 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-colors disabled:opacity-50"
                        >
                          {actionLoading === listing.id ? "..." : "Quitar destacado"}
                        </button>
                      ) : listing.status === "ACTIVE" ? (
                        <button
                          onClick={() => setPromoting(isPromoting ? null : listing.id)}
                          className="px-3 py-2 rounded-lg bg-amber-50 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors"
                        >
                          <span className="material-symbols-outlined align-middle mr-1" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>star</span>
                          Destacar
                        </button>
                      ) : (
                        <span className="text-[10px] text-on-surface-variant/50 text-center">No activo</span>
                      )}
                      <button
                        onClick={() => handleDeleteListing(listing.id, listing.code)}
                        disabled={actionLoading === listing.id}
                        className="px-3 py-2 rounded-lg bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === listing.id ? "..." : "Eliminar"}
                      </button>
                    </div>
                  </div>

                  {/* Promote form */}
                  {isPromoting && (
                    <div className="mt-4 pt-4 border-t border-outline-variant/15">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-1 block">Días</label>
                          <select
                            value={promoteDays}
                            onChange={(e) => setPromoteDays(parseInt(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg bg-surface-low text-sm border-none focus:ring-2 focus:ring-primary/30"
                          >
                            <option value={3}>3 días</option>
                            <option value={7}>7 días</option>
                            <option value={15}>15 días</option>
                            <option value={30}>30 días</option>
                            <option value={60}>60 días</option>
                            <option value={90}>90 días</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-1 block">Monto (CUP)</label>
                          <input
                            type="number"
                            value={promoteAmount}
                            onChange={(e) => setPromoteAmount(e.target.value)}
                            placeholder="10000"
                            className="w-full px-3 py-2 rounded-lg bg-surface-low text-sm border-none focus:ring-2 focus:ring-primary/30"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-1 block">Nota (opcional)</label>
                          <input
                            type="text"
                            value={promoteNote}
                            onChange={(e) => setPromoteNote(e.target.value)}
                            placeholder="Transferencia #123"
                            className="w-full px-3 py-2 rounded-lg bg-surface-low text-sm border-none focus:ring-2 focus:ring-primary/30"
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <button
                            onClick={() => handlePromote(listing.id)}
                            disabled={actionLoading === listing.id}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-bold text-sm hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50"
                          >
                            {actionLoading === listing.id ? "..." : "Confirmar"}
                          </button>
                          <button
                            onClick={() => setPromoting(null)}
                            className="px-3 py-2 bg-surface-low text-on-surface-variant rounded-lg text-sm hover:bg-surface-container transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pagination.totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => fetchListings(i + 1)}
                  className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                    pagination.page === i + 1
                      ? "bg-primary text-on-primary shadow-md"
                      : "text-on-surface-variant hover:bg-primary/10"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}

          {listings.length === 0 && !loading && (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-3 block">search_off</span>
              <p className="text-on-surface-variant">No se encontraron anuncios</p>
            </div>
          )}
        </>
      )}

      </>)}

      {/* ─── PRICING TAB ─── */}
      {activeTab === "pricing" && (
        <div className="space-y-8">
          <p className="text-sm text-on-surface-variant">
            Guía de precios sugeridos para los servicios de la plataforma. Estos valores son referenciales para el cobro manual.
          </p>

          {/* Anuncios Destacados */}
          <div className="bg-surface-lowest rounded-2xl p-6 border border-outline-variant/15">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface">Anuncios Destacados</h3>
                <p className="text-xs text-on-surface-variant">El anuncio aparece primero en su categoría y en la página principal</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { days: 3, price: "$300 CUP" },
                { days: 7, price: "$700 CUP" },
                { days: 15, price: "$1300 CUP" },
                { days: 30, price: "$14.990" },
                { days: 60, price: "$24.990" },
                { days: 90, price: "$34.990" },
              ].map((plan) => (
                <div key={plan.days} className="bg-amber-50/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-amber-700">{plan.days}</div>
                  <div className="text-xs text-on-surface-variant mb-2">días</div>
                  <div className="text-sm font-bold text-on-surface">{plan.price}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-on-surface-variant space-y-1">
              <p>• Máximo 8 anuncios destacados por categoría</p>
              <p>• Los destacados se muestran con borde dorado y estrella</p>
              <p>• Al expirar, el anuncio vuelve a su posición normal automáticamente</p>
            </div>
          </div>

          {/* Ofertas Destacadas */}
          <div className="bg-surface-lowest rounded-2xl p-6 border border-outline-variant/15">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_offer</span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface">Ofertas Destacadas</h3>
                <p className="text-xs text-on-surface-variant">La oferta aparece primero en la sección de ofertas</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { days: 7, price: "$500 CUP" },
                { days: 15, price: "$1100 CUP" },
                { days: 30, price: "$11.990" },
                { days: 60, price: "$3000 CUP" },
                { days: 90, price: "$27.990" },
              ].map((plan) => (
                <div key={plan.days} className="bg-rose-50/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-rose-700">{plan.days}</div>
                  <div className="text-xs text-on-surface-variant mb-2">días</div>
                  <div className="text-sm font-bold text-on-surface">{plan.price}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-on-surface-variant space-y-1">
              <p>• Las ofertas destacadas se muestran primero en el directorio de ofertas</p>
              <p>• Incluyen badge visual de &quot;Destacado&quot;</p>
            </div>
          </div>

          {/* Banners */}
          <div className="bg-surface-lowest rounded-2xl p-6 border border-outline-variant/15">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined">ad</span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface">Banners Publicitarios</h3>
                <p className="text-xs text-on-surface-variant">Banner rotativo visible en la página principal para comercios</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { days: 7, price: "$14.990" },
                { days: 15, price: "$24.990" },
                { days: 30, price: "$6000 CUP" },
                { days: 60, price: "$10500 CUP" },
                { days: 90, price: "$94.990" },
              ].map((plan) => (
                <div key={plan.days} className="bg-violet-50/50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-black text-violet-700">{plan.days}</div>
                  <div className="text-xs text-on-surface-variant mb-2">días</div>
                  <div className="text-sm font-bold text-on-surface">{plan.price}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-on-surface-variant space-y-1">
              <p>• Máximo 5 banners activos simultáneamente</p>
              <p>• Se rotan automáticamente en la página principal</p>
              <p>• Incluyen link al sitio web o red social del comercio</p>
              <p>• Se registran los clicks para métricas</p>
            </div>
          </div>

          {/* Nota general */}
          <div className="bg-teal-50/50 rounded-2xl p-6 border border-teal-200/30">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-teal-700 mt-0.5">info</span>
              <div className="text-sm text-on-surface-variant space-y-2">
                <p className="font-semibold text-on-surface">Notas generales</p>
                <p>• Los pagos se gestionan manualmente (transferencia bancaria, efectivo, etc.)</p>
                <p>• Al recibir el pago, activar la promoción desde la pestaña correspondiente</p>
                <p>• Publicar un anuncio es gratuito (máximo 10 imágenes por anuncio)</p>
                <p>• Los precios pueden ajustarse según demanda y temporada</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── BANNERS TAB ─── */}
      {activeTab === "banners" && (
        <div className="space-y-6">
          {/* Stats + Add button */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-on-surface-variant">
              {banners.filter((b) => b.isActive).length}/{maxBanners} slots activos
            </p>
            <button
              onClick={() => setShowBannerForm(!showBannerForm)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
              Nuevo Banner
            </button>
          </div>

          {/* Create banner form */}
          {showBannerForm && (
            <div className="bg-surface-lowest rounded-2xl p-6 border-2 border-primary/20 space-y-4">
              <h3 className="font-bold text-on-surface">Crear Banner</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-1 block">Nombre del comercio *</label>
                  <input
                    type="text"
                    value={bannerForm.businessName}
                    onChange={(e) => setBannerForm({ ...bannerForm, businessName: e.target.value })}
                    placeholder="Ferretería Don Pedro"
                    className="w-full px-3 py-2 rounded-lg bg-surface-low text-sm border-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-1 block">Imagen del banner *</label>
                  <div className="flex gap-2">
                    <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-surface-low text-sm cursor-pointer hover:bg-surface-container transition-colors ${uploadingBanner ? "opacity-50 pointer-events-none" : ""}`}>
                      <span className="material-symbols-outlined text-base text-primary">upload</span>
                      <span className="text-on-surface-variant">{uploadingBanner ? "Subiendo..." : bannerForm.imageUrl ? "Cambiar archivo" : "Subir imagen"}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} disabled={uploadingBanner} />
                    </label>
                  </div>
                  {bannerForm.imageUrl && (
                    <p className="text-[10px] text-emerald-600 font-medium mt-1 truncate">Imagen cargada</p>
                  )}
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-1 block">Link al comercio (opcional)</label>
                  <input
                    type="url"
                    value={bannerForm.linkUrl}
                    onChange={(e) => setBannerForm({ ...bannerForm, linkUrl: e.target.value })}
                    placeholder="https://instagram.com/..."
                    className="w-full px-3 py-2 rounded-lg bg-surface-low text-sm border-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-1 block">Duración</label>
                  <select
                    value={bannerForm.days}
                    onChange={(e) => setBannerForm({ ...bannerForm, days: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-surface-low text-sm border-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="7">7 días</option>
                    <option value="15">15 días</option>
                    <option value="30">30 días</option>
                    <option value="60">60 días</option>
                    <option value="90">90 días</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-1 block">Monto (CUP) *</label>
                  <input
                    type="number"
                    value={bannerForm.amount}
                    onChange={(e) => setBannerForm({ ...bannerForm, amount: e.target.value })}
                    placeholder="50000"
                    className="w-full px-3 py-2 rounded-lg bg-surface-low text-sm border-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-1 block">Nota (opcional)</label>
                  <input
                    type="text"
                    value={bannerForm.note}
                    onChange={(e) => setBannerForm({ ...bannerForm, note: e.target.value })}
                    placeholder="Transferencia #456"
                    className="w-full px-3 py-2 rounded-lg bg-surface-low text-sm border-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              {bannerForm.imageUrl && (
                <div className="rounded-xl overflow-hidden bg-surface-low aspect-[5/1] max-w-lg relative">
                  <Image src={bannerForm.imageUrl} alt="Preview" fill sizes="512px" className="object-cover" />
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleCreateBanner}
                  disabled={actionLoading === "banner-create"}
                  className="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-bold text-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {actionLoading === "banner-create" ? "Creando..." : "Crear Banner"}
                </button>
                <button
                  onClick={() => setShowBannerForm(false)}
                  className="px-4 py-2.5 bg-surface-low text-on-surface-variant rounded-lg text-sm hover:bg-surface-container transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Banners list */}
          {bannersLoading ? (
            <div className="flex justify-center py-20">
              <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
            </div>
          ) : banners.length > 0 ? (
            <div className="space-y-3">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className={`bg-surface-lowest rounded-2xl p-4 border-2 transition-all ${
                    banner.isActive ? "border-primary/20" : "border-transparent opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Preview */}
                    <div className="w-32 sm:w-48 rounded-xl overflow-hidden bg-surface-low shrink-0 aspect-[5/2] relative">
                      <Image src={banner.imageUrl} alt={banner.businessName} fill sizes="192px" className="object-cover" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold text-on-surface">{banner.businessName}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          banner.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                        }`}>
                          {banner.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-on-surface-variant mt-1">
                        <span>{daysRemaining(banner.endDate)}d restantes</span>
                        <span>{formatPrice(banner.amount)}</span>
                        <span>{banner.clicks} clicks</span>
                        {banner.linkUrl && (
                          <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            Ver link
                          </a>
                        )}
                      </div>
                      {banner.note && (
                        <p className="text-xs text-on-surface-variant/70 mt-1 italic">{banner.note}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="shrink-0 flex flex-col gap-1.5">
                      <button
                        onClick={() => handleToggleBanner(banner.id, banner.isActive)}
                        disabled={actionLoading === banner.id}
                        className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                          banner.isActive
                            ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        {banner.isActive ? "Pausar" : "Activar"}
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(banner.id)}
                        disabled={actionLoading === banner.id}
                        className="px-3 py-2 rounded-lg bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-3 block">ad</span>
              <p className="text-on-surface-variant">No hay banners creados</p>
            </div>
          )}
        </div>
      )}

      {/* ─── OFERTAS TAB ─── */}
      {activeTab === "ofertas" && (
        <div className="space-y-6">
          {/* Search */}
          <form onSubmit={(e) => { e.preventDefault(); setOffersSearch(offersSearchInput); }} className="flex gap-2">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
              <input
                type="text"
                value={offersSearchInput}
                onChange={(e) => setOffersSearchInput(e.target.value)}
                placeholder="Buscar por código OFR, título o negocio..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-lowest border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            </div>
            <button type="submit" className="px-6 py-3 bg-amber-600 text-white rounded-xl font-bold text-sm hover:bg-amber-700 transition-colors">
              Buscar
            </button>
          </form>

          {/* Count */}
          {offersPagination && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-on-surface-variant">{offersPagination.total} ofertas</span>
            </div>
          )}

          {/* List */}
          {offersLoading ? (
            <div className="flex justify-center py-20">
              <span className="material-symbols-outlined text-4xl text-amber-400 animate-spin">progress_activity</span>
            </div>
          ) : offersList.length > 0 ? (
            <>
              <div className="space-y-3">
                {offersList.map((offer) => {
                  const activePromo = offer.promotions?.find((p) => p.isActive);
                  const isPromoting = offersPromoting === offer.id;
                  const expired = new Date(offer.expiresAt) <= new Date();
                  const daysLeft = Math.max(0, Math.ceil((new Date(offer.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                  return (
                    <div key={offer.id} className={`bg-surface-lowest rounded-2xl p-4 border-2 transition-all ${offer.isFeatured ? "border-amber-300 shadow-md" : "border-transparent"}`}>
                      {/* Info */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="inline-flex items-center gap-1 bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                            <span className="material-symbols-outlined" style={{ fontSize: "10px" }}>tag</span>
                            <span className="font-mono">{offer.code}</span>
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            expired ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"
                          }`}>
                            {expired ? "Expirada" : `${daysLeft}d restantes`}
                          </span>
                          {offer.isFeatured && (
                            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              <span className="material-symbols-outlined" style={{ fontSize: "11px", fontVariationSettings: "'FILL' 1" }}>star</span>
                              Destacado {activePromo ? `(${daysRemaining(activePromo.endDate)}d)` : ""}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-on-surface truncate">{offer.title}</h3>
                        <div className="flex items-center gap-2 sm:gap-3 text-xs text-on-surface-variant mt-1 flex-wrap">
                          <span className="font-semibold text-amber-700">{offer.businessName}</span>
                          <span className="truncate">{offer.address}</span>
                          <span>{offer.viewCount} visitas</span>
                          <span className="hidden sm:inline">{offer.user.email}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {offer.isFeatured ? (
                          <button
                            onClick={() => handleOfferUnpromote(offer.id)}
                            disabled={actionLoading === offer.id}
                            className="flex-1 px-3 py-2.5 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === offer.id ? "..." : "Quitar destacado"}
                          </button>
                        ) : !expired ? (
                          <button
                            onClick={() => setOffersPromoting(isPromoting ? null : offer.id)}
                            className="flex-1 px-3 py-2.5 rounded-lg bg-amber-50 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors"
                          >
                            <span className="material-symbols-outlined align-middle mr-1" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>star</span>
                            Destacar
                          </button>
                        ) : (
                          <span className="flex-1 text-[10px] text-on-surface-variant/50 text-center py-2.5">Expirada</span>
                        )}
                        <button
                          onClick={() => handleDeleteOffer(offer.id, offer.code)}
                          disabled={actionLoading === offer.id}
                          className="px-4 py-2.5 rounded-lg bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          {actionLoading === offer.id ? "..." : "Eliminar"}
                        </button>
                      </div>

                      {/* Promote form */}
                      {isPromoting && (
                        <div className="mt-4 pt-4 border-t border-outline-variant/15">
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div>
                              <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-1 block">Días</label>
                              <select
                                value={offersPromoteDays}
                                onChange={(e) => setOffersPromoteDays(parseInt(e.target.value))}
                                className="w-full px-3 py-2 rounded-lg bg-surface-low text-sm border-none focus:ring-2 focus:ring-amber-500/30"
                              >
                                <option value={7}>7 días</option>
                                <option value={15}>15 días</option>
                                <option value={30}>30 días</option>
                                <option value={60}>60 días</option>
                                <option value={90}>90 días</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-1 block">Monto (CUP)</label>
                              <input
                                type="number"
                                value={offersPromoteAmount}
                                onChange={(e) => setOffersPromoteAmount(e.target.value)}
                                placeholder="15000"
                                className="w-full px-3 py-2 rounded-lg bg-surface-low text-sm border-none focus:ring-2 focus:ring-amber-500/30"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-1 block">Nota (opcional)</label>
                              <input
                                type="text"
                                value={offersPromoteNote}
                                onChange={(e) => setOffersPromoteNote(e.target.value)}
                                placeholder="Transferencia #789"
                                className="w-full px-3 py-2 rounded-lg bg-surface-low text-sm border-none focus:ring-2 focus:ring-amber-500/30"
                              />
                            </div>
                            <div className="flex items-end gap-2">
                              <button
                                onClick={() => handleOfferPromote(offer.id)}
                                disabled={actionLoading === offer.id}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg font-bold text-sm hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-50"
                              >
                                {actionLoading === offer.id ? "..." : "Confirmar"}
                              </button>
                              <button
                                onClick={() => setOffersPromoting(null)}
                                className="px-3 py-2 bg-surface-low text-on-surface-variant rounded-lg text-sm hover:bg-surface-container transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {offersPagination && offersPagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: offersPagination.totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => fetchOffers(i + 1)}
                      className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                        offersPagination.page === i + 1
                          ? "bg-amber-600 text-white shadow-md"
                          : "text-on-surface-variant hover:bg-amber-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-3 block">local_offer</span>
              <p className="text-on-surface-variant">No hay ofertas registradas</p>
            </div>
          )}
        </div>
      )}

      {/* ─── ADULTOS TAB ─── */}
      {activeTab === "adultos" && (
        <div className="space-y-6">
          {/* Search */}
          <form onSubmit={(e) => { e.preventDefault(); setAdultSearch(adultSearchInput); }} className="flex gap-2">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl">search</span>
              <input
                type="text"
                value={adultSearchInput}
                onChange={(e) => setAdultSearchInput(e.target.value)}
                placeholder="Buscar por código ADL, alias o título..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-lowest border border-outline-variant/20 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              />
            </div>
            <button type="submit" className="px-6 py-3 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 transition-colors">
              Buscar
            </button>
          </form>

          {/* Status filter */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { value: "", label: "Todos" },
                { value: "ACTIVE", label: "Activos" },
                { value: "PAUSED", label: "Pausados" },
                { value: "REMOVED", label: "Removidos" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setAdultStatusFilter(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    adultStatusFilter === opt.value
                      ? "bg-rose-600 text-white shadow-sm"
                      : "bg-surface-low text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {adultPagination && (
              <span className="text-sm text-on-surface-variant">{adultPagination.total} anuncios</span>
            )}
          </div>

          {/* List */}
          {adultLoading ? (
            <div className="flex justify-center py-20">
              <span className="material-symbols-outlined text-4xl text-rose-400 animate-spin">progress_activity</span>
            </div>
          ) : adultListings.length > 0 ? (
            <>
              <div className="space-y-3">
                {adultListings.map((listing) => {
                  const activePromo = listing.promotions?.find((p) => p.isActive);
                  const isPromoting = adultPromoting === listing.id;
                  return (
                    <div key={listing.id} className={`bg-surface-lowest rounded-2xl p-4 border-2 transition-all ${listing.isFeatured ? "border-rose-300 shadow-md" : "border-transparent"}`}>
                      <div className="flex items-start gap-4">
                        {/* Image */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-surface-low shrink-0 relative">
                          {listing.images[0]?.url ? (
                            <Image src={listing.images[0].url} alt="" fill sizes="80px" className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-2xl text-on-surface-variant/20">person</span>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="inline-flex items-center gap-1 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                              <span className="material-symbols-outlined" style={{ fontSize: "10px" }}>tag</span>
                              <span className="font-mono">{listing.code}</span>
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              listing.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"
                            }`}>
                              {listing.status}
                            </span>
                            {listing.isFeatured && (
                              <span className="inline-flex items-center gap-1 bg-gradient-to-r from-rose-400 to-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                <span className="material-symbols-outlined" style={{ fontSize: "11px", fontVariationSettings: "'FILL' 1" }}>star</span>
                                Destacado {activePromo ? `(${daysRemaining(activePromo.endDate)}d)` : ""}
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-bold text-on-surface truncate">{listing.title}</h3>
                          <div className="flex items-center gap-3 text-xs text-on-surface-variant mt-1 flex-wrap">
                            <span className="font-semibold text-rose-600">{listing.alias}</span>
                            <span>{listing.serviceType}</span>
                            <span>{listing.location}</span>
                            <span>{listing.user.email}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="shrink-0 flex flex-col gap-1.5">
                          {listing.isFeatured ? (
                            <button
                              onClick={() => handleAdultUnpromote(listing.id)}
                              disabled={actionLoading === listing.id}
                              className="px-3 py-2 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition-colors disabled:opacity-50"
                            >
                              {actionLoading === listing.id ? "..." : "Quitar destacado"}
                            </button>
                          ) : listing.status === "ACTIVE" ? (
                            <button
                              onClick={() => setAdultPromoting(isPromoting ? null : listing.id)}
                              className="px-3 py-2 rounded-lg bg-rose-50 text-rose-800 text-xs font-bold hover:bg-rose-100 transition-colors"
                            >
                              <span className="material-symbols-outlined align-middle mr-1" style={{ fontSize: "14px", fontVariationSettings: "'FILL' 1" }}>star</span>
                              Destacar
                            </button>
                          ) : (
                            <span className="text-[10px] text-on-surface-variant/50 text-center">No activo</span>
                          )}
                          <button
                            onClick={() => handleDeleteAdult(listing.id, listing.code)}
                            disabled={actionLoading === listing.id}
                            className="px-3 py-2 rounded-lg bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === listing.id ? "..." : "Eliminar"}
                          </button>
                        </div>
                      </div>

                      {/* Promote form */}
                      {isPromoting && (
                        <div className="mt-4 pt-4 border-t border-outline-variant/15">
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div>
                              <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-1 block">Días</label>
                              <select
                                value={adultPromoteDays}
                                onChange={(e) => setAdultPromoteDays(parseInt(e.target.value))}
                                className="w-full px-3 py-2 rounded-lg bg-surface-low text-sm border-none focus:ring-2 focus:ring-rose-500/30"
                              >
                                <option value={7}>7 días</option>
                                <option value={15}>15 días</option>
                                <option value={30}>30 días</option>
                                <option value={60}>60 días</option>
                                <option value={90}>90 días</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-1 block">Monto (CUP)</label>
                              <input
                                type="number"
                                value={adultPromoteAmount}
                                onChange={(e) => setAdultPromoteAmount(e.target.value)}
                                placeholder="15000"
                                className="w-full px-3 py-2 rounded-lg bg-surface-low text-sm border-none focus:ring-2 focus:ring-rose-500/30"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide mb-1 block">Nota (opcional)</label>
                              <input
                                type="text"
                                value={adultPromoteNote}
                                onChange={(e) => setAdultPromoteNote(e.target.value)}
                                placeholder="Transferencia #789"
                                className="w-full px-3 py-2 rounded-lg bg-surface-low text-sm border-none focus:ring-2 focus:ring-rose-500/30"
                              />
                            </div>
                            <div className="flex items-end gap-2">
                              <button
                                onClick={() => handleAdultPromote(listing.id)}
                                disabled={actionLoading === listing.id}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg font-bold text-sm hover:from-rose-600 hover:to-pink-700 transition-all disabled:opacity-50"
                              >
                                {actionLoading === listing.id ? "..." : "Confirmar"}
                              </button>
                              <button
                                onClick={() => setAdultPromoting(null)}
                                className="px-3 py-2 bg-surface-low text-on-surface-variant rounded-lg text-sm hover:bg-surface-container transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {adultPagination && adultPagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: adultPagination.totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => fetchAdultListings(i + 1)}
                      className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                        adultPagination.page === i + 1
                          ? "bg-rose-600 text-white shadow-md"
                          : "text-on-surface-variant hover:bg-rose-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-3 block">18_up_rating</span>
              <p className="text-on-surface-variant">No hay anuncios en la sección adultos</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

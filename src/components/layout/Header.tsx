"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { regions, type Region } from "@/lib/regions";
import type { User } from "@supabase/supabase-js";

/* nav links rendered inline below */

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const [regionView, setRegionView] = useState<"regions" | "comunas">("regions");
  const [activeRegion, setActiveRegion] = useState<Region | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [selectedComunaId, setSelectedComunaId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const regionRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (selectedRegionId) params.set("region", selectedRegionId);
    if (selectedComunaId) params.set("comuna", selectedComunaId);
    router.push(`/busqueda${params.toString() ? `?${params}` : ""}`);
    setMobileMenuOpen(false);
  }

  function selectAllCuba() {
    setSelectedRegionId(null);
    setSelectedComunaId(null);
    setRegionOpen(false);
    setRegionView("regions");
    setActiveRegion(null);
  }

  function selectRegion(region: Region) {
    setActiveRegion(region);
    setRegionView("comunas");
  }

  function selectWholeRegion(region: Region) {
    setSelectedRegionId(region.id);
    setSelectedComunaId(null);
    setRegionOpen(false);
    setRegionView("regions");
    setActiveRegion(null);
  }

  function selectComuna(region: Region, comunaId: string) {
    setSelectedRegionId(region.id);
    setSelectedComunaId(comunaId);
    setRegionOpen(false);
    setRegionView("regions");
    setActiveRegion(null);
  }

  function closeRegionDropdown() {
    setRegionOpen(false);
    setRegionView("regions");
    setActiveRegion(null);
  }

  // Display label for the location button
  const locationLabel = (() => {
    if (!selectedRegionId) return "Toda Cuba";
    const region = regions.find((r) => r.id === selectedRegionId);
    if (!region) return "Toda Cuba";
    if (selectedComunaId) {
      const comuna = region.comunas.find((c) => c.id === selectedComunaId);
      return comuna ? comuna.name : region.shortName;
    }
    return region.shortName;
  })();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Usuario";

  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl shadow-[0_1px_10px_rgba(0,0,0,0.02)] transition-all duration-300">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 w-full mx-auto max-w-7xl">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0 group"
        >
          <div className="relative w-9 h-9 bg-gradient-to-br from-primary to-teal-500 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300 rotate-3 group-hover:rotate-0">
            <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              storefront
            </span>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">
              La
            </span>
            <span className="text-lg font-black bg-gradient-to-r from-teal-700 via-primary to-cyan-600 bg-clip-text text-transparent -mt-0.5">
              Cuevita
            </span>
          </div>
        </Link>

        {/* Pill animations */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes pillPulseTeal {
            0%, 100% { box-shadow: 0 0 0 0 rgba(13, 148, 136, 0.4); }
            50% { box-shadow: 0 0 14px 4px rgba(13, 148, 136, 0.25); }
          }
          @keyframes pillPulseCyan {
            0%, 100% { box-shadow: 0 0 0 0 rgba(8, 145, 178, 0.4); }
            50% { box-shadow: 0 0 14px 4px rgba(8, 145, 178, 0.25); }
          }
          @keyframes pillPulseAmber {
            0%, 100% { box-shadow: 0 0 0 0 rgba(217, 119, 6, 0.4); }
            50% { box-shadow: 0 0 14px 4px rgba(217, 119, 6, 0.25); }
          }
          .pill-nav {
            transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .pill-nav:hover {
            transform: translateY(-3px) scale(1.06);
          }
          .pill-nav:active {
            transform: translateY(0) scale(0.96);
          }
        `}} />

        {/* Nav + Search + Actions */}
        <div className="flex items-center gap-2 lg:gap-4 ml-4 lg:ml-8 min-w-0">
          <nav className="hidden md:flex gap-3 items-center shrink-0">
            <Link
              href="/categorias"
              className="pill-nav flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap text-teal-800 border border-teal-200 bg-teal-100"
              style={{ animation: "pillPulseTeal 3s ease-in-out infinite" }}
            >
              <span className="material-symbols-outlined text-lg">category</span>
              Categorías
            </Link>
            <Link
              href="/comunidad"
              className="pill-nav flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap text-cyan-800 border border-cyan-200 bg-cyan-100"
              style={{ animation: "pillPulseCyan 3s ease-in-out 1s infinite" }}
            >
              <span className="material-symbols-outlined text-lg">groups</span>
              Comunidad
            </Link>
            <Link
              href="/ofertas"
              className="pill-nav flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap text-amber-800 border border-amber-200 bg-amber-100"
              style={{ animation: "pillPulseAmber 3s ease-in-out 2s infinite" }}
            >
              <span className="material-symbols-outlined text-lg">local_offer</span>
              Ofertas
            </Link>
            <Link
              href="/adultos"
              className="pill-nav flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap text-rose-800 border border-rose-200 bg-rose-100"
              style={{ animation: "pillPulseAmber 3s ease-in-out 3s infinite" }}
            >
              <span className="material-symbols-outlined text-lg">18_up_rating</span>
              +18
            </Link>
          </nav>

          {/* Search bar + Region - desktop */}
          <form
            onSubmit={handleSearch}
            className="hidden xl:flex items-center bg-surface-low rounded-full border border-outline-variant/15"
          >
            {/* Region selector */}
            <div className="relative" ref={regionRef}>
              <button
                type="button"
                onClick={() => {
                  if (regionOpen) {
                    closeRegionDropdown();
                  } else {
                    setRegionOpen(true);
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-on-surface-variant hover:text-primary transition-colors border-r border-outline-variant/15 whitespace-nowrap"
              >
                <span className="material-symbols-outlined text-lg">
                  location_on
                </span>
                <span className="max-w-[120px] truncate">{locationLabel}</span>
                <span className="material-symbols-outlined text-base">
                  {regionOpen ? "expand_less" : "expand_more"}
                </span>
              </button>

              {regionOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={closeRegionDropdown}
                  />
                  <div className="absolute left-0 top-11 z-50 bg-surface-lowest rounded-xl shadow-xl border border-outline-variant/10 py-2 w-80 max-h-96 overflow-y-auto">
                    {regionView === "regions" ? (
                      <>
                        <button
                          type="button"
                          onClick={selectAllCuba}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                            !selectedRegionId
                              ? "text-primary font-bold bg-primary/5"
                              : "text-on-surface-variant hover:bg-surface-low hover:text-primary"
                          }`}
                        >
                          Toda Cuba
                        </button>
                        <div className="h-px bg-outline-variant/15 my-1" />
                        {regions.map((region) => (
                          <button
                            type="button"
                            key={region.id}
                            onClick={() => selectRegion(region)}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between group ${
                              selectedRegionId === region.id
                                ? "text-primary font-bold bg-primary/5"
                                : "text-on-surface-variant hover:bg-surface-low hover:text-primary"
                            }`}
                          >
                            <span>{region.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-outline-variant">
                                {region.romanNumeral}
                              </span>
                              <span className="material-symbols-outlined text-base opacity-50 group-hover:opacity-100">
                                chevron_right
                              </span>
                            </div>
                          </button>
                        ))}
                      </>
                    ) : activeRegion ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setRegionView("regions");
                            setActiveRegion(null);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-low hover:text-primary transition-colors flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-base">
                            arrow_back
                          </span>
                          Volver a provincias
                        </button>
                        <div className="h-px bg-outline-variant/15 my-1" />
                        <div className="px-4 py-2">
                          <p className="text-xs font-bold text-secondary uppercase tracking-wider">
                            {activeRegion.name}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => selectWholeRegion(activeRegion)}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors font-medium ${
                            selectedRegionId === activeRegion.id && !selectedComunaId
                              ? "text-primary font-bold bg-primary/5"
                              : "text-on-surface-variant hover:bg-surface-low hover:text-primary"
                          }`}
                        >
                          Toda la provincia
                        </button>
                        <div className="h-px bg-outline-variant/15 my-1" />
                        {activeRegion.comunas.map((comuna) => (
                          <button
                            type="button"
                            key={comuna.id}
                            onClick={() =>
                              selectComuna(activeRegion, comuna.id)
                            }
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                              selectedRegionId === activeRegion.id &&
                              selectedComunaId === comuna.id
                                ? "text-primary font-bold bg-primary/5"
                                : "text-on-surface-variant hover:bg-surface-low hover:text-primary"
                            }`}
                          >
                            {comuna.name}
                          </button>
                        ))}
                      </>
                    ) : null}
                  </div>
                </>
              )}
            </div>

            {/* Search input */}
            <div className="flex items-center px-3 py-2">
              <input
                className="bg-transparent border-none focus:outline-none text-sm w-40 xl:w-56 placeholder:text-on-surface-variant/60"
                placeholder="¿Qué estás buscando?"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="p-1 text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-xl">
                  search
                </span>
              </button>
            </div>
          </form>

          {user ? (
            <>
              {/* Quick action icons */}
              <div className="hidden sm:flex items-center gap-1">
                <Link
                  href="/favoritos"
                  className="p-2 rounded-full text-on-surface-variant hover:text-red-500 hover:bg-red-50 transition-colors"
                  aria-label="Mis Favoritos"
                >
                  <span className="material-symbols-outlined text-xl">favorite</span>
                </Link>
                <Link
                  href="/mis-anuncios"
                  className="p-2 rounded-full text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors"
                  aria-label="Mis Anuncios"
                >
                  <span className="material-symbols-outlined text-xl">list_alt</span>
                </Link>
                <Link
                  href="/ofertas/mis-ofertas"
                  className="p-2 rounded-full text-on-surface-variant hover:text-amber-600 hover:bg-amber-50 transition-colors"
                  aria-label="Mis Ofertas"
                >
                  <span className="material-symbols-outlined text-xl">local_offer</span>
                </Link>
                <Link
                  href="/adultos/mis-anuncios"
                  className="p-2 rounded-full text-on-surface-variant hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  aria-label="Mis Servicios +18"
                >
                  <span className="material-symbols-outlined text-xl">18_up_rating</span>
                </Link>
              </div>

              {/* User menu */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-surface-low transition-colors"
                >
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={displayName}
                      referrerPolicy="no-referrer"
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="hidden lg:block text-sm font-medium text-on-surface whitespace-nowrap">
                    {displayName}
                  </span>
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-12 z-50 bg-surface-lowest rounded-xl shadow-xl border border-outline-variant/10 py-2 w-56">
                      <div className="px-4 py-2 border-b border-outline-variant/15">
                        <p className="text-sm font-bold text-on-surface truncate">
                          {displayName}
                        </p>
                        <p className="text-xs text-on-surface-variant truncate">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        href="/mis-anuncios"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-low hover:text-primary transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <span className="material-symbols-outlined text-lg">
                          list_alt
                        </span>
                        Mis Anuncios
                      </Link>
                      <Link
                        href="/favoritos"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-low hover:text-primary transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <span className="material-symbols-outlined text-lg">
                          favorite
                        </span>
                        Mis Favoritos
                      </Link>
                      <Link
                        href="/adultos/mis-anuncios"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-low hover:text-rose-600 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <span className="material-symbols-outlined text-lg">
                          18_up_rating
                        </span>
                        Sección Adultos
                      </Link>
                      {user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-low hover:text-primary transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <span className="material-symbols-outlined text-lg">
                            admin_panel_settings
                          </span>
                          Admin
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error-container/30 transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">
                          logout
                        </span>
                        Cerrar Sesión
                      </button>
                    </div>
                  </>
                )}
              </div>

            </>
          ) : (
            <>
              {/* Not authenticated */}
              <Link
                href="/auth/login"
                className="pill-nav hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap bg-primary text-on-primary border border-primary"
              >
                <span className="material-symbols-outlined text-lg">login</span>
                Iniciar Sesión
              </Link>
            </>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-on-surface-variant hover:bg-surface-low rounded-full"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="material-symbols-outlined">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-outline-variant/15 px-6 py-4">
          {/* Mobile search */}
          <form onSubmit={handleSearch} className="flex items-center bg-surface-low rounded-full border border-outline-variant/15 mb-4">
            <input
              className="flex-1 bg-transparent border-none focus:outline-none text-sm placeholder:text-on-surface-variant/60 px-4 py-3"
              placeholder="¿Qué estás buscando?"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="p-3 text-on-surface-variant hover:text-primary">
              <span className="material-symbols-outlined">search</span>
            </button>
          </form>

          {/* Mobile location selector */}
          <button
            onClick={() => {
              if (regionOpen) {
                closeRegionDropdown();
              } else {
                setRegionOpen(true);
              }
            }}
            className="flex items-center gap-2 text-sm text-on-surface-variant mb-2 px-1"
          >
            <span className="material-symbols-outlined text-lg">location_on</span>
            <span>{locationLabel}</span>
            <span className="material-symbols-outlined text-base">
              {regionOpen ? "expand_less" : "expand_more"}
            </span>
          </button>

          {regionOpen && (
            <div className="bg-surface-lowest rounded-xl border border-outline-variant/10 py-2 mb-4 max-h-64 overflow-y-auto">
              {regionView === "regions" ? (
                <>
                  <button
                    onClick={selectAllCuba}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      !selectedRegionId
                        ? "text-primary font-bold bg-primary/5"
                        : "text-on-surface-variant hover:bg-surface-low hover:text-primary"
                    }`}
                  >
                    Toda Cuba
                  </button>
                  <div className="h-px bg-outline-variant/15 my-1" />
                  {regions.map((region) => (
                    <button
                      key={region.id}
                      onClick={() => selectRegion(region)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                        selectedRegionId === region.id
                          ? "text-primary font-bold bg-primary/5"
                          : "text-on-surface-variant hover:bg-surface-low hover:text-primary"
                      }`}
                    >
                      <span>{region.name}</span>
                      <span className="material-symbols-outlined text-base opacity-50">chevron_right</span>
                    </button>
                  ))}
                </>
              ) : activeRegion ? (
                <>
                  <button
                    onClick={() => {
                      setRegionView("regions");
                      setActiveRegion(null);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-on-surface-variant hover:bg-surface-low hover:text-primary transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Volver a provincias
                  </button>
                  <div className="h-px bg-outline-variant/15 my-1" />
                  <div className="px-4 py-2">
                    <p className="text-xs font-bold text-secondary uppercase tracking-wider">
                      {activeRegion.name}
                    </p>
                  </div>
                  <button
                    onClick={() => selectWholeRegion(activeRegion)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors font-medium ${
                      selectedRegionId === activeRegion.id && !selectedComunaId
                        ? "text-primary font-bold bg-primary/5"
                        : "text-on-surface-variant hover:bg-surface-low hover:text-primary"
                    }`}
                  >
                    Toda la provincia
                  </button>
                  <div className="h-px bg-outline-variant/15 my-1" />
                  {activeRegion.comunas.map((comuna) => (
                    <button
                      key={comuna.id}
                      onClick={() => selectComuna(activeRegion, comuna.id)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        selectedRegionId === activeRegion.id && selectedComunaId === comuna.id
                          ? "text-primary font-bold bg-primary/5"
                          : "text-on-surface-variant hover:bg-surface-low hover:text-primary"
                      }`}
                    >
                      {comuna.name}
                    </button>
                  ))}
                </>
              ) : null}
            </div>
          )}

          <nav className="flex flex-col gap-3">
            <Link
              href="/categorias"
              className="flex items-center gap-3 px-5 py-3 rounded-xl font-semibold transition-all duration-300 bg-teal-100 text-teal-800 border border-teal-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="material-symbols-outlined text-xl">category</span>
              Categorías
            </Link>
            <Link
              href="/comunidad"
              className="flex items-center gap-3 px-5 py-3 rounded-xl font-semibold transition-all duration-300 bg-cyan-100 text-cyan-800 border border-cyan-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="material-symbols-outlined text-xl">groups</span>
              Comunidad
            </Link>
            <Link
              href="/ofertas"
              className="flex items-center gap-3 px-5 py-3 rounded-xl font-semibold transition-all duration-300 bg-amber-100 text-amber-800 border border-amber-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="material-symbols-outlined text-xl">local_offer</span>
              Ofertas
            </Link>
            <Link
              href="/adultos"
              className="flex items-center gap-3 px-5 py-3 rounded-xl font-semibold transition-all duration-300 bg-rose-100 text-rose-800 border border-rose-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="material-symbols-outlined text-xl">18_up_rating</span>
              +18 Adultos
            </Link>
          </nav>

          {user ? (
            <div className="mt-4 pt-4 border-t border-outline-variant/15 space-y-3">
              <div className="flex items-center gap-3">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={displayName}
                    referrerPolicy="no-referrer"
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-bold text-sm">{displayName}</p>
                  <p className="text-xs text-on-surface-variant">
                    {user.email}
                  </p>
                </div>
              </div>
              <Link
                href="/mis-anuncios"
                className="flex items-center justify-center gap-2 text-primary font-semibold py-3 rounded-xl bg-primary/5 border border-primary/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-lg">list_alt</span>
                Mis Anuncios
              </Link>
              <Link
                href="/favoritos"
                className="flex items-center justify-center gap-2 text-primary font-semibold py-3 rounded-xl bg-primary/5 border border-primary/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-lg">favorite</span>
                Mis Favoritos
              </Link>
              <Link
                href="/ofertas/mis-ofertas"
                className="flex items-center justify-center gap-2 text-amber-700 font-semibold py-3 rounded-xl bg-amber-50 border border-amber-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-lg">local_offer</span>
                Mis Ofertas
              </Link>
              <Link
                href="/adultos/mis-anuncios"
                className="flex items-center justify-center gap-2 text-rose-700 font-semibold py-3 rounded-xl bg-rose-50 border border-rose-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="material-symbols-outlined text-lg">18_up_rating</span>
                Mis Servicios +18
              </Link>
              {user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL && (
                <Link
                  href="/admin"
                  className="flex items-center justify-center gap-2 text-primary font-semibold py-3 rounded-xl bg-primary/5 border border-primary/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
                  Admin
                </Link>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center text-error font-medium py-2"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="mt-4 pt-4 border-t border-outline-variant/15 space-y-3">
              <Link
                href="/auth/login"
                className="block text-center text-primary font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/auth/registro"
                className="block text-center bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-3 rounded-full font-semibold"
                onClick={() => setMobileMenuOpen(false)}
              >
                Crear Cuenta
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

"use client";

import { useState, useSyncExternalStore } from "react";

const STORAGE_KEY = "fdp_age_verified";

function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY) === "true";
}

function getServerSnapshot() {
  return false;
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

export default function AgeGate({ children }: { children: React.ReactNode }) {
  const storedVerified = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [confirmed, setConfirmed] = useState(false);
  const [checked, setChecked] = useState(false);

  const verified = storedVerified || confirmed;

  function handleConfirm() {
    if (!checked) return;
    localStorage.setItem(STORAGE_KEY, "true");
    setConfirmed(true);
  }

  function handleDeny() {
    window.location.href = "/";
  }

  if (verified) {
    return <>{children}</>;
  }

  // Age gate
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-surface to-surface-low">
      <div className="max-w-md w-full bg-surface-lowest rounded-3xl p-8 shadow-xl border border-outline-variant/10 text-center">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-3xl">18_up_rating</span>
        </div>

        <h1 className="text-2xl font-black text-on-surface mb-2">
          Contenido para adultos
        </h1>
        <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
          Esta sección contiene servicios y contenido dirigido exclusivamente a
          personas mayores de 18 años.
        </p>

        <label className="flex items-start gap-3 text-left mb-6 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-1 w-5 h-5 rounded border-2 border-outline-variant accent-rose-600"
          />
          <span className="text-sm text-on-surface-variant leading-relaxed">
            Declaro que soy mayor de 18 años y acepto acceder a este contenido
            bajo mi propia responsabilidad.
          </span>
        </label>

        <div className="flex gap-3">
          <button
            onClick={handleDeny}
            className="flex-1 py-3 rounded-xl bg-surface-low text-on-surface-variant font-semibold text-sm hover:bg-surface-container transition-colors"
          >
            Salir
          </button>
          <button
            onClick={handleConfirm}
            disabled={!checked}
            className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Entrar
          </button>
        </div>
      </div>
    </div>
  );
}

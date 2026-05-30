"use client";

import { useState } from "react";
import Image from "next/image";

interface BlurredImageProps {
  imageId: string;
  url: string;
  isPresentation: boolean;
  isBlurred?: boolean;
  alt: string;
  fill?: boolean;
  className?: string;
}

export default function BlurredImage({
  imageId,
  url,
  isPresentation,
  isBlurred: isBlurredProp,
  alt,
  fill = true,
  className = "",
}: BlurredImageProps) {
  const shouldBlur = isBlurredProp !== undefined ? isBlurredProp : !isPresentation;
  const [revealed, setRevealed] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isBlurred = shouldBlur && !revealed;

  async function handleReveal() {
    if (!code.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/adultos/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.imageId === imageId) {
        setRevealed(true);
        setShowCodeInput(false);
        setCode("");
      } else if (res.ok && data.imageId !== imageId) {
        setError("Este código es de otra imagen");
      } else {
        setError(data.error || "Código inválido");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`relative select-none w-full h-full overflow-hidden ${className}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {fill ? (
        <Image
          src={url}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover pointer-events-none"
          draggable={false}
        />
      ) : (
        <Image
          src={url}
          alt={alt}
          width={600}
          height={600}
          className="object-cover pointer-events-none w-full h-full"
          draggable={false}
        />
      )}

      {/* Anti-download overlay */}
      <div className="absolute inset-0 z-10" />

      {/* Blur + tint overlay using backdrop-filter */}
      {isBlurred && (
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center"
          style={{ backdropFilter: "blur(5px)", WebkitBackdropFilter: "blur(5px)" }}
        >
          {!showCodeInput ? (
            <div
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); setShowCodeInput(true); }}
              onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); setShowCodeInput(true); } }}
              className="flex flex-col items-center gap-2 text-white/90 hover:text-white transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-3xl">lock</span>
              <span className="text-xs font-bold">Ingresar código</span>
            </div>
          ) : (
            <div className="bg-black/70 backdrop-blur-sm rounded-xl p-4 mx-4 w-full max-w-[240px]">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="CÓDIGO"
                maxLength={8}
                className="w-full bg-white/10 text-white text-center text-sm font-mono tracking-widest px-3 py-2 rounded-lg border border-white/20 focus:outline-none focus:border-white/50 placeholder:text-white/40"
                onKeyDown={(e) => e.key === "Enter" && handleReveal()}
                autoFocus
              />
              {error && (
                <p className="text-red-400 text-[10px] text-center mt-1">{error}</p>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => {
                    setShowCodeInput(false);
                    setCode("");
                    setError("");
                  }}
                  className="flex-1 text-white/60 text-xs py-1.5 rounded-lg hover:text-white/80 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReveal}
                  disabled={loading || !code.trim()}
                  className="flex-1 bg-rose-600 text-white text-xs font-bold py-1.5 rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-40"
                >
                  {loading ? "..." : "Revelar"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

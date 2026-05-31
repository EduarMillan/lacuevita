"use client";

import { useState } from "react";

export default function PagePeel() {
  const [open, setOpen] = useState(false);

  const phone = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || "";
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent("Hola! Me interesa contratar un espacio de banner publicitario en Tu Cuevita. ¿Me pueden dar más información?")}`;

  return (
    <>
      <style>{`
        @keyframes peelWiggle {
          0%, 100% { width: 65px; height: 65px; }
          15% { width: 85px; height: 85px; }
          30% { width: 68px; height: 68px; }
          45% { width: 80px; height: 80px; }
          60% { width: 65px; height: 65px; }
        }
        @keyframes peelFoldSize {
          0%, 100% { border-width: 0 65px 65px 0; }
          15% { border-width: 0 85px 85px 0; }
          30% { border-width: 0 68px 68px 0; }
          45% { border-width: 0 80px 80px 0; }
          60% { border-width: 0 65px 65px 0; }
        }
        @keyframes peelShadow {
          0%, 100% { box-shadow: -2px 2px 5px rgba(0,0,0,0.15); }
          15% { box-shadow: -5px 5px 14px rgba(0,0,0,0.28); }
          30% { box-shadow: -3px 3px 7px rgba(0,0,0,0.18); }
          45% { box-shadow: -4px 4px 11px rgba(0,0,0,0.24); }
          60% { box-shadow: -2px 2px 5px rgba(0,0,0,0.15); }
        }

        .peel-wrap {
          position: absolute;
          top: 0;
          right: 0;
          z-index: 30;
          cursor: pointer;
          overflow: visible;
        }

        /* Red underside */
        .peel-under {
          position: absolute;
          top: 0;
          right: 0;
          width: 65px;
          height: 65px;
          background: linear-gradient(225deg, #dc2626 0%, #b91c1c 100%);
          animation: peelWiggle 3s ease-in-out infinite;
          transition: width 0.5s cubic-bezier(0.4,0,0.2,1), height 0.5s cubic-bezier(0.4,0,0.2,1), border-radius 0.5s;
          border-bottom-left-radius: 5px;
        }

        /* Metallic grey fold */
        .peel-fold {
          position: absolute;
          top: 0;
          right: 0;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 0 65px 65px 0;
          border-color: transparent #0d9488 transparent transparent;
          animation: peelFoldSize 3s ease-in-out infinite;
          transition: border-width 0.5s cubic-bezier(0.4,0,0.2,1);
          filter: drop-shadow(-2px 2px 3px rgba(0,0,0,0.2));
        }
        /* Metallic shine overlay */
        .peel-fold-shine {
          position: absolute;
          top: 0;
          right: 0;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 0 65px 65px 0;
          border-color: transparent transparent transparent transparent;
          animation: peelFoldSize 3s ease-in-out infinite;
          transition: border-width 0.5s cubic-bezier(0.4,0,0.2,1);
          pointer-events: none;
          opacity: 0.5;
          border-right-color: #5eead4;
        }

        /* Shadow */
        .peel-shadow {
          position: absolute;
          top: 0;
          right: 0;
          width: 65px;
          height: 65px;
          animation: peelWiggle 3s ease-in-out infinite, peelShadow 3s ease-in-out infinite;
          transition: width 0.5s, height 0.5s;
          pointer-events: none;
        }

        /* Text on the red flap */
        .peel-text {
          position: absolute;
          top: 0;
          right: 0;
          width: 65px;
          height: 65px;
          animation: peelWiggle 3s ease-in-out infinite;
          transition: width 0.5s, height 0.5s, opacity 0.3s;
          pointer-events: none;
          overflow: hidden;
        }
        .peel-text-inner {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: translate(-18%, 12%);
          white-space: nowrap;
        }
        .peel-text-inner span {
          transform: rotate(45deg);
        }

        /* ─── Open state ─── */
        .peel-wrap.is-open .peel-under {
          width: 320px;
          height: 310px;
          animation: none;
          border-bottom-left-radius: 8px;
        }
        .peel-wrap.is-open .peel-fold {
          border-width: 0 320px 310px 0;
          border-right-color: #b91c1c;
          animation: none;
        }
        .peel-wrap.is-open .peel-fold-shine {
          border-width: 0 320px 310px 0;
          animation: none;
          opacity: 0;
        }
        .peel-wrap.is-open .peel-shadow {
          width: 320px;
          height: 310px;
          animation: none;
          box-shadow: -6px 6px 20px rgba(0,0,0,0.25);
        }
        .peel-wrap.is-open .peel-text {
          opacity: 0;
          animation: none;
        }

        /* Info panel */
        .peel-info {
          position: absolute;
          top: 0;
          right: 0;
          width: 320px;
          height: 310px;
          padding: 18px 18px 18px 55px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.35s 0.1s;
        }
        .peel-wrap.is-open .peel-info {
          opacity: 1;
          pointer-events: auto;
        }

        /* ─── Mobile ─── */
        @media (max-width: 640px) {
          .peel-under, .peel-shadow, .peel-text {
            width: 55px;
            height: 55px;
          }
          .peel-fold, .peel-fold-shine {
            border-width: 0 55px 55px 0;
          }
          @keyframes peelWiggle {
            0%, 100% { width: 55px; height: 55px; }
            15% { width: 72px; height: 72px; }
            30% { width: 58px; height: 58px; }
            45% { width: 68px; height: 68px; }
            60% { width: 55px; height: 55px; }
          }
          @keyframes peelFoldSize {
            0%, 100% { border-width: 0 55px 55px 0; }
            15% { border-width: 0 72px 72px 0; }
            30% { border-width: 0 58px 58px 0; }
            45% { border-width: 0 68px 68px 0; }
            60% { border-width: 0 55px 55px 0; }
          }
          .peel-wrap.is-open .peel-under {
            width: 280px;
            height: 290px;
          }
          .peel-wrap.is-open .peel-fold {
            border-width: 0 280px 290px 0;
            border-right-color: #b91c1c;
          }
          .peel-wrap.is-open .peel-fold-shine {
            border-width: 0 280px 290px 0;
            opacity: 0;
          }
          .peel-wrap.is-open .peel-shadow {
            width: 280px;
            height: 290px;
          }
          .peel-info {
            width: 280px;
            height: 290px;
            padding: 14px 14px 14px 40px;
          }
        }
      `}</style>

      <div
        className={`peel-wrap ${open ? "is-open" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <div className="peel-shadow" />
        <div className="peel-under" />
        <div className="peel-fold" />
        <div className="peel-fold-shine" />

        {/* Text on the red flap */}
        <div className="peel-text">
          <div className="peel-text-inner">
            <span className="text-yellow-300 text-[9px] sm:text-[10px] font-extrabold tracking-wide drop-shadow">
              ¡MIRA AQUÍ!
            </span>
          </div>
        </div>

        {/* Info panel */}
        <div className="peel-info">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-300 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
                <h4 className="text-[13px] font-extrabold text-white tracking-tight">
                  ¡Anuncia tu negocio!
                </h4>
              </div>
              <span className="material-symbols-outlined text-white/40 text-lg">close</span>
            </div>

            <p className="text-[11px] text-white/85 leading-relaxed">
              Muestra tu comercio a toda la comunidad con un <strong className="text-white">banner publicitario</strong> en la página principal.
            </p>

            <ul className="space-y-1.5 text-[11px] text-white/85">
              <li className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-yellow-300 text-sm">check_circle</span>
                Visible para todos los visitantes
              </li>
              <li className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-yellow-300 text-sm">check_circle</span>
                Link directo a tu negocio
              </li>
              <li className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-yellow-300 text-sm">check_circle</span>
                Planes desde 7 días
              </li>
              <li className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-yellow-300 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                <span className="font-bold text-yellow-300">Solo 5 espacios disponibles</span>
              </li>
            </ul>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-2 bg-[#25D366] text-white py-2.5 rounded-lg font-bold text-xs hover:bg-[#20BD5A] active:scale-95 transition-all"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

import Link from "next/link";

const navigationLinks = [
  { label: "Categorías", href: "/categorias" },
  { label: "Comunidad", href: "/comunidad" },
];

const supportLinks = [
  { label: "Ayuda", href: "/ayuda" },
  { label: "Privacidad", href: "/privacidad" },
  { label: "Términos", href: "/terminos" },
  { label: "+18", href: "/adultos" },
];

export default function Footer() {
  return (
    <footer className="bg-teal-800 w-full py-12 px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {/* Brand */}
        <div>
          <div className="text-lg font-black text-white mb-4">
            Tu Cuevita
          </div>
          <p className="text-teal-300/60 text-sm leading-relaxed">
            El rincón de la comunidad cubana. Compra, vende e intercambia con
            tus vecinos en toda la Isla.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-col space-y-4">
          <span className="text-xs uppercase tracking-widest text-teal-400 font-bold">
            Explorar
          </span>
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-teal-300/60 hover:text-teal-300 transition-colors text-xs uppercase tracking-widest"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Support */}
        <div className="flex flex-col space-y-4">
          <span className="text-xs uppercase tracking-widest text-teal-400 font-bold">
            Soporte
          </span>
          {supportLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-teal-300/60 hover:text-teal-300 transition-colors text-xs uppercase tracking-widest"
            >
              {link.label}
            </Link>
          ))}
        </div>

      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-teal-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="text-teal-600 text-xs uppercase tracking-widest">
          © 2026 Tu Cuevita - Marketplace Comunitario
        </span>
        <div className="flex gap-6">
          <span className="material-symbols-outlined text-teal-700">
            credit_card
          </span>
          <span className="material-symbols-outlined text-teal-700">
            shield
          </span>
          <span className="material-symbols-outlined text-teal-700">
            verified_user
          </span>
        </div>
      </div>
    </footer>
  );
}

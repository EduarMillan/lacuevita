import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
  title: "Centro de Ayuda",
  description:
    "Aprende a usar La Cuevita: cómo publicar, buscar, contactar vendedores y más.",
  alternates: { canonical: "/ayuda" },
};

const faqs = [
  {
    icon: "person_add",
    question: "¿Cómo creo una cuenta?",
    answer:
      "Haz clic en \"Iniciar Sesión\" en la esquina superior derecha. Puedes registrarte con tu correo electrónico o directamente con tu cuenta de Google. Solo necesitas un nombre, email y contraseña.",
  },
  {
    icon: "add_circle",
    question: "¿Cómo publico un anuncio?",
    answer:
      "Haz clic en el botón \"Publicar Anuncio\" que aparece en el menú superior. Completa el formulario con el título, descripción, precio, categoría, ubicación, teléfono de contacto y al menos una foto de tu artículo. Acepta los términos y condiciones y listo.",
  },
  {
    icon: "photo_camera",
    question: "¿Cuántas fotos puedo subir?",
    answer:
      "Puedes subir hasta 10 fotos por anuncio. Te recomendamos incluir varias fotos desde distintos ángulos para que los compradores tengan una buena idea del estado del producto.",
  },
  {
    icon: "search",
    question: "¿Cómo busco un producto?",
    answer:
      "Usa la barra de búsqueda en la parte superior para buscar por nombre. También puedes filtrar por categoría, región y comuna para encontrar artículos cerca de ti.",
  },
  {
    icon: "call",
    question: "¿Cómo contacto a un vendedor?",
    answer:
      "Entra al anuncio que te interesa y verás los botones de \"Llamar al Vendedor\" y \"WhatsApp\". El contacto es directo entre comprador y vendedor — La Cuevita no interviene en la comunicación ni en la transacción.",
  },
  {
    icon: "favorite",
    question: "¿Cómo guardo anuncios en favoritos?",
    answer:
      "Toca el ícono de corazón que aparece en la esquina de cada anuncio. Para ver todos tus favoritos, ve a \"Mis Favoritos\" desde el menú de tu perfil o el ícono de corazón en la barra superior. Necesitas tener una cuenta para usar esta función.",
  },
  {
    icon: "edit",
    question: "¿Puedo editar o pausar mi anuncio?",
    answer:
      "Sí. Ve a \"Mis Anuncios\" desde el menú de tu perfil. Ahí puedes editar la información, pausar el anuncio temporalmente o eliminarlo. Los anuncios pausados por más de 7 días se eliminan automáticamente.",
  },
  {
    icon: "star",
    question: "¿Qué son los anuncios destacados?",
    answer:
      "Los anuncios destacados aparecen primero en los resultados y tienen un borde dorado que los hace más visibles. Puedes destacar tu anuncio desde \"Mis Anuncios\" eligiendo un plan de 7, 15 o 30 días.",
  },
  {
    icon: "tag",
    question: "¿Qué es el código LC?",
    answer:
      "Cada anuncio recibe un código único con formato LC-XXXXXX. Este código sirve para identificar y hacer seguimiento de tu publicación.",
  },
  {
    icon: "security",
    question: "¿Es seguro comprar y vender aquí?",
    answer:
      "La Cuevita es un espacio para que la comunidad publique y encuentre artículos. Te recomendamos: verificar el producto antes de pagar, reunirte en lugares públicos y seguros, no enviar dinero por adelantado, y desconfiar de ofertas demasiado buenas para ser verdad.",
  },
  {
    icon: "report",
    question: "¿Qué hago si veo un anuncio sospechoso?",
    answer:
      "Si encuentras un anuncio con contenido prohibido (pornografía, drogas, artículos ilegales) o que parece fraudulento, puedes reportarlo. Revisamos los reportes y eliminamos las publicaciones que violen nuestros términos y condiciones.",
  },
  {
    icon: "delete",
    question: "¿Puedo eliminar mi cuenta?",
    answer:
      "Sí. Puedes solicitar la eliminación de tu cuenta y todos tus datos asociados contactándonos a través de los canales disponibles en la plataforma. Al eliminar tu cuenta, todos tus anuncios y favoritos serán eliminados permanentemente.",
  },
];

export default function AyudaPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-400 via-blue-400 to-indigo-400">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        </div>
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 max-w-7xl mx-auto relative z-10">
          <Breadcrumbs
            items={[
              { label: "Inicio", href: "/" },
              { label: "Ayuda" },
            ]}
          />
          <div className="mt-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/30 backdrop-blur-md px-3 sm:px-4 py-1.5 rounded-full mb-3">
              <span className="material-symbols-outlined text-blue-900 text-lg">
                help
              </span>
              <span className="text-sm font-semibold text-blue-900 tracking-wide">
                Centro de ayuda
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-2 leading-[1.1]">
              ¿Cómo podemos ayudarte?
            </h1>
            <p className="text-sm sm:text-lg text-blue-900/80 max-w-xl leading-relaxed">
              Encuentra respuestas a las preguntas más frecuentes sobre la plataforma.
            </p>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="space-y-4">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group bg-surface-lowest rounded-2xl border border-outline-variant/10 overflow-hidden"
            >
              <summary className="flex items-center gap-4 px-5 sm:px-6 py-4 sm:py-5 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-xl">
                    {faq.icon}
                  </span>
                </div>
                <span className="text-sm sm:text-base font-bold text-on-surface flex-1">
                  {faq.question}
                </span>
                <span className="material-symbols-outlined text-on-surface-variant text-xl transition-transform duration-300 group-open:rotate-180">
                  expand_more
                </span>
              </summary>
              <div className="px-5 sm:px-6 pb-5 sm:pb-6 pl-[4.25rem] sm:pl-[4.75rem]">
                <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </details>
          ))}
        </div>

        <div className="mt-12 text-center bg-surface-low rounded-2xl p-8 sm:p-12">
          <span className="material-symbols-outlined text-4xl text-primary mb-4 block">
            chat
          </span>
          <h3 className="text-lg font-bold text-on-surface mb-2">
            ¿No encontraste lo que buscabas?
          </h3>
          <p className="text-sm text-on-surface-variant mb-6">
            Revisa nuestros términos y condiciones para más información sobre el uso de la plataforma.
          </p>
          <Link
            href="/terminos"
            className="inline-flex bg-gradient-to-r from-primary to-primary-container text-on-primary px-8 py-3 rounded-full font-semibold shadow-lg"
          >
            Ver Términos y Condiciones
          </Link>
        </div>
      </section>
    </>
  );
}

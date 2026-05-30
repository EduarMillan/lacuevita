import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Política de privacidad y protección de datos de La Cuevita.",
  alternates: { canonical: "/privacidad" },
};

export default function PrivacidadPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        </div>
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 max-w-7xl mx-auto relative z-10">
          <Breadcrumbs
            items={[
              { label: "Inicio", href: "/" },
              { label: "Política de Privacidad" },
            ]}
          />
          <div className="mt-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 sm:px-4 py-1.5 rounded-full mb-3">
              <span className="material-symbols-outlined text-white text-lg">
                shield
              </span>
              <span className="text-sm font-semibold text-white tracking-wide">
                Privacidad
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-2 leading-[1.1]">
              Política de Privacidad
            </h1>
            <p className="text-sm sm:text-lg text-purple-100 max-w-xl leading-relaxed">
              Cómo recopilamos, usamos y protegemos tu información.
            </p>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="space-y-8 text-on-surface-variant text-sm sm:text-base leading-relaxed">
          <p className="text-xs text-on-surface-variant/60">
            Última actualización: abril de 2026
          </p>

          {/* 1 */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-on-surface mb-3">
              1. Información que recopilamos
            </h2>
            <p>
              Al usar <strong>La Cuevita</strong>, podemos recopilar la siguiente
              información:
            </p>

            <h3 className="text-base font-bold text-on-surface mt-4 mb-2">
              1.1 Información que tú proporcionas
            </h3>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>
                <strong>Registro de cuenta:</strong> nombre completo, dirección de correo
                electrónico y contraseña. Si te registras con Google, recibimos tu nombre,
                email y foto de perfil asociada a tu cuenta de Google.
              </li>
              <li>
                <strong>Publicación de anuncios:</strong> título, descripción, precio, condición
                del artículo, categoría, ubicación (región y comuna), teléfono de contacto e
                imágenes del producto.
              </li>
              <li>
                <strong>Perfil profesional:</strong> si creas un perfil en la sección Comunidad,
                recopilamos la información que incluyas como servicios ofrecidos, descripción y
                datos de contacto.
              </li>
            </ul>

            <h3 className="text-base font-bold text-on-surface mt-4 mb-2">
              1.2 Información recopilada automáticamente
            </h3>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>
                <strong>Datos de uso:</strong> páginas visitadas, anuncios vistos, búsquedas
                realizadas y acciones dentro de la plataforma (como guardar favoritos).
              </li>
              <li>
                <strong>Datos técnicos:</strong> dirección IP, tipo de navegador, dispositivo,
                sistema operativo y zona horaria.
              </li>
              <li>
                <strong>Cookies:</strong> utilizamos cookies esenciales para mantener tu sesión
                activa y recordar tus preferencias. No utilizamos cookies de seguimiento
                publicitario de terceros.
              </li>
            </ul>
          </div>

          {/* 2 */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-on-surface mb-3">
              2. Cómo usamos tu información
            </h2>
            <p>Utilizamos la información recopilada para:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1.5">
              <li>Crear y gestionar tu cuenta de usuario.</li>
              <li>Publicar y mostrar tus anuncios a otros usuarios.</li>
              <li>
                Permitir que compradores interesados te contacten a través de los datos de
                contacto que proporcionas en tus anuncios.
              </li>
              <li>Gestionar el sistema de favoritos y promociones.</li>
              <li>Mejorar el funcionamiento y la experiencia de uso de la plataforma.</li>
              <li>Prevenir actividades fraudulentas o que violen nuestros términos.</li>
              <li>
                Enviarte notificaciones relacionadas con tu cuenta o anuncios (por ejemplo,
                confirmación de registro).
              </li>
            </ul>
          </div>

          {/* 3 */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-on-surface mb-3">
              3. Información visible para otros usuarios
            </h2>
            <p>Al publicar un anuncio, la siguiente información será visible públicamente:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1.5">
              <li>Tu nombre de usuario.</li>
              <li>El contenido del anuncio (título, descripción, precio, fotos, ubicación).</li>
              <li>Tu número de teléfono de contacto (si lo proporcionas en el anuncio).</li>
            </ul>
            <p className="mt-2">
              <strong>Tu correo electrónico y contraseña nunca son visibles</strong> para otros
              usuarios.
            </p>
          </div>

          {/* 4 */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-on-surface mb-3">
              4. Compartición de datos con terceros
            </h2>
            <p>
              <strong>No vendemos, alquilamos ni compartimos tu información personal con
              terceros</strong> con fines comerciales o publicitarios.
            </p>
            <p className="mt-2">Podemos compartir información únicamente en los siguientes casos:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1.5">
              <li>
                <strong>Proveedores de servicios:</strong> utilizamos servicios de terceros para
                el funcionamiento de la plataforma (autenticación, almacenamiento de datos e
                imágenes). Estos proveedores tienen acceso limitado a tus datos y están obligados
                a protegerlos.
              </li>
              <li>
                <strong>Obligación legal:</strong> si es requerido por ley, orden judicial o
                autoridad competente.
              </li>
              <li>
                <strong>Protección de derechos:</strong> para proteger la seguridad de los
                usuarios o investigar posibles violaciones a nuestros términos.
              </li>
            </ul>
          </div>

          {/* 5 */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-on-surface mb-3">
              5. Almacenamiento y seguridad
            </h2>
            <p>
              Tus datos se almacenan en servidores seguros proporcionados por nuestros proveedores
              de infraestructura. Implementamos medidas de seguridad razonables para proteger tu
              información, incluyendo:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1.5">
              <li>Cifrado de contraseñas (nunca almacenamos contraseñas en texto plano).</li>
              <li>Conexiones seguras (HTTPS) para toda la comunicación con la plataforma.</li>
              <li>Autenticación segura mediante proveedores especializados.</li>
            </ul>
            <p className="mt-2">
              Sin embargo, ningún sistema es completamente invulnerable. No podemos garantizar la
              seguridad absoluta de tus datos, aunque hacemos nuestro mejor esfuerzo por
              protegerlos.
            </p>
          </div>

          {/* 6 */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-on-surface mb-3">
              6. Retención de datos
            </h2>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>
                Tu cuenta y datos asociados se mantienen mientras tu cuenta esté activa.
              </li>
              <li>
                Los anuncios pausados por más de 7 días se eliminan automáticamente.
              </li>
              <li>
                Si solicitas la eliminación de tu cuenta, todos tus datos personales, anuncios,
                favoritos e imágenes serán eliminados de forma permanente.
              </li>
              <li>
                Podemos retener cierta información anonimizada con fines estadísticos.
              </li>
            </ul>
          </div>

          {/* 7 */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-on-surface mb-3">
              7. Tus derechos
            </h2>
            <p>Como usuario, tienes derecho a:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1.5">
              <li>
                <strong>Acceder</strong> a la información personal que tenemos sobre ti.
              </li>
              <li>
                <strong>Rectificar</strong> datos incorrectos o desactualizados editando tu
                perfil o anuncios.
              </li>
              <li>
                <strong>Eliminar</strong> tu cuenta y todos los datos asociados.
              </li>
              <li>
                <strong>Revocar</strong> el consentimiento para el uso de tus datos en cualquier
                momento, lo que puede implicar la imposibilidad de seguir usando la plataforma.
              </li>
            </ul>
            <p className="mt-2">
              Para ejercer estos derechos, puedes contactarnos a través de los canales disponibles
              en la plataforma.
            </p>
          </div>

          {/* 8 */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-on-surface mb-3">
              8. Menores de edad
            </h2>
            <p>
              La Cuevita no está dirigida a menores de 18 años. No recopilamos
              intencionalmente información de menores. Si descubrimos que un menor ha creado una
              cuenta, la eliminaremos junto con toda la información asociada.
            </p>
          </div>

          {/* 9 */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-on-surface mb-3">
              9. Cambios a esta política
            </h2>
            <p>
              Podemos actualizar esta Política de Privacidad ocasionalmente. Los cambios se
              publicarán en esta misma página con la fecha de actualización. El uso continuado de
              la plataforma después de cualquier modificación constituye la aceptación de la nueva
              política.
            </p>
          </div>

          {/* 10 */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-on-surface mb-3">
              10. Contacto
            </h2>
            <p>
              Si tienes preguntas sobre esta Política de Privacidad o deseas ejercer tus derechos
              sobre tus datos personales, puedes contactarnos a través de los canales disponibles
              en la plataforma.
            </p>
          </div>

          {/* Separator */}
          <div className="border-t border-outline-variant/20 pt-8 mt-8">
            <p className="text-center text-sm text-on-surface-variant/60">
              Al utilizar La Cuevita, confirmas que has leído y aceptado esta Política
              de Privacidad.
            </p>
            <div className="text-center mt-6">
              <Link
                href="/"
                className="inline-flex bg-gradient-to-r from-primary to-primary-container text-on-primary px-8 py-3 rounded-full font-semibold shadow-lg"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

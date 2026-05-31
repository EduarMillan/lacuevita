import Link from "next/link";
import type { Metadata } from "next";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description:
    "Términos y condiciones de uso de la plataforma Tu Cuevita.",
  alternates: { canonical: "/terminos" },
};

export default function TerminosPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-500 via-slate-600 to-slate-700">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        </div>
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 max-w-7xl mx-auto relative z-10">
          <Breadcrumbs
            items={[
              { label: "Inicio", href: "/" },
              { label: "Términos y Condiciones" },
            ]}
          />
          <div className="mt-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 sm:px-4 py-1.5 rounded-full mb-3">
              <span className="material-symbols-outlined text-white text-lg">
                gavel
              </span>
              <span className="text-sm font-semibold text-white tracking-wide">
                Legal
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-2 leading-[1.1]">
              Términos y Condiciones
            </h1>
            <p className="text-sm sm:text-lg text-slate-200 max-w-xl leading-relaxed">
              Lee atentamente antes de usar nuestra plataforma.
            </p>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="prose prose-slate max-w-none space-y-8 text-on-surface-variant text-sm sm:text-base leading-relaxed">
          <p className="text-xs text-on-surface-variant/60">
            Última actualización: abril de 2026
          </p>

          {/* 1 */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-on-surface mb-3">
              1. Aceptación de los términos
            </h2>
            <p>
              Al acceder, registrarte o utilizar la plataforma <strong>Tu Cuevita</strong> (en
              adelante, &quot;la Plataforma&quot;), aceptas cumplir estos Términos y Condiciones en su
              totalidad. Si no estás de acuerdo con alguna de estas disposiciones, te pedimos que no
              utilices la Plataforma.
            </p>
          </div>

          {/* 2 */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-on-surface mb-3">
              2. Naturaleza de la Plataforma
            </h2>
            <p>
              Tu Cuevita es un espacio digital comunitario que permite a sus usuarios
              publicar, buscar y contactar vendedores de productos nuevos y usados, servicios
              locales. <strong>La Plataforma actúa únicamente como intermediario tecnológico</strong> y
              no participa en las transacciones entre usuarios, no verifica la calidad de los
              productos publicados, ni garantiza la veracidad de la información proporcionada por los
              anunciantes.
            </p>
            <p className="mt-2">
              Tu Cuevita es un emprendimiento independiente, no constituye una empresa
              formalmente establecida y no ofrece garantías comerciales de ningún tipo.
            </p>
          </div>

          {/* 3 */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-on-surface mb-3">
              3. Exención de responsabilidad
            </h2>
            <p>
              <strong>Tu Cuevita no se hace responsable, bajo ninguna circunstancia,
              por:</strong>
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1.5">
              <li>
                Daños, pérdidas, perjuicios o inconvenientes derivados de las transacciones
                realizadas entre usuarios.
              </li>
              <li>
                La calidad, seguridad, legalidad o veracidad de los artículos o servicios publicados.
              </li>
              <li>
                La capacidad de los usuarios para completar una compraventa o intercambio.
              </li>
              <li>
                Problemas de entrega, pagos, estafas, fraudes o cualquier conflicto entre
                compradores y vendedores.
              </li>
              <li>
                El incumplimiento por parte de los usuarios de las leyes locales, regionales o
                nacionales aplicables.
              </li>
              <li>
                El uso indebido de la información personal compartida entre usuarios a través de la
                Plataforma.
              </li>
            </ul>
            <p className="mt-3">
              Cada usuario es el único responsable de verificar la identidad de la contraparte, la
              autenticidad del producto y las condiciones de la transacción antes de concretarla.
              Recomendamos realizar encuentros en lugares públicos y seguros.
            </p>
          </div>

          {/* 4 */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-on-surface mb-3">
              4. Contenido prohibido
            </h2>
            <p>
              Queda estrictamente prohibido publicar anuncios que contengan o promuevan:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1.5">
              <li>
                <strong>Material pornográfico o de contenido sexual explícito</strong>, incluyendo
                imágenes, videos, descripciones o enlaces a dicho material.
              </li>
              <li>
                <strong>Sustancias narcóticas, drogas ilegales o estupefacientes</strong> de cualquier
                tipo, incluyendo su venta, distribución, promoción o apología.
              </li>
              <li>
                <strong>Productos dañinos para la salud</strong>, tales como medicamentos sin
                autorización sanitaria, sustancias tóxicas, productos adulterados o cualquier
                artículo que represente un riesgo para la integridad física de las personas.
              </li>
              <li>
                Armas de fuego, municiones, explosivos o armas blancas cuya comercialización esté
                regulada o prohibida por la ley cubana.
              </li>
              <li>
                Artículos robados, falsificados o de procedencia ilícita.
              </li>
              <li>
                Contenido que incite al odio, la violencia, la discriminación o el acoso hacia
                cualquier persona o grupo.
              </li>
              <li>
                Publicaciones engañosas, fraudulentas o que induzcan a error a otros usuarios.
              </li>
            </ul>
            <p className="mt-3">
              La Plataforma se reserva el derecho de eliminar cualquier anuncio que viole estas
              disposiciones y de suspender o cancelar la cuenta del usuario infractor sin previo
              aviso.
            </p>
          </div>

          {/* 5 */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-on-surface mb-3">
              5. Registro y cuenta de usuario
            </h2>
            <p>
              Para publicar anuncios es necesario crear una cuenta. Al registrarte, te comprometes a:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1.5">
              <li>Proporcionar información veraz y actualizada.</li>
              <li>Mantener la confidencialidad de tus credenciales de acceso.</li>
              <li>
                Ser el único responsable de las actividades realizadas con tu cuenta.
              </li>
            </ul>
            <p className="mt-2">
              Tu Cuevita se reserva el derecho de suspender o eliminar cuentas que
              infrinjan estos términos o que permanezcan inactivas por períodos prolongados.
            </p>
          </div>

          {/* 6 */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-on-surface mb-3">
              6. Anuncios y publicaciones
            </h2>
            <ul className="list-disc pl-6 space-y-1.5">
              <li>
                Los usuarios son los únicos responsables del contenido de sus anuncios, incluyendo
                textos, imágenes, precios y datos de contacto.
              </li>
              <li>
                Los anuncios que no reciban interacción o que permanezcan en estado
                &quot;pausado&quot; por más de 7 días podrán ser eliminados automáticamente.
              </li>
              <li>
                La Plataforma podrá destacar anuncios mediante su sistema de promociones pagadas,
                lo cual no implica verificación ni respaldo del producto o vendedor.
              </li>
              <li>
                Cada anuncio recibe un código único de identificación (formato LC-XXXXXX) para
                facilitar su seguimiento.
              </li>
            </ul>
          </div>

          {/* 7 */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-on-surface mb-3">
              7. Privacidad y datos personales
            </h2>
            <p>
              La Plataforma recopila y almacena datos básicos necesarios para su funcionamiento
              (nombre, correo electrónico, teléfono de contacto). Estos datos no serán vendidos ni
              compartidos con terceros con fines comerciales. Al publicar un anuncio, el usuario
              acepta que su información de contacto sea visible para otros usuarios interesados.
            </p>
          </div>

          {/* 8 */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-on-surface mb-3">
              8. Propiedad intelectual
            </h2>
            <p>
              El diseño, logotipo, nombre y estructura de Tu Cuevita son propiedad de sus
              creadores. Las imágenes y contenidos publicados por los usuarios son responsabilidad
              exclusiva de quienes los publican, y no podrán infringir derechos de autor o propiedad
              intelectual de terceros.
            </p>
          </div>

          {/* 9 */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-on-surface mb-3">
              9. Limitación de garantías
            </h2>
            <p>
              La Plataforma se proporciona &quot;tal cual&quot; y &quot;según disponibilidad&quot;.
              No garantizamos que el servicio sea ininterrumpido, libre de errores o completamente
              seguro. Nos reservamos el derecho de modificar, suspender o descontinuar cualquier
              aspecto de la Plataforma en cualquier momento y sin previo aviso.
            </p>
          </div>

          {/* 10 */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-on-surface mb-3">
              10. Modificaciones a los términos
            </h2>
            <p>
              Tu Cuevita se reserva el derecho de actualizar estos Términos y Condiciones
              en cualquier momento. Las modificaciones entrarán en vigor desde su publicación en la
              Plataforma. El uso continuado del servicio después de cualquier cambio implica la
              aceptación de los nuevos términos.
            </p>
          </div>

          {/* 11 */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-on-surface mb-3">
              11. Legislación aplicable
            </h2>
            <p>
              Estos términos se rigen por las leyes de la República de Cuba. Cualquier controversia
              derivada del uso de la Plataforma será sometida a los tribunales competentes del
              domicilio del usuario.
            </p>
          </div>

          {/* 12 */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-on-surface mb-3">
              12. Contacto
            </h2>
            <p>
              Si tienes preguntas sobre estos términos, puedes contactarnos a través de los canales
              disponibles en la Plataforma.
            </p>
          </div>

          {/* Separator */}
          <div className="border-t border-outline-variant/20 pt-8 mt-8">
            <p className="text-center text-sm text-on-surface-variant/60">
              Al utilizar Tu Cuevita, confirmas que has leído, entendido y aceptado estos
              Términos y Condiciones en su totalidad.
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

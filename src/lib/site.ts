export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.lacuevita.com";

export const SITE_NAME = "La Cuevita";

export const SITE_DESCRIPTION =
  "Marketplace comunitario cubano para comprar, vender e intercambiar productos, ofrecer servicios y encontrar empleo. Conecta con vecinos en toda Cuba.";

export const SITE_LOCALE = "es_CU";

export function absoluteUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

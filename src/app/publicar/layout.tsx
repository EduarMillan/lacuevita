import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Publicar anuncio",
  description: "Publica tu anuncio gratis en Tu Cuevita.",
  robots: { index: false, follow: false },
};

export default function PublicarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

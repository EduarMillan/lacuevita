import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mis anuncios",
  robots: { index: false, follow: false },
};

export default function MisAnunciosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

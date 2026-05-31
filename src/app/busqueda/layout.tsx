import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Buscar anuncios",
  description:
    "Busca productos nuevos y usados, vehículos, vivienda, empleos y servicios en Tu Cuevita. Filtra por categoría, ubicación y precio.",
  alternates: { canonical: "/busqueda" },
};

export default function BusquedaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense>{children}</Suspense>;
}

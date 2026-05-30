import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Adultos",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdultosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

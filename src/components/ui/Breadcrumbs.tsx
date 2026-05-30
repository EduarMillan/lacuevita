import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  variant?: "default" | "light";
}

export default function Breadcrumbs({ items, variant = "default" }: BreadcrumbsProps) {
  const isLight = variant === "light";
  return (
    <nav className={`flex items-center gap-2 text-sm font-medium tracking-wide flex-wrap ${
      isLight ? "text-white/60" : "text-on-surface-variant"
    }`}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={item.label} className="flex items-center gap-2">
            {index > 0 && (
              <span className="material-symbols-outlined text-xs">
                chevron_right
              </span>
            )}
            {isLast || !item.href ? (
              <span className={`font-medium ${isLight ? "text-white" : "text-on-surface"}`}>{item.label}</span>
            ) : (
              <Link href={item.href} className={isLight ? "hover:text-white" : "hover:text-primary"}>
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: "verified" | "featured" | "primary" | "secondary" | "new" | "like-new" | "used" | "for-parts";
}

const variantStyles = {
  verified:
    "bg-tertiary-container text-on-tertiary-container",
  featured:
    "bg-secondary-container text-on-surface-variant",
  primary:
    "bg-primary text-on-primary",
  secondary:
    "bg-surface-low text-on-surface-variant",
  new:
    "bg-emerald-100 text-emerald-800",
  "like-new":
    "bg-blue-100 text-blue-800",
  used:
    "bg-amber-100 text-amber-800",
  "for-parts":
    "bg-red-100 text-red-800",
};

export default function Badge({ children, variant = "secondary" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
}

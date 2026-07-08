import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "accent" | "outline" | "outline-dark" | "ghost";
type Size = "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-forest text-cream hover:bg-forest-light active:bg-forest shadow-[var(--shadow-soft)]",
  accent:
    "bg-clay text-cream hover:bg-clay-dark active:bg-clay shadow-[var(--shadow-soft)]",
  outline:
    "border border-ink/25 text-ink hover:border-ink hover:bg-ink/5",
  "outline-dark":
    "border border-cream/40 text-cream hover:border-cream/80 hover:bg-cream/10",
  ghost: "text-ink hover:bg-ink/5",
};

const sizeClasses: Record<Size, string> = {
  md: "h-11 px-6 text-[0.9375rem]",
  lg: "h-13 px-8 text-base",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium cursor-pointer transition-all duration-200 ease-[var(--ease-smooth)] hover:-translate-y-px active:translate-y-0 select-none whitespace-nowrap";

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ComponentProps<typeof Link>, "href">) {
  return (
    <Link
      href={href}
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...rest}
    >
      {children}
    </Link>
  );
}

/** Button-styled plain anchor for non-route hrefs (tel:, mailto:, external). */
export function ButtonAnchor({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: {
  variant?: Variant;
  size?: Size;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...rest}
    >
      {children}
    </a>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: {
  variant?: Variant;
  size?: Size;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

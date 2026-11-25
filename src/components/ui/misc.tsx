import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn, getInitials } from "@/lib/utils";

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-[1200px] px-5 sm:px-8", className)} {...props} />;
}

type BadgeTone = "neutral" | "brand" | "gold" | "danger" | "warning" | "info";
const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-surface-2 text-ink-soft",
  brand: "bg-brand-soft text-brand-ink",
  gold: "bg-gold-soft text-[#7a5d14]",
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
  info: "bg-info-soft text-info",
};

export function Badge({ tone = "neutral", className, ...props }: ComponentProps<"span"> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        badgeTones[tone],
        className,
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-[var(--radius-card)] border border-line bg-white", className)} {...props} />;
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2 text-ink", className)} aria-label="SaudiRecruit home">
      <span className="text-[19px] font-semibold tracking-[-0.03em]">
        saudirecruit<span className="text-brand">.</span>
      </span>
    </Link>
  );
}

export function Avatar({
  name,
  src,
  size = 44,
  square = false,
}: {
  name: string;
  src?: string | null;
  size?: number;
  square?: boolean;
}) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.36) };
  const shape = square ? "rounded-xl" : "rounded-full";
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" style={style} className={cn(shape, "shrink-0 border border-line object-cover")} />;
  }
  return (
    <span
      aria-hidden
      style={style}
      className={cn(shape, "inline-flex shrink-0 items-center justify-center border border-line bg-surface-2 font-semibold text-ink-soft")}
    >
      {getInitials(name) || "?"}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-line-strong bg-surface px-6 py-14 text-center">
      {icon && <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-white text-muted shadow-[var(--shadow-card)]">{icon}</div>}
      <h3 className="text-lg font-semibold tracking-[-0.01em]">{title}</h3>
      {description && <p className="mt-1.5 max-w-md text-[15px] text-body">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="display-md">{title}</h1>
        {description && <p className="mt-2 text-[15px] text-body">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-medium tracking-[-0.03em]">{value}</p>
      {hint && <p className="mt-1 text-xs text-subtle">{hint}</p>}
    </Card>
  );
}

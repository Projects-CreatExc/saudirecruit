import Link from "next/link";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

/** GET search box that keeps the other filters. */
export function AdminSearch({ action, q, placeholder, keep }: { action: string; q?: string; placeholder: string; keep?: Record<string, string | undefined> }) {
  return (
    <form action={action} method="get" role="search" className="mb-4 flex gap-2">
      {keep && Object.entries(keep).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
      <label className="flex h-11 flex-1 items-center gap-2.5 rounded-full border border-line-strong bg-white px-4 focus-within:border-ink">
        <Search className="size-4 text-muted" aria-hidden />
        <span className="sr-only">{placeholder}</span>
        <input name="q" defaultValue={q} placeholder={placeholder} className="h-full w-full bg-transparent text-[15px] placeholder:text-subtle focus:outline-none" />
      </label>
      <button type="submit" className="h-11 rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-ink-soft">
        Search
      </button>
    </form>
  );
}

/** Pill tabs that filter a list via a query param. */
export function FilterTabs({
  base,
  param,
  active,
  tabs,
  keep,
}: {
  base: string;
  param: string;
  active?: string;
  tabs: { value: string; label: string }[];
  keep?: Record<string, string | undefined>;
}) {
  const href = (v: string) => {
    const p = new URLSearchParams();
    Object.entries(keep ?? {}).forEach(([k, val]) => val && p.set(k, val));
    if (v) p.set(param, v);
    const qs = p.toString();
    return qs ? `${base}?${qs}` : base;
  };
  return (
    <nav aria-label="Filter" className="-mx-5 mb-5 flex gap-1.5 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
      {[{ value: "", label: "All" }, ...tabs].map((t) => {
        const on = (active ?? "") === t.value;
        return (
          <Link
            key={t.value || "all"}
            href={href(t.value)}
            aria-current={on ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              on ? "border-ink bg-ink text-white" : "border-line text-ink-soft hover:border-ink",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Th({ children, end }: { children?: React.ReactNode; end?: boolean }) {
  return <th className={cn("px-4 py-3 text-xs font-medium whitespace-nowrap text-muted", end ? "text-end" : "text-start")}>{children}</th>;
}

export function Td({ children, end, className }: { children?: React.ReactNode; end?: boolean; className?: string }) {
  return <td className={cn("px-4 py-3 align-middle", end && "text-end", className)}>{children}</td>;
}

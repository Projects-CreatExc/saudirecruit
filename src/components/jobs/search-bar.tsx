import { MapPin, Search } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Split search bar (role | location | Search). Plain GET form: works without JS. */
export function SearchBar({
  q,
  city,
  className,
  extra,
}: {
  q?: string;
  city?: string;
  className?: string;
  extra?: Record<string, string | undefined>;
}) {
  return (
    <form
      action="/jobs"
      method="get"
      role="search"
      className={cn(
        "flex flex-col gap-2 rounded-[20px] border border-line bg-white p-2 shadow-[var(--shadow-pop)] sm:flex-row sm:items-center sm:gap-0 sm:rounded-full",
        className,
      )}
    >
      {extra &&
        Object.entries(extra).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
      <label className="flex h-12 flex-1 items-center gap-3 rounded-full px-4 focus-within:bg-surface">
        <Search className="size-[18px] shrink-0 text-muted" aria-hidden />
        <span className="sr-only">Job title, skill or company</span>
        <input
          name="q"
          defaultValue={q}
          placeholder="Job title, skill or company"
          className="h-full w-full bg-transparent text-[15px] placeholder:text-subtle focus:outline-none"
        />
      </label>
      <span className="hidden h-7 w-px bg-line sm:block" aria-hidden />
      <label className="flex h-12 flex-1 items-center gap-3 rounded-full px-4 focus-within:bg-surface sm:max-w-[260px]">
        <MapPin className="size-[18px] shrink-0 text-muted" aria-hidden />
        <span className="sr-only">City</span>
        <input
          name="city"
          defaultValue={city}
          placeholder="City, e.g. Riyadh"
          className="h-full w-full bg-transparent text-[15px] placeholder:text-subtle focus:outline-none"
        />
      </label>
      <button type="submit" className={buttonStyles({ variant: "dark", size: "md", className: "h-12 px-7" })}>
        Search
      </button>
    </form>
  );
}

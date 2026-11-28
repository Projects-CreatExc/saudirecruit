"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActivePath, type NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { NavIcon } from "./nav-icon";

/**
 * Native-style bottom tab bar for phones. Hidden from tablets up, where the
 * regular website navigation takes over.
 */
export function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  // The longest matching tab wins, so /dashboard/jobs doesn't also light up "Home".
  const activeHref = items
    .filter((i) => isActivePath(pathname, i.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav
      aria-label="Main"
      className="tab-bar fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(7,19,24,0.04)] md:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-md grid-cols-4">
        {items.map((item) => {
          const active = item.href === activeHref;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="group flex h-full flex-col items-center justify-center gap-1 select-none"
              >
                <span
                  className={cn(
                    "flex h-8 w-14 items-center justify-center rounded-full transition-[background-color,transform] duration-300 ease-out group-active:scale-90",
                    active ? "bg-brand-soft text-brand-ink" : "text-muted",
                  )}
                >
                  <NavIcon name={item.icon} className="size-[21px]" strokeWidth={active ? 2.25 : 1.75} />
                </span>
                <span className={cn("text-[11px] leading-none transition-colors", active ? "font-semibold text-ink" : "font-medium text-muted")}>
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

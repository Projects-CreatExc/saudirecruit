"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActivePath, type NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { NavIcon } from "./nav-icon";

/** Sidebar for signed-in pages: pills on tablets, a column on desktop. Phones use the bottom tab bar. */
export function SideNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Account" className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
      {items.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex shrink-0 items-center gap-2.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors lg:rounded-xl",
              active ? "bg-ink text-white lg:bg-surface-2 lg:text-ink" : "text-ink-soft hover:bg-surface-2 hover:text-ink",
            )}
          >
            <NavIcon name={item.icon} className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

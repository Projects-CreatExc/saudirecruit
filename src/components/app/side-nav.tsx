"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Building2, FileText, LayoutDashboard, Search, Settings, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = { LayoutDashboard, Briefcase, Building2, FileText, Search, Settings, Users };
export type NavItem = { href: string; label: string; icon: keyof typeof ICONS };

export function SideNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav aria-label="Account" className="-mx-5 flex gap-1 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        const active = isActive(item.href);
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
            <Icon className="size-4" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

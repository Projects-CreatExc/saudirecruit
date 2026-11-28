"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, LogOut, Menu, X } from "lucide-react";
import { NavIcon } from "@/components/app/nav-icon";
import { InstallButton } from "@/components/pwa/install";
import { buttonStyles } from "@/components/ui/button";
import { Avatar } from "@/components/ui/misc";
import { logoutAction } from "@/lib/actions/auth";
import { isActivePath, type NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type Props = {
  links: { href: string; label: string }[];
  account: NavItem[] | null;
  name: string | null;
};

/** Phone menu: account pages first when signed in, then the public site. Sits above the tab bar. */
export function MobileMenu({ links, account, name }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on navigation
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const row = "flex items-center gap-3 rounded-2xl px-3 py-3.5 text-[16px] font-medium transition-colors active:bg-surface-2";

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((v) => !v)}
        className="-me-2 inline-flex size-11 items-center justify-center rounded-full text-ink hover:bg-surface-2 active:scale-90"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {/* Portal: the header's backdrop-filter would otherwise clip this fixed panel to the header's height. */}
      {open &&
        createPortal(
        <div
          id="mobile-nav"
          className="fixed inset-x-0 top-[calc(72px+var(--sat,0px))] bottom-[calc(4rem+env(safe-area-inset-bottom))] z-40 animate-fade-up overflow-y-auto overscroll-contain bg-white px-4 pt-3 pb-8"
        >
          {account && (
            <>
              <div className="mb-2 flex items-center gap-3 px-3 py-3">
                <Avatar name={name ?? "Account"} size={44} />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{name}</p>
                  <p className="text-sm text-muted">Your account</p>
                </div>
              </div>
              <nav aria-label="Account" className="flex flex-col">
                {account.map((item) => {
                  const active = isActivePath(pathname, item.href);
                  return (
                    <Link key={item.href} href={item.href} className={cn(row, active ? "bg-surface-2 text-ink" : "text-ink-soft")}>
                      <span className="flex size-9 items-center justify-center rounded-xl bg-surface-2 text-ink">
                        <NavIcon name={item.icon} className="size-[18px]" />
                      </span>
                      <span className="flex-1">{item.label}</span>
                      <ChevronRight className="size-4 text-subtle rtl:rotate-180" aria-hidden />
                    </Link>
                  );
                })}
              </nav>
              <p className="eyebrow mt-6 mb-1 px-3 text-subtle">Explore</p>
            </>
          )}

          <nav aria-label="Site" className="flex flex-col">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={cn(row, "justify-between text-ink")}>
                {l.label}
                <ChevronRight className="size-4 text-subtle rtl:rotate-180" aria-hidden />
              </Link>
            ))}
          </nav>

          <div className="mt-6 grid gap-3 px-1">
            <InstallButton variant="menu" />
            {account ? (
              <form action={logoutAction}>
                <button type="submit" className={buttonStyles({ variant: "outline", size: "lg", className: "w-full" })}>
                  <LogOut className="size-4" /> Log out
                </button>
              </form>
            ) : (
              <>
                <Link href="/register" className={buttonStyles({ variant: "dark", size: "lg" })}>
                  Sign up
                </Link>
                <Link href="/login" className={buttonStyles({ variant: "outline", size: "lg" })}>
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>,
          document.body,
        )}
    </div>
  );
}

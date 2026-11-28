"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { InstallButton } from "@/components/pwa/install";
import { buttonStyles } from "@/components/ui/button";

export function MobileMenu({ links, signedIn }: { links: { href: string; label: string }[]; signedIn: boolean }) {
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

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((v) => !v)}
        className="-me-2 inline-flex size-11 items-center justify-center rounded-full text-ink hover:bg-surface-2"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <div id="mobile-nav" className="fixed inset-x-0 top-[calc(72px+var(--sat,0px))] bottom-0 z-40 animate-fade-up overflow-y-auto bg-white px-5 pt-4 pb-10">
          <nav aria-label="Mobile" className="flex flex-col">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-line py-4 text-lg font-medium tracking-[-0.01em] text-ink"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 grid gap-3">
            <InstallButton variant="menu" />
            {signedIn ? (
              <>
                <Link href="/dashboard" className={buttonStyles({ variant: "dark", size: "lg" })}>
                  Go to dashboard
                </Link>
                <Link href="/settings" className={buttonStyles({ variant: "outline", size: "lg" })}>
                  Settings
                </Link>
              </>
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
        </div>
      )}
    </div>
  );
}

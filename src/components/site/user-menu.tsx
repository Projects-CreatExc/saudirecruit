"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FileText, LayoutDashboard, LogOut, Settings } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { Avatar } from "@/components/ui/misc";

export function UserMenu({ name, email }: { name: string; email: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const item = "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-soft hover:bg-surface-2 hover:text-ink";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="rounded-full transition-shadow hover:ring-4 hover:ring-surface-2"
      >
        <span className="sr-only">Open account menu</span>
        <Avatar name={name} size={36} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute end-0 top-12 w-64 animate-fade-up rounded-2xl border border-line bg-white p-2 shadow-[var(--shadow-pop)]"
        >
          <div className="border-b border-line px-3 pt-1.5 pb-3">
            <p className="truncate text-sm font-semibold">{name}</p>
            <p className="truncate text-xs text-muted">{email}</p>
          </div>
          <div className="py-1.5">
            <Link role="menuitem" href="/dashboard" className={item} onClick={() => setOpen(false)}>
              <LayoutDashboard className="size-4" /> Dashboard
            </Link>
            <Link role="menuitem" href="/applications" className={item} onClick={() => setOpen(false)}>
              <FileText className="size-4" /> Applications
            </Link>
            <Link role="menuitem" href="/settings" className={item} onClick={() => setOpen(false)}>
              <Settings className="size-4" /> Settings
            </Link>
          </div>
          <form action={logoutAction} className="border-t border-line pt-1.5">
            <button role="menuitem" type="submit" className={`${item} w-full`}>
              <LogOut className="size-4" /> Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

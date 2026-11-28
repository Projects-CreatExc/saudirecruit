"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Download, PlusSquare, Share, X } from "lucide-react";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useInstall } from "./use-install";

/* ---------- iPhone / iPad instructions ---------- */

function IosSheet({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation(); // close only this sheet, not the menu underneath
      onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const steps = [
    { icon: Share, text: (<>Tap the <strong>Share</strong> button in your browser bar</>) },
    { icon: PlusSquare, text: (<>Scroll down and tap <strong>Add to Home Screen</strong></>) },
    { icon: Download, text: (<>Tap <strong>Add</strong>. SaudiRecruit now opens like an app</>) },
  ];

  // Portal to <body>: the sticky header uses backdrop-filter, which would otherwise trap this fixed overlay inside it.
  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/40 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ios-install-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md animate-fade-up rounded-t-[28px] bg-white p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-[var(--shadow-pop)] sm:rounded-[28px]"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/icon-192.png" alt="" className="size-12 rounded-xl" />
            <div>
              <h2 id="ios-install-title" className="text-lg font-semibold tracking-[-0.015em]">
                Install SaudiRecruit
              </h2>
              <p className="text-sm text-muted">Add it to your Home Screen in 3 steps</p>
            </div>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="-me-2 -mt-1 inline-flex size-10 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-ink">
            <X className="size-5" />
          </button>
        </div>
        <ol className="mt-6 space-y-3">
          {steps.map((s, i) => (
            <li key={i} className="flex items-center gap-4 rounded-2xl bg-surface p-4 text-[15px]">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-brand shadow-[var(--shadow-card)]">
                <s.icon className="size-[18px]" />
              </span>
              <span className="text-ink-soft">{s.text}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>,
    document.body,
  );
}

/* ---------- Buttons ---------- */

function useInstallAction() {
  const install = useInstall();
  const [iosOpen, setIosOpen] = useState(false);
  const run = async () => {
    if (install.canPrompt) await install.prompt();
    else if (install.isIOS) setIosOpen(true);
  };
  const sheet = iosOpen ? <IosSheet onClose={() => setIosOpen(false)} /> : null;
  return { install, run, sheet };
}

/** Compact header button (desktop) or full-width button (mobile menu). Hidden when not installable. */
export function InstallButton({ variant = "header" }: { variant?: "header" | "menu" }) {
  const { install, run, sheet } = useInstallAction();
  if (!install.available) return null;
  return (
    <>
      <button
        type="button"
        onClick={run}
        className={
          variant === "header"
            ? buttonStyles({ variant: "ghost", size: "sm", className: "text-ink-soft" })
            : buttonStyles({ variant: "outline", size: "lg", className: "w-full" })
        }
      >
        <Download className="size-4" aria-hidden /> Install app
      </button>
      {sheet}
    </>
  );
}

/* ---------- Mobile banner ---------- */

const DISMISS_KEY = "sr-install-dismissed";
const DISMISS_DAYS = 14;
const BANNER_PATHS = ["/", "/jobs", "/companies"];

function recentlyDismissed() {
  try {
    const t = Number(localStorage.getItem(DISMISS_KEY));
    return !!t && Date.now() - t < DISMISS_DAYS * 864e5;
  } catch {
    return false;
  }
}

/** Small bottom card on phones, a few seconds after landing. Remembers "not now" for 14 days. */
export function InstallBanner() {
  const { install, run, sheet } = useInstallAction();
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!install.available || !BANNER_PATHS.includes(pathname) || recentlyDismissed()) return;
    const id = window.setTimeout(() => setShow(true), 3500);
    return () => window.clearTimeout(id);
  }, [install.available, pathname]);

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* private mode */
    }
  };

  if (!install.available) return sheet;
  return (
    <>
      {show && (
        <div
          role="region"
          aria-label="Install the app"
          className={cn(
            "fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 animate-fade-up sm:hidden",
            "flex items-center gap-3 rounded-2xl border border-line bg-white/95 p-3 shadow-[var(--shadow-pop)] backdrop-blur",
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/icon-192.png" alt="" className="size-11 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Get the SaudiRecruit app</p>
            <p className="truncate text-xs text-muted">Faster job search, right from your home screen</p>
          </div>
          <button
            type="button"
            onClick={async () => {
              await run();
              setShow(false);
            }}
            className="h-9 shrink-0 rounded-full bg-ink px-4 text-sm font-semibold text-white"
          >
            Install
          </button>
          <button type="button" onClick={dismiss} aria-label="Not now" className="-ms-1 inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface-2">
            <X className="size-4" />
          </button>
        </div>
      )}
      {sheet}
    </>
  );
}

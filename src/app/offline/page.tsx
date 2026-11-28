import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import { RetryButton } from "./retry-button";

export const metadata: Metadata = { title: "You're offline", robots: { index: false } };

/** Cached by the service worker and shown whenever a page can't load without internet. */
export default function OfflinePage() {
  return (
    <main id="main" className="hero-wash flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <span className="text-[19px] font-semibold tracking-[-0.03em] text-ink">
        saudirecruit<span className="text-brand">.</span>
      </span>
      <span className="mt-12 flex size-14 items-center justify-center rounded-full bg-white text-muted shadow-[var(--shadow-card)]">
        <WifiOff className="size-6" />
      </span>
      <h1 className="display-md mt-6">You&apos;re offline</h1>
      <p className="mt-3 max-w-sm text-body">Check your internet connection. Your jobs and applications will be here as soon as you&apos;re back online.</p>
      <RetryButton />
    </main>
  );
}

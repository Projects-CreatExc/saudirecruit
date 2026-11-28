"use client";

import { useEffect } from "react";

export function RetryButton() {
  // Come back automatically when the connection returns.
  useEffect(() => {
    const back = () => window.location.reload();
    window.addEventListener("online", back);
    return () => window.removeEventListener("online", back);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="mt-8 inline-flex h-12 items-center rounded-full bg-ink px-6 font-semibold text-white transition-colors hover:bg-ink-soft"
    >
      Try again
    </button>
  );
}

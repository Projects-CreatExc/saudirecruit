"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Card link with a soft light that follows the pointer. */
export function SpotlightLink({
  href,
  className,
  glow = "rgba(255,255,255,0.10)",
  children,
}: {
  href: string;
  className?: string;
  glow?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  return (
    <Link
      ref={ref}
      href={href}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--x", `${e.clientX - r.left}px`);
        el.style.setProperty("--y", `${e.clientY - r.top}px`);
      }}
      style={{ "--glow": glow } as React.CSSProperties}
      className={cn("spotlight group", className)}
    >
      {children}
    </Link>
  );
}

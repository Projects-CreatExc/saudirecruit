"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Cycles through phrases with a masked slide. All phrases share one grid cell,
 * so the box is as wide as the longest phrase and the layout never jumps.
 */
export function RotatingWords({ words, interval = 2600, className }: { words: string[]; interval?: number; className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => window.clearInterval(id);
  }, [words.length, interval]);

  return (
    <span className={cn("rotating-words", className)}>
      <span className="sr-only">{words[0]}</span>
      {words.map((w, i) => (
        <span
          key={w}
          aria-hidden
          data-state={i === index ? "in" : i === (index - 1 + words.length) % words.length ? "out" : "idle"}
        >
          {w}
        </span>
      ))}
    </span>
  );
}

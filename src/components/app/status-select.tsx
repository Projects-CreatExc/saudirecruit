"use client";

import { useTransition } from "react";
import { cn } from "@/lib/utils";

/** Inline status dropdown that submits a server action on change. */
export function StatusSelect({
  action,
  idName,
  id,
  value,
  options,
  label,
}: {
  action: (fd: FormData) => Promise<void>;
  idName: string;
  id: string;
  value: string;
  options: { value: string; label: string }[];
  label: string;
}) {
  const [pending, start] = useTransition();
  return (
    <select
      aria-label={label}
      defaultValue={value}
      disabled={pending}
      onChange={(e) => {
        const fd = new FormData();
        fd.set(idName, id);
        fd.set("status", e.target.value);
        start(() => action(fd));
      }}
      className={cn(
        "h-9 cursor-pointer rounded-full border border-line-strong bg-white ps-3 pe-8 text-sm font-medium transition-colors hover:border-ink focus:border-ink focus:outline-none",
        pending && "opacity-60",
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

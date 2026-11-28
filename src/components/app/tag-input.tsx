"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

function parse(raw?: string): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    if (Array.isArray(v)) return v.map(String);
  } catch {
    /* comma list */
  }
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

/**
 * Chip-style tag editor. Enter or comma adds a tag, Backspace on empty removes
 * the last one. Submits as a JSON array in a hidden input named `name`.
 */
export function TagInput({
  name,
  label,
  defaultValue,
  suggestions = [],
  hint,
  max = 25,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  suggestions?: string[];
  hint?: string;
  max?: number;
}) {
  const [tags, setTags] = useState<string[]>(() => parse(defaultValue));
  const [text, setText] = useState("");
  const id = useId();
  const listId = `${id}-list`;

  const add = (raw: string) => {
    const t = raw.trim().replace(/^#/, "").slice(0, 40);
    if (!t || tags.length >= max || tags.some((x) => x.toLowerCase() === t.toLowerCase())) return setText("");
    setTags((ts) => [...ts, t]);
    setText("");
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(text);
    } else if (e.key === "Backspace" && !text && tags.length) {
      setTags((ts) => ts.slice(0, -1));
    }
  };
  const unused = suggestions.filter((s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase())).slice(0, 12);

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <input type="hidden" name={name} value={JSON.stringify(tags)} />
      <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl border border-line-strong bg-white px-2 py-1.5 focus-within:border-ink focus-within:ring-4 focus-within:ring-ink/5">
        {tags.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-full bg-brand-soft py-0.5 ps-2.5 pe-1 text-sm text-brand-ink">
            #{t}
            <button type="button" onClick={() => setTags((ts) => ts.filter((x) => x !== t))} aria-label={`Remove ${t}`} className="inline-flex size-5 items-center justify-center rounded-full hover:bg-white/70">
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={text}
          list={listId}
          onChange={(e) => {
            const v = e.target.value;
            if (v.endsWith(",")) add(v.slice(0, -1));
            else setText(v);
          }}
          onKeyDown={onKey}
          onBlur={() => text && add(text)}
          placeholder={tags.length ? "" : "Type a tag and press Enter"}
          className="h-8 min-w-[8rem] flex-1 bg-transparent px-1 text-[15px] placeholder:text-subtle focus:outline-none"
        />
        <datalist id={listId}>
          {unused.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>
      {unused.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {unused.slice(0, 8).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className={cn("rounded-full border border-dashed border-line-strong px-2.5 py-0.5 text-xs text-muted transition-colors hover:border-ink hover:text-ink")}
            >
              + {s}
            </button>
          ))}
        </div>
      )}
      {hint && <p className="mt-1.5 text-sm text-muted">{hint}</p>}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, FileText, UploadCloud, X } from "lucide-react";
import { RESUME_ACCEPT, RESUME_MAX_BYTES, formatBytes } from "@/lib/resume";
import { cn } from "@/lib/utils";

/** Hidden field that only bots fill in. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Leave this empty
        <input type="text" name="hp_field" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

export function Consent({ text, error }: { text: string; error?: string }) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-body">
        <input type="checkbox" name="consent" required className="mt-0.5 size-4 shrink-0 cursor-pointer accent-brand" aria-invalid={!!error} />
        <span>{text}</span>
      </label>
      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  );
}

/** PDF/Word picker with instant size/type checks. The server checks again. */
export function FilePicker({
  name,
  label,
  hint,
  required,
  error,
}: {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [local, setLocal] = useState<string | null>(null);

  const pick = (f?: File | null) => {
    setLocal(null);
    if (!f) return setFile(null);
    const ext = f.name.toLowerCase().split(".").pop() ?? "";
    if (!["pdf", "doc", "docx"].includes(ext)) {
      if (ref.current) ref.current.value = "";
      setFile(null);
      return setLocal("Upload a PDF or Word file (.pdf, .doc or .docx).");
    }
    if (f.size > RESUME_MAX_BYTES) {
      if (ref.current) ref.current.value = "";
      setFile(null);
      return setLocal(`This file is ${formatBytes(f.size)}. The limit is ${formatBytes(RESUME_MAX_BYTES)}.`);
    }
    setFile(f);
  };

  // React resets forms after a submit; keep the label in sync with the (now empty) input.
  useEffect(() => {
    const form = ref.current?.form;
    if (!form) return;
    const onReset = () => setFile(null);
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, []);

  const msg = local ?? error;
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium">
        {label} {!required && <span className="font-normal text-muted">(optional)</span>}
      </p>
      <label
        className={cn(
          "flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed p-4 transition-colors",
          msg ? "border-danger bg-danger-soft/40" : file ? "border-brand bg-brand-soft/50" : "border-line-strong hover:border-ink hover:bg-surface",
        )}
      >
        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-[var(--shadow-card)]", file ? "text-brand" : "text-muted")}>
          {file ? <FileText className="size-5" /> : <UploadCloud className="size-5" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{file ? file.name : "Choose a file"}</span>
          <span className="block text-xs text-muted">{file ? formatBytes(file.size) : hint ?? `PDF or Word, up to ${formatBytes(RESUME_MAX_BYTES)}`}</span>
        </span>
        {file && (
          <button
            type="button"
            aria-label="Remove file"
            onClick={(e) => {
              e.preventDefault();
              if (ref.current) ref.current.value = "";
              setFile(null);
            }}
            className="inline-flex size-8 items-center justify-center rounded-full text-muted hover:bg-white hover:text-ink"
          >
            <X className="size-4" />
          </button>
        )}
        <input ref={ref} type="file" name={name} accept={RESUME_ACCEPT} className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
      </label>
      {msg && <p className="mt-1.5 text-sm text-danger">{msg}</p>}
    </div>
  );
}

export function Sent({ title, body }: { title: string; body: string }) {
  return (
    <div role="status" className="flex flex-col items-center rounded-[var(--radius-card)] border border-brand/20 bg-brand-soft px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-white text-brand shadow-[var(--shadow-card)]">
        <CheckCircle2 className="size-6" />
      </span>
      <h2 className="mt-4 text-xl font-semibold tracking-[-0.015em]">{title}</h2>
      <p className="mt-2 max-w-md text-[15px] text-brand-ink">{body}</p>
    </div>
  );
}

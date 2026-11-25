"use client";

import { useActionState, useRef, useState } from "react";
import { Download, FileText, UploadCloud, X } from "lucide-react";
import { removeResumeAction, uploadResumeAction } from "@/lib/actions/resume";
import type { FormState } from "@/lib/actions/auth";
import { RESUME_ACCEPT, RESUME_MAX_BYTES, formatBytes } from "@/lib/resume";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/field";
import { Card } from "@/components/ui/misc";
import { cn, timeAgo } from "@/lib/utils";

export type CurrentResume = { id: string; fileName: string; sizeBytes: number; createdAt: string } | null;

export function ResumeUpload({ current }: { current: CurrentResume }) {
  const [state, action, pending] = useActionState<FormState, FormData>(uploadResumeAction, {});
  const [picked, setPicked] = useState<File | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Clear the picked file once the server confirms the upload.
  const [seen, setSeen] = useState(state);
  if (state !== seen) {
    setSeen(state);
    if (state.success) setPicked(null);
  }

  function choose(file: File | undefined | null) {
    setClientError(null);
    if (!file) return setPicked(null);
    const ext = file.name.toLowerCase().split(".").pop();
    if (!["pdf", "doc", "docx"].includes(ext ?? "")) {
      setPicked(null);
      return setClientError("Upload a PDF or Word file (.pdf, .doc or .docx).");
    }
    if (file.size > RESUME_MAX_BYTES) {
      setPicked(null);
      return setClientError(`This file is ${formatBytes(file.size)}. Your CV must be ${formatBytes(RESUME_MAX_BYTES)} or smaller.`);
    }
    setPicked(file);
  }

  return (
    <Card className="grid gap-6 p-6 lg:grid-cols-[220px_1fr]">
      <div>
        <h2 className="text-[15px] font-semibold">CV / Resume</h2>
        <p className="mt-1 text-sm text-muted">Shared with employers you apply to. PDF or Word, up to {formatBytes(RESUME_MAX_BYTES)}.</p>
      </div>

      <div className="space-y-4">
        {current && (
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand shadow-[var(--shadow-card)]">
              <FileText className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{current.fileName}</p>
              <p className="text-xs text-muted">
                {formatBytes(current.sizeBytes)} · uploaded {timeAgo(new Date(current.createdAt)).toLowerCase()}
              </p>
            </div>
            <a href={`/api/cv/${current.id}`} className="inline-flex size-9 items-center justify-center rounded-full text-ink-soft hover:bg-white hover:text-ink" aria-label="Download your CV">
              <Download className="size-4" />
            </a>
            <form action={removeResumeAction}>
              <button type="submit" className="inline-flex size-9 items-center justify-center rounded-full text-muted hover:bg-white hover:text-danger" aria-label="Remove your CV">
                <X className="size-4" />
              </button>
            </form>
          </div>
        )}

        <form action={action} className="space-y-3">
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              const f = e.dataTransfer.files?.[0];
              if (f && inputRef.current) {
                const dt = new DataTransfer();
                dt.items.add(f);
                inputRef.current.files = dt.files;
              }
              choose(f);
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-8 text-center transition-colors",
              drag ? "border-brand bg-brand-soft" : "border-line-strong hover:border-ink hover:bg-surface",
            )}
          >
            <UploadCloud className={cn("size-6 transition-transform", drag ? "-translate-y-0.5 text-brand" : "text-muted")} aria-hidden />
            <span className="mt-3 text-sm font-medium">
              {picked ? picked.name : current ? "Replace your CV" : "Upload your CV"}
            </span>
            <span className="mt-1 text-xs text-muted">
              {picked ? formatBytes(picked.size) : "Drag a file here or click to browse"}
            </span>
            <input
              ref={inputRef}
              type="file"
              name="cv"
              accept={RESUME_ACCEPT}
              className="sr-only"
              onChange={(e) => choose(e.target.files?.[0])}
            />
          </label>

          {(clientError || state.error) && <Alert>{clientError ?? state.error}</Alert>}
          {state.success && !picked && <Alert tone="success">{state.success}</Alert>}

          {picked && (
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPicked(null);
                  if (inputRef.current) inputRef.current.value = "";
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="dark" size="sm" disabled={pending}>
                {pending ? "Uploading..." : "Upload CV"}
              </Button>
            </div>
          )}
        </form>
      </div>
    </Card>
  );
}

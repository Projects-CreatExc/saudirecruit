"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2, FileText } from "lucide-react";
import { applyToJobAction } from "@/lib/actions/recruiting";
import type { FormState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Alert, Label, Textarea } from "@/components/ui/field";

export function ApplyForm({ jobId, slug, cvName }: { jobId: string; slug: string; cvName?: string | null }) {
  const [state, action, pending] = useActionState<FormState, FormData>(applyToJobAction, {});

  if (state.success) {
    return (
      <div className="flex gap-3 rounded-xl bg-brand-soft p-4 text-sm text-brand-ink" role="status">
        <CheckCircle2 className="size-5 shrink-0" />
        <p>{state.success}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="jobId" value={jobId} />
      <input type="hidden" name="slug" value={slug} />
      <div>
        <Label htmlFor="coverLetter">
          Note to the hiring team <span className="font-normal text-muted">(optional)</span>
        </Label>
        <Textarea id="coverLetter" name="coverLetter" maxLength={5000} placeholder="Why are you a good fit for this role?" />
      </div>
      {cvName ? (
        <p className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2.5 text-sm text-body">
          <FileText className="size-4 shrink-0 text-brand" />
          <span className="min-w-0 truncate">
            CV attached: <span className="font-medium text-ink">{cvName}</span>
          </span>
        </p>
      ) : (
        <p className="rounded-xl bg-warning-soft px-3 py-2.5 text-sm text-warning">
          No CV yet.{" "}
          <Link href="/settings" className="font-medium underline underline-offset-2">
            Upload one
          </Link>{" "}
          to stand out.
        </p>
      )}
      {state.error && <Alert>{state.error}</Alert>}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Sending application..." : "Apply now"}
      </Button>
      <p className="text-center text-xs text-muted">Your profile is shared with this employer when you apply.</p>
    </form>
  );
}

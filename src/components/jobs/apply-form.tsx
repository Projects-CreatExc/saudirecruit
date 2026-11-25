"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { applyToJobAction } from "@/lib/actions/recruiting";
import type { FormState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Alert, Label, Textarea } from "@/components/ui/field";

export function ApplyForm({ jobId, slug }: { jobId: string; slug: string }) {
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
      {state.error && <Alert>{state.error}</Alert>}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Sending application..." : "Apply now"}
      </Button>
      <p className="text-center text-xs text-muted">Your profile is shared with this employer when you apply.</p>
    </form>
  );
}

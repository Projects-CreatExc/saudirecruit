"use client";

import { useActionState } from "react";
import { saveInquiryNotesAction } from "@/lib/actions/agency-admin";
import type { FormState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";

export function InquiryNotes({ id, defaultValue }: { id: string; defaultValue?: string | null }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveInquiryNotesAction, {});
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <label htmlFor="adminNotes" className="block text-sm font-semibold">
        Internal notes
      </label>
      <Textarea id="adminNotes" name="adminNotes" rows={4} defaultValue={defaultValue ?? ""} placeholder="Call outcome, salary expectation, availability... Only admins see this." />
      <div className="flex items-center gap-3">
        <Button type="submit" variant="outline" size="sm" disabled={pending}>
          {pending ? "Saving..." : "Save notes"}
        </Button>
        {state.success && <span className="text-sm text-brand">{state.success}</span>}
        {state.error && <span className="text-sm text-danger">{state.error}</span>}
      </div>
    </form>
  );
}

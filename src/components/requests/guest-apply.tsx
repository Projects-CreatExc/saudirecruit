"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { submitGuestApplicationAction } from "@/lib/actions/requests";
import type { FormState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Alert, Field, Input, Textarea } from "@/components/ui/field";
import { Consent, FilePicker, Honeypot } from "./shared";

/** Apply to a job without an account. Goes to the admin's Requests inbox, linked to the job. */
export function GuestApplyForm({ jobId }: { jobId: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitGuestApplicationAction, {});
  const fe = state.fieldErrors ?? {};
  const v = state.values ?? {};

  if (state.success) {
    return (
      <div className="flex gap-3 rounded-xl bg-brand-soft p-4 text-sm text-brand-ink" role="status">
        <CheckCircle2 className="size-5 shrink-0" />
        <p>{state.success}</p>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="relative space-y-4">
      <Honeypot />
      <input type="hidden" name="jobId" value={jobId} />
      <Field label="Full name" htmlFor="g-fullName" error={fe.fullName}>
        <Input id="g-fullName" name="fullName" autoComplete="name" defaultValue={v.fullName} aria-invalid={!!fe.fullName} />
      </Field>
      <Field label="Phone / WhatsApp" htmlFor="g-phone" error={fe.phone}>
        <Input id="g-phone" name="phone" type="tel" autoComplete="tel" placeholder="+966" defaultValue={v.phone} aria-invalid={!!fe.phone} />
      </Field>
      <Field label="Email" htmlFor="g-email" error={fe.email}>
        <Input id="g-email" name="email" type="email" autoComplete="email" defaultValue={v.email} aria-invalid={!!fe.email} />
      </Field>
      <FilePicker name="cv" label="Your CV" required error={fe.cv} />
      <Field label="Note" htmlFor="g-message" error={fe.message}>
        <Textarea id="g-message" name="message" rows={3} placeholder="Optional" defaultValue={v.message} />
      </Field>
      <Consent text="I agree that SaudiRecruit may store my details and share my CV with this employer." error={fe.consent} />
      {state.error && <Alert>{state.error}</Alert>}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Sending..." : "Send application"}
      </Button>
    </form>
  );
}

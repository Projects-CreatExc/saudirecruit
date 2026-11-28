"use client";

import { useActionState } from "react";
import { saveSiteSettingsAction } from "@/lib/actions/agency-admin";
import type { FormState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Alert, Field, Input } from "@/components/ui/field";
import { Card } from "@/components/ui/misc";

export function SiteSettingsForm({ initial }: { initial: Record<string, string> }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveSiteSettingsAction, {});
  const fe = state.fieldErrors ?? {};
  const v = { ...initial, ...(state.values ?? {}) };
  return (
    <form action={action} noValidate>
      <Card className="divide-y divide-line">
        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <Field
            label="WhatsApp number"
            htmlFor="whatsapp"
            error={fe.whatsapp}
            hint="International format with country code. Shows WhatsApp buttons on jobs, Send CV and Hire pages. Leave empty to hide them."
            className="sm:col-span-2"
          >
            <Input id="whatsapp" name="whatsapp" type="tel" placeholder="+966 5X XXX XXXX" defaultValue={v.whatsapp} aria-invalid={!!fe.whatsapp} />
          </Field>
          <Field label="Contact email" htmlFor="contactEmail" error={fe.contactEmail}>
            <Input id="contactEmail" name="contactEmail" type="email" defaultValue={v.contactEmail} />
          </Field>
          <Field label="Contact phone" htmlFor="contactPhone" error={fe.contactPhone}>
            <Input id="contactPhone" name="contactPhone" type="tel" defaultValue={v.contactPhone} />
          </Field>
        </div>
        <div className="flex flex-col-reverse gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="sm:max-w-md">
            {state.error && <Alert>{state.error}</Alert>}
            {state.success && <Alert tone="success">{state.success}</Alert>}
          </div>
          <Button type="submit" variant="dark" disabled={pending}>
            {pending ? "Saving..." : "Save settings"}
          </Button>
        </div>
      </Card>
    </form>
  );
}

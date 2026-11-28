"use client";

import { useActionState } from "react";
import { submitCandidateRequestAction } from "@/lib/actions/requests";
import type { FormState } from "@/lib/actions/auth";
import { SAUDI_CITIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Alert, Field, Input, Textarea } from "@/components/ui/field";
import { Card } from "@/components/ui/misc";
import { Consent, FilePicker, Honeypot, Sent } from "./shared";

export function CandidateRequestForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(submitCandidateRequestAction, {});
  const fe = state.fieldErrors ?? {};
  const v = state.values ?? {};

  if (state.success) return <Sent title="CV received" body={state.success} />;

  return (
    <form action={action} noValidate className="relative">
      <Honeypot />
      <Card className="divide-y divide-line">
        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <Field label="Full name" htmlFor="fullName" error={fe.fullName} className="sm:col-span-2">
            <Input id="fullName" name="fullName" autoComplete="name" defaultValue={v.fullName} aria-invalid={!!fe.fullName} />
          </Field>
          <Field label="Email" htmlFor="email" error={fe.email}>
            <Input id="email" name="email" type="email" autoComplete="email" defaultValue={v.email} aria-invalid={!!fe.email} />
          </Field>
          <Field label="Phone / WhatsApp" htmlFor="phone" error={fe.phone}>
            <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+966 5X XXX XXXX" defaultValue={v.phone} aria-invalid={!!fe.phone} />
          </Field>
          <Field label="Current job title" htmlFor="headline" error={fe.headline}>
            <Input id="headline" name="headline" placeholder="e.g. Site Engineer" defaultValue={v.headline} />
          </Field>
          <Field label="Years of experience" htmlFor="experienceYears" error={fe.experienceYears}>
            <Input id="experienceYears" name="experienceYears" type="number" min={0} max={60} inputMode="numeric" defaultValue={v.experienceYears} />
          </Field>
          <Field label="Current city" htmlFor="city" error={fe.city}>
            <Input id="city" name="city" list="cv-cities" defaultValue={v.city} />
            <datalist id="cv-cities">
              {SAUDI_CITIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field label="Key skills" htmlFor="skills" error={fe.skills} hint="Comma separated">
            <Input id="skills" name="skills" placeholder="AutoCAD, Project management" defaultValue={v.skills} />
          </Field>
          <div className="sm:col-span-2">
            <FilePicker name="cv" label="Your CV" required error={fe.cv} />
          </div>
          <Field label="Anything else we should know?" htmlFor="message" error={fe.message} className="sm:col-span-2">
            <Textarea id="message" name="message" rows={4} placeholder="The kind of role you want, notice period, visa status..." defaultValue={v.message} />
          </Field>
        </div>
        <div className="space-y-4 p-6">
          <Consent text="I agree that SaudiRecruit may store my details and CV and share them with employers for recruitment purposes." error={fe.consent} />
          {state.error && <Alert>{state.error}</Alert>}
          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={pending}>
            {pending ? "Sending..." : "Send my CV"}
          </Button>
        </div>
      </Card>
    </form>
  );
}

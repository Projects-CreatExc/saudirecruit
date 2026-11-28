"use client";

import { useActionState } from "react";
import { saveCandidateAction } from "@/lib/actions/agency-admin";
import type { FormState } from "@/lib/actions/auth";
import { CANDIDATE_STATUS_META } from "@/lib/agency-meta";
import { SAUDI_CITIES, VISA_STATUSES } from "@/lib/constants";
import { FilePicker } from "@/components/requests/shared";
import { Button } from "@/components/ui/button";
import { Alert, Field, Input, Select, Textarea } from "@/components/ui/field";
import { Card } from "@/components/ui/misc";
import { TagInput } from "./tag-input";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-5 p-6 sm:grid-cols-2">
      <h2 className="text-[15px] font-semibold sm:col-span-2">{title}</h2>
      {children}
    </div>
  );
}

/** Add or edit a talent-pool candidate. Admin only. */
export function CandidateEditor({
  id,
  initial = {},
  tagSuggestions = [],
  hasCv,
}: {
  id?: string;
  initial?: Record<string, string>;
  tagSuggestions?: string[];
  hasCv?: boolean;
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveCandidateAction, {});
  const fe = state.fieldErrors ?? {};
  const v: Record<string, string> = { ...initial, ...(state.values ?? {}) };

  return (
    <form action={action} noValidate>
      {id && <input type="hidden" name="id" value={id} />}
      <Card className="divide-y divide-line">
        <Block title="Contact">
          <Field label="Full name" htmlFor="fullName" error={fe.fullName} className="sm:col-span-2">
            <Input id="fullName" name="fullName" defaultValue={v.fullName} aria-invalid={!!fe.fullName} />
          </Field>
          <Field label="Phone / WhatsApp" htmlFor="phone" error={fe.phone}>
            <Input id="phone" name="phone" type="tel" defaultValue={v.phone} />
          </Field>
          <Field label="Email" htmlFor="email" error={fe.email}>
            <Input id="email" name="email" type="email" defaultValue={v.email} aria-invalid={!!fe.email} />
          </Field>
        </Block>
        <Block title="Profile">
          <Field label="Current / target title" htmlFor="headline" error={fe.headline}>
            <Input id="headline" name="headline" defaultValue={v.headline} />
          </Field>
          <Field label="Years of experience" htmlFor="experienceYears" error={fe.experienceYears}>
            <Input id="experienceYears" name="experienceYears" type="number" min={0} max={60} inputMode="numeric" defaultValue={v.experienceYears} />
          </Field>
          <Field label="City" htmlFor="city" error={fe.city}>
            <Input id="city" name="city" list="cand-cities" defaultValue={v.city} />
            <datalist id="cand-cities">
              {SAUDI_CITIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field label="Nationality" htmlFor="nationality" error={fe.nationality}>
            <Input id="nationality" name="nationality" defaultValue={v.nationality} />
          </Field>
          <Field label="Visa / residency" htmlFor="visaStatus" error={fe.visaStatus}>
            <Select id="visaStatus" name="visaStatus" defaultValue={v.visaStatus || "not_specified"}>
              {VISA_STATUSES.map((x) => (
                <option key={x.value} value={x.value}>
                  {x.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Status" htmlFor="status" error={fe.status}>
            <Select id="status" name="status" defaultValue={v.status || "active"}>
              {Object.entries(CANDIDATE_STATUS_META).map(([k, m]) => (
                <option key={k} value={k}>
                  {m.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Skills" htmlFor="skills" error={fe.skills} hint="Comma separated" className="sm:col-span-2">
            <Input id="skills" name="skills" defaultValue={v.skills} />
          </Field>
          <div className="sm:col-span-2">
            <TagInput name="tags" label="Tags" defaultValue={v.tags} suggestions={tagSuggestions} hint="Your own labels for finding people fast, e.g. Driver, Available now, Arabic" />
          </div>
        </Block>
        <Block title="CV & notes">
          <div className="sm:col-span-2">
            <FilePicker name="cv" label={hasCv ? "Replace CV" : "CV"} error={fe.cv} />
          </div>
          <Field label="Notes" htmlFor="notes" error={fe.notes} className="sm:col-span-2">
            <Textarea id="notes" name="notes" rows={5} defaultValue={v.notes} placeholder="Interview notes, salary expectation, notice period..." />
          </Field>
        </Block>
        <div className="flex flex-col-reverse gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="sm:max-w-md">
            {state.error && <Alert>{state.error}</Alert>}
            {state.success && <Alert tone="success">{state.success}</Alert>}
          </div>
          <Button type="submit" variant="dark" disabled={pending}>
            {pending ? "Saving..." : id ? "Save changes" : "Add candidate"}
          </Button>
        </div>
      </Card>
    </form>
  );
}

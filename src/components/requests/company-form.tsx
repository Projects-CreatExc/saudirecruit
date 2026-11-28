"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { submitCompanyRequestAction } from "@/lib/actions/requests";
import type { FormState } from "@/lib/actions/auth";
import { CATEGORIES, SAUDI_CITIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Alert, Field, Input, Label, Select, Textarea } from "@/components/ui/field";
import { Card } from "@/components/ui/misc";
import { Consent, FilePicker, Honeypot, Sent } from "./shared";

type Role = { title: string; count: string; salary: string; notes: string };
const blank = (): Role => ({ title: "", count: "", salary: "", notes: "" });

export function CompanyRequestForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(submitCompanyRequestAction, {});
  const fe = state.fieldErrors ?? {};
  const v = state.values ?? {};
  const [roles, setRoles] = useState<Role[]>(() => {
    try {
      const saved = JSON.parse(v.roles || "[]");
      return Array.isArray(saved) && saved.length ? saved : [blank()];
    } catch {
      return [blank()];
    }
  });

  if (state.success) return <Sent title="Request received" body={state.success} />;

  const set = (i: number, k: keyof Role, val: string) => setRoles((rs) => rs.map((r, j) => (j === i ? { ...r, [k]: val } : r)));

  return (
    <form action={action} noValidate className="relative">
      <Honeypot />
      <input type="hidden" name="roles" value={JSON.stringify(roles.filter((r) => r.title.trim()))} />
      <Card className="divide-y divide-line">
        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <h2 className="text-[15px] font-semibold sm:col-span-2">Company</h2>
          <Field label="Company name" htmlFor="companyName" error={fe.companyName} className="sm:col-span-2">
            <Input id="companyName" name="companyName" autoComplete="organization" defaultValue={v.companyName} aria-invalid={!!fe.companyName} />
          </Field>
          <Field label="Industry" htmlFor="industry" error={fe.industry}>
            <Select id="industry" name="industry" defaultValue={v.industry ?? ""}>
              <option value="">Select industry</option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="City" htmlFor="city" error={fe.city}>
            <Select id="city" name="city" defaultValue={v.city ?? ""}>
              <option value="">Select city</option>
              {SAUDI_CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Contact person" htmlFor="fullName" error={fe.fullName}>
            <Input id="fullName" name="fullName" autoComplete="name" defaultValue={v.fullName} aria-invalid={!!fe.fullName} />
          </Field>
          <Field label="Phone / WhatsApp" htmlFor="phone" error={fe.phone}>
            <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+966" defaultValue={v.phone} aria-invalid={!!fe.phone} />
          </Field>
          <Field label="Work email" htmlFor="email" error={fe.email} className="sm:col-span-2">
            <Input id="email" name="email" type="email" autoComplete="email" defaultValue={v.email} aria-invalid={!!fe.email} />
          </Field>
        </div>

        <div className="space-y-4 p-6">
          <div>
            <h2 className="text-[15px] font-semibold">Roles you need</h2>
            <p className="mt-0.5 text-sm text-muted">Add each position. Leave empty if you&apos;d rather attach a file or write a message.</p>
          </div>
          {roles.map((r, i) => (
            <div key={i} className="grid gap-3 rounded-2xl border border-line p-4 sm:grid-cols-[1fr_110px_160px_auto]">
              <div>
                <Label htmlFor={`role-title-${i}`}>Job title</Label>
                <Input id={`role-title-${i}`} value={r.title} onChange={(e) => set(i, "title", e.target.value)} placeholder="e.g. Electrician" />
              </div>
              <div>
                <Label htmlFor={`role-count-${i}`}>People</Label>
                <Input id={`role-count-${i}`} type="number" min={1} inputMode="numeric" value={r.count} onChange={(e) => set(i, "count", e.target.value)} placeholder="1" />
              </div>
              <div>
                <Label htmlFor={`role-salary-${i}`}>Salary (SAR)</Label>
                <Input id={`role-salary-${i}`} value={r.salary} onChange={(e) => set(i, "salary", e.target.value)} placeholder="e.g. 6,000 - 8,000" />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => setRoles((rs) => (rs.length > 1 ? rs.filter((_, j) => j !== i) : [blank()]))}
                  aria-label={`Remove role ${i + 1}`}
                  className="inline-flex size-11 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-danger"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="sm:col-span-4">
                <Label htmlFor={`role-notes-${i}`}>Requirements</Label>
                <Input id={`role-notes-${i}`} value={r.notes} onChange={(e) => set(i, "notes", e.target.value)} placeholder="Experience, certificates, language, nationality..." />
              </div>
            </div>
          ))}
          {fe.roles && <p className="text-sm text-danger">{fe.roles}</p>}
          {roles.length < 20 && (
            <Button variant="outline" size="sm" onClick={() => setRoles((rs) => [...rs, blank()])}>
              <Plus className="size-4" /> Add another role
            </Button>
          )}
        </div>

        <div className="grid gap-5 p-6">
          <FilePicker name="attachment" label="Job description or requirements file" error={fe.attachment} />
          <Field label="Message" htmlFor="message" error={fe.message}>
            <Textarea id="message" name="message" rows={4} placeholder="Start date, project details, accommodation or transport provided..." defaultValue={v.message} />
          </Field>
        </div>

        <div className="space-y-4 p-6">
          <Consent text="I agree that SaudiRecruit may store these details and contact me about this hiring request." error={fe.consent} />
          {state.error && <Alert>{state.error}</Alert>}
          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={pending}>
            {pending ? "Sending..." : "Send hiring request"}
          </Button>
        </div>
      </Card>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { saveCompanyAction } from "@/lib/actions/recruiting";
import type { FormState } from "@/lib/actions/auth";
import { CATEGORIES, SAUDI_CITIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Alert, Field, Input, Select, Textarea } from "@/components/ui/field";
import { Card } from "@/components/ui/misc";

type Initial = Record<string, string>;

export function CompanyForm({ initial, isNew }: { initial: Initial; isNew: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveCompanyAction, {});
  const fe = state.fieldErrors ?? {};
  const v = { ...initial, ...(state.values ?? {}) };

  return (
    <form action={action} noValidate>
      <Card className="divide-y divide-line">
        <div className="grid gap-5 p-6 sm:grid-cols-2">
          <Field label="Company name" htmlFor="name" error={fe.name} className="sm:col-span-2">
            <Input id="name" name="name" defaultValue={v.name} aria-invalid={!!fe.name} />
          </Field>
          <Field label="Industry" htmlFor="industry" error={fe.industry}>
            <Select id="industry" name="industry" defaultValue={v.industry ?? ""}>
              <option value="">Select industry</option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Headquarters city" htmlFor="city" error={fe.city}>
            <Select id="city" name="city" defaultValue={v.city ?? ""}>
              <option value="">Select city</option>
              {SAUDI_CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Website" htmlFor="website" error={fe.website}>
            <Input id="website" name="website" type="url" placeholder="https://" defaultValue={v.website} aria-invalid={!!fe.website} />
          </Field>
          <Field label="Commercial Registration (CR) number" htmlFor="crNumber" error={fe.crNumber} hint="Used to verify your company. Never shown publicly.">
            <Input id="crNumber" name="crNumber" defaultValue={v.crNumber} />
          </Field>
          <Field label="Employees" htmlFor="employeeCount" error={fe.employeeCount}>
            <Input id="employeeCount" name="employeeCount" type="number" min={1} inputMode="numeric" defaultValue={v.employeeCount} />
          </Field>
          <Field label="Founded" htmlFor="foundedYear" error={fe.foundedYear}>
            <Input id="foundedYear" name="foundedYear" type="number" min={1800} inputMode="numeric" placeholder="e.g. 2015" defaultValue={v.foundedYear} />
          </Field>
          <Field label="About the company" htmlFor="description" error={fe.description} className="sm:col-span-2">
            <Textarea id="description" name="description" rows={6} defaultValue={v.description} placeholder="What you do, your mission, and what it's like to work with you." />
          </Field>
        </div>
        <div className="flex flex-col-reverse gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="sm:max-w-md">
            {state.error && <Alert>{state.error}</Alert>}
            {state.success && <Alert tone="success">{state.success}</Alert>}
          </div>
          <Button type="submit" variant="dark" disabled={pending}>
            {pending ? "Saving..." : isNew ? "Create company" : "Save changes"}
          </Button>
        </div>
      </Card>
    </form>
  );
}

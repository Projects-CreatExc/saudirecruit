"use client";

import { useActionState, useState } from "react";
import { Briefcase, UserRound } from "lucide-react";
import { registerAction, type FormState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Alert, Field, Input } from "@/components/ui/field";
import { cn } from "@/lib/utils";

const roles = [
  { value: "job_seeker", label: "I'm looking for a job", icon: UserRound },
  { value: "employer", label: "I'm looking to hire", icon: Briefcase },
] as const;

export function RegisterForm({ defaultRole }: { defaultRole: "job_seeker" | "employer" }) {
  const [state, action, pending] = useActionState<FormState, FormData>(registerAction, {});
  const [role, setRole] = useState<string>(state.values?.role ?? defaultRole);
  const fe = state.fieldErrors ?? {};
  const v = state.values ?? {};

  return (
    <form action={action} className="space-y-5" noValidate>
      {state.error && <Alert>{state.error}</Alert>}

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Account type</legend>
        <div className="grid grid-cols-2 gap-2">
          {roles.map((r) => (
            <label
              key={r.value}
              className={cn(
                "flex cursor-pointer flex-col gap-2 rounded-2xl border p-4 text-sm font-medium transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand",
                role === r.value ? "border-ink bg-surface" : "border-line-strong hover:border-muted",
              )}
            >
              <input type="radio" name="role" value={r.value} checked={role === r.value} onChange={() => setRole(r.value)} className="sr-only" />
              <r.icon className="size-5" aria-hidden />
              {r.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" htmlFor="firstName" error={fe.firstName}>
          <Input id="firstName" name="firstName" autoComplete="given-name" defaultValue={v.firstName} aria-invalid={!!fe.firstName} />
        </Field>
        <Field label="Last name" htmlFor="lastName" error={fe.lastName}>
          <Input id="lastName" name="lastName" autoComplete="family-name" defaultValue={v.lastName} aria-invalid={!!fe.lastName} />
        </Field>
      </div>
      <Field label={role === "employer" ? "Work email" : "Email"} htmlFor="email" error={fe.email}>
        <Input id="email" name="email" type="email" autoComplete="email" defaultValue={v.email} aria-invalid={!!fe.email} />
      </Field>
      <Field label="Password" htmlFor="password" error={fe.password} hint="At least 8 characters, with one uppercase letter and one number.">
        <Input id="password" name="password" type="password" autoComplete="new-password" aria-invalid={!!fe.password} />
      </Field>
      <Field label="Confirm password" htmlFor="confirmPassword" error={fe.confirmPassword}>
        <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" aria-invalid={!!fe.confirmPassword} />
      </Field>

      <Button type="submit" variant="dark" size="lg" className="w-full" disabled={pending}>
        {pending ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}

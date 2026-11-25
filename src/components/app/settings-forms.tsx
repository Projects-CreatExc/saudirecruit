"use client";

import { useActionState } from "react";
import { changePasswordAction, saveSettingsAction } from "@/lib/actions/recruiting";
import type { FormState } from "@/lib/actions/auth";
import { EXPERIENCE_LEVELS, SAUDI_CITIES, VISA_STATUSES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Alert, Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { Card } from "@/components/ui/misc";

type Initial = Record<string, string | boolean>;

function Block({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-6 p-6 lg:grid-cols-[220px_1fr]">
      <div>
        <h2 className="text-[15px] font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </div>
  );
}

export function ProfileForm({ initial, email, isSeeker }: { initial: Initial; email: string; isSeeker: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveSettingsAction, {});
  const fe = state.fieldErrors ?? {};
  const s = (k: string) => (typeof initial[k] === "string" ? (initial[k] as string) : "");

  return (
    <form action={action} noValidate>
      <Card className="divide-y divide-line">
        <Block title="Account" description="Your name and contact details.">
          <Field label="First name" htmlFor="firstName" error={fe.firstName}>
            <Input id="firstName" name="firstName" defaultValue={s("firstName")} aria-invalid={!!fe.firstName} />
          </Field>
          <Field label="Last name" htmlFor="lastName" error={fe.lastName}>
            <Input id="lastName" name="lastName" defaultValue={s("lastName")} aria-invalid={!!fe.lastName} />
          </Field>
          <Field label="Email" htmlFor="email" hint="Contact support to change your email.">
            <Input id="email" value={email} disabled readOnly />
          </Field>
          <Field label="Phone" htmlFor="phone" error={fe.phone}>
            <Input id="phone" name="phone" type="tel" placeholder="+966 5X XXX XXXX" defaultValue={s("phone")} aria-invalid={!!fe.phone} />
          </Field>
        </Block>

        {isSeeker && (
          <>
            <Block title="Professional profile" description="Employers see this when you apply.">
              <Field label="Headline" htmlFor="headline" error={fe.headline} className="sm:col-span-2">
                <Input id="headline" name="headline" placeholder="e.g. Mechanical engineer with 6 years in oil & gas" defaultValue={s("headline")} />
              </Field>
              <Field label="Current job title" htmlFor="currentJobTitle" error={fe.currentJobTitle}>
                <Input id="currentJobTitle" name="currentJobTitle" defaultValue={s("currentJobTitle")} />
              </Field>
              <Field label="Desired job title" htmlFor="desiredJobTitle" error={fe.desiredJobTitle}>
                <Input id="desiredJobTitle" name="desiredJobTitle" defaultValue={s("desiredJobTitle")} />
              </Field>
              <Field label="Experience level" htmlFor="experienceLevel" error={fe.experienceLevel}>
                <Select id="experienceLevel" name="experienceLevel" defaultValue={s("experienceLevel")}>
                  <option value="">Select level</option>
                  {EXPERIENCE_LEVELS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Years of experience" htmlFor="totalExperienceYears" error={fe.totalExperienceYears}>
                <Input id="totalExperienceYears" name="totalExperienceYears" type="number" min={0} max={60} inputMode="numeric" defaultValue={s("totalExperienceYears")} />
              </Field>
              <Field label="Skills" htmlFor="skills" error={fe.skills} hint="Comma separated" className="sm:col-span-2">
                <Input id="skills" name="skills" defaultValue={s("skills")} />
              </Field>
              <Field label="Summary" htmlFor="summary" error={fe.summary} className="sm:col-span-2">
                <Textarea id="summary" name="summary" rows={5} defaultValue={s("summary")} />
              </Field>
            </Block>

            <Block title="Location & eligibility" description="Helps employers check visa and relocation fit.">
              <Field label="Current city" htmlFor="currentCity" error={fe.currentCity}>
                <Input id="currentCity" name="currentCity" list="cities" defaultValue={s("currentCity")} />
                <datalist id="cities">
                  {SAUDI_CITIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </Field>
              <Field label="Visa / residency status" htmlFor="visaStatus" error={fe.visaStatus}>
                <Select id="visaStatus" name="visaStatus" defaultValue={s("visaStatus") || "not_specified"}>
                  {VISA_STATUSES.map((v) => (
                    <option key={v.value} value={v.value}>
                      {v.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Checkbox name="isOpenToWork" label="Open to new opportunities" defaultChecked={initial.isOpenToWork !== false} />
              <Checkbox name="isProfilePublic" label="Let employers discover my profile" defaultChecked={initial.isProfilePublic !== false} />
            </Block>
          </>
        )}

        <div className="flex flex-col-reverse gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="sm:max-w-md">
            {state.error && <Alert>{state.error}</Alert>}
            {state.success && <Alert tone="success">{state.success}</Alert>}
          </div>
          <Button type="submit" variant="dark" disabled={pending}>
            {pending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </Card>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(changePasswordAction, {});
  const fe = state.fieldErrors ?? {};
  return (
    <form action={action} noValidate>
      <Card className="divide-y divide-line">
        <Block title="Password" description="Use at least 8 characters with an uppercase letter and a number.">
          <Field label="Current password" htmlFor="currentPassword" error={fe.currentPassword} className="sm:col-span-2">
            <Input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" aria-invalid={!!fe.currentPassword} />
          </Field>
          <Field label="New password" htmlFor="newPassword" error={fe.newPassword}>
            <Input id="newPassword" name="newPassword" type="password" autoComplete="new-password" aria-invalid={!!fe.newPassword} />
          </Field>
          <Field label="Confirm new password" htmlFor="confirmPassword" error={fe.confirmPassword}>
            <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" aria-invalid={!!fe.confirmPassword} />
          </Field>
        </Block>
        <div className="flex flex-col-reverse gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="sm:max-w-md">
            {state.error && <Alert>{state.error}</Alert>}
            {state.success && <Alert tone="success">{state.success}</Alert>}
          </div>
          <Button type="submit" variant="outline" disabled={pending}>
            {pending ? "Updating..." : "Update password"}
          </Button>
        </div>
      </Card>
    </form>
  );
}

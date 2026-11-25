"use client";

import { useActionState } from "react";
import { createJobAction } from "@/lib/actions/recruiting";
import type { FormState } from "@/lib/actions/auth";
import { CATEGORIES, EXPERIENCE_LEVELS, JOB_TYPES, SAUDI_CITIES, VISA_STATUSES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Alert, Checkbox, Field, Input, Select, Textarea } from "@/components/ui/field";
import { Card } from "@/components/ui/misc";

function Group({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
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

export function JobForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createJobAction, {});
  const fe = state.fieldErrors ?? {};
  const v = state.values ?? {};

  return (
    <form action={action} noValidate>
      <Card className="divide-y divide-line">
        <Group title="The role" description="A clear title and description get more qualified applicants.">
          <Field label="Job title" htmlFor="title" error={fe.title} className="sm:col-span-2">
            <Input id="title" name="title" placeholder="e.g. Senior Civil Engineer" defaultValue={v.title} aria-invalid={!!fe.title} />
          </Field>
          <Field label="Category" htmlFor="category" error={fe.category}>
            <Select id="category" name="category" defaultValue={v.category ?? ""}>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Job type" htmlFor="jobType" error={fe.jobType}>
            <Select id="jobType" name="jobType" defaultValue={v.jobType || "full_time"}>
              {JOB_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Experience level" htmlFor="experienceLevel" error={fe.experienceLevel}>
            <Select id="experienceLevel" name="experienceLevel" defaultValue={v.experienceLevel ?? ""}>
              <option value="">Any level</option>
              {EXPERIENCE_LEVELS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Skills" htmlFor="skills" error={fe.skills} hint="Comma separated, e.g. AutoCAD, Project management">
            <Input id="skills" name="skills" defaultValue={v.skills} />
          </Field>
          <Field label="Description" htmlFor="description" error={fe.description} hint="At least 50 characters." className="sm:col-span-2">
            <Textarea id="description" name="description" rows={7} defaultValue={v.description} aria-invalid={!!fe.description} />
          </Field>
          <Field label="Requirements" htmlFor="requirements" error={fe.requirements} className="sm:col-span-2">
            <Textarea id="requirements" name="requirements" rows={5} defaultValue={v.requirements} />
          </Field>
          <Field label="Benefits" htmlFor="benefits" error={fe.benefits} className="sm:col-span-2">
            <Textarea id="benefits" name="benefits" rows={4} defaultValue={v.benefits} placeholder="Housing allowance, transport, medical insurance, annual flights..." />
          </Field>
        </Group>

        <Group title="Location" description="Where the work happens.">
          <Field label="City" htmlFor="city" error={fe.city}>
            <Select id="city" name="city" defaultValue={v.city ?? ""}>
              <option value="">Select city</option>
              {SAUDI_CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <div className="flex items-end pb-2.5">
            <Checkbox name="isRemote" label="Remote friendly" defaultChecked={v.isRemote === "on"} />
          </div>
        </Group>

        <Group title="Compensation" description="Monthly salary in SAR. Roles with a salary get more applicants.">
          <Field label="Minimum (SAR)" htmlFor="salaryMin" error={fe.salaryMin}>
            <Input id="salaryMin" name="salaryMin" type="number" min={0} inputMode="numeric" defaultValue={v.salaryMin} />
          </Field>
          <Field label="Maximum (SAR)" htmlFor="salaryMax" error={fe.salaryMax}>
            <Input id="salaryMax" name="salaryMax" type="number" min={0} inputMode="numeric" defaultValue={v.salaryMax} aria-invalid={!!fe.salaryMax} />
          </Field>
          <Checkbox name="isSalaryHidden" label="Hide salary from the public listing" defaultChecked={v.isSalaryHidden === "on"} className="sm:col-span-2" />
        </Group>

        <Group title="Eligibility" description="Saudi-specific requirements, shown to candidates before they apply.">
          <Field label="Visa / residency requirement" htmlFor="visaRequirement" error={fe.visaRequirement}>
            <Select id="visaRequirement" name="visaRequirement" defaultValue={v.visaRequirement || "not_specified"}>
              {VISA_STATUSES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>
          <div className="flex items-end pb-2.5">
            <Checkbox name="saudizationApplicable" label="Saudization (Nitaqat) role" defaultChecked={v.saudizationApplicable === "on"} />
          </div>
        </Group>

        <div className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="sm:max-w-md">{state.error && <Alert>{state.error}</Alert>}</div>
          <div className="flex gap-2">
            <Button type="submit" name="intent" value="draft" variant="outline" disabled={pending}>
              Save draft
            </Button>
            <Button type="submit" name="intent" value="publish" disabled={pending}>
              {pending ? "Saving..." : "Publish job"}
            </Button>
          </div>
        </div>
      </Card>
    </form>
  );
}

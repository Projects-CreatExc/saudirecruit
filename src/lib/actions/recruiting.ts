"use server";

import bcrypt from "bcryptjs";
import { and, eq, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { isAdminRole, isEmployerRole, isSeekerRole, serializeSkills } from "@/lib/constants";
import { db } from "@/lib/db";
import { applications, companies, jobs, jobSeekerProfiles, users } from "@/lib/db/schema";
import { slugify } from "@/lib/utils";
import { createJobSchema } from "@/lib/validations/job";
import type { ApplicationStatus, JobStatus } from "@/types";
import type { FormState } from "./auth";

const str = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim() : "";
};
const opt = (fd: FormData, k: string) => str(fd, k) || undefined;

function flatten(issues: { path: PropertyKey[]; message: string }[]) {
  const out: Record<string, string> = {};
  for (const i of issues) {
    const key = String(i.path[0] ?? "form");
    if (!out[key]) out[key] = i.message;
  }
  return out;
}

async function ownCompanyId(userId: string) {
  const [c] = await db
    .select({ id: companies.id })
    .from(companies)
    .where(and(eq(companies.ownerId, userId), isNull(companies.deletedAt)))
    .limit(1);
  return c?.id ?? null;
}

/* ---------- Candidates ---------- */

export async function applyToJobAction(_: FormState, formData: FormData): Promise<FormState> {
  const jobId = str(formData, "jobId");
  const slug = str(formData, "slug");
  const user = await getSessionUser();
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent(`/jobs/${slug}`)}`);
  if (!isSeekerRole(user.role)) return { error: "Only job seeker accounts can apply to roles." };

  const coverLetter = str(formData, "coverLetter").slice(0, 5000) || null;
  try {
    const [job] = await db
      .select({ id: jobs.id })
      .from(jobs)
      .where(and(eq(jobs.id, jobId), eq(jobs.status, "active"), isNull(jobs.deletedAt)))
      .limit(1);
    if (!job) return { error: "This role is no longer accepting applications." };

    const [profile] = await db
      .select({ resumeUrl: jobSeekerProfiles.resumeUrl })
      .from(jobSeekerProfiles)
      .where(eq(jobSeekerProfiles.userId, user.id))
      .limit(1);

    const inserted = await db
      .insert(applications)
      .values({ jobId, applicantId: user.id, coverLetter, resumeUrl: profile?.resumeUrl ?? null })
      .onConflictDoNothing()
      .returning({ id: applications.id });

    if (!inserted.length) return { error: "You've already applied to this role." };
    await db
      .update(jobs)
      .set({ applicationCount: sql`${jobs.applicationCount} + 1` })
      .where(eq(jobs.id, jobId));
  } catch (err) {
    console.error("[apply]", err);
    return { error: "We couldn't submit your application. Please try again." };
  }
  revalidatePath(`/jobs/${slug}`);
  revalidatePath("/applications");
  return { success: "Application sent. You can track it under Applications." };
}

export async function withdrawApplicationAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const id = str(formData, "applicationId");
  await db
    .update(applications)
    .set({ status: "withdrawn", updatedAt: new Date() })
    .where(and(eq(applications.id, id), eq(applications.applicantId, user.id)));
  revalidatePath("/applications");
  revalidatePath("/dashboard");
}

/* ---------- Employers ---------- */

const companySchema = z.object({
  name: z.string().min(2, "Company name is required").max(255),
  industry: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  website: z
    .string()
    .max(500)
    .optional()
    .refine((v) => !v || /^https?:\/\/\S+\.\S+/.test(v), "Use a full URL, e.g. https://example.com"),
  description: z.string().max(5000).optional(),
  employeeCount: z.coerce.number().int().min(1).max(1_000_000).optional(),
  foundedYear: z.coerce.number().int().min(1800).max(new Date().getFullYear()).optional(),
  crNumber: z.string().max(50).optional(),
});

export async function saveCompanyAction(_: FormState, formData: FormData): Promise<FormState> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!isEmployerRole(user.role)) return { error: "Only employer accounts can manage a company profile." };

  const raw = {
    name: str(formData, "name"),
    industry: opt(formData, "industry"),
    city: opt(formData, "city"),
    website: opt(formData, "website"),
    description: opt(formData, "description"),
    employeeCount: opt(formData, "employeeCount"),
    foundedYear: opt(formData, "foundedYear"),
    crNumber: opt(formData, "crNumber"),
  };
  const values = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, v ?? ""]));
  const parsed = companySchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: flatten(parsed.error.issues), values };

  try {
    const existingId = await ownCompanyId(user.id);
    if (existingId) {
      await db
        .update(companies)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(companies.id, existingId));
    } else {
      const slug = `${slugify(parsed.data.name) || "company"}-${crypto.randomUUID().slice(0, 6)}`;
      await db.insert(companies).values({ ...parsed.data, slug, ownerId: user.id });
    }
  } catch (err) {
    console.error("[company]", err);
    return { error: "We couldn't save your company profile. Please try again.", values };
  }
  revalidatePath("/dashboard", "layout");
  revalidatePath("/companies");
  return { success: "Company profile saved.", values };
}

export async function createJobAction(_: FormState, formData: FormData): Promise<FormState> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!isEmployerRole(user.role)) return { error: "Only employer accounts can post jobs." };

  const raw = {
    title: str(formData, "title"),
    description: str(formData, "description"),
    requirements: opt(formData, "requirements"),
    benefits: opt(formData, "benefits"),
    jobType: str(formData, "jobType") || "full_time",
    experienceLevel: opt(formData, "experienceLevel"),
    category: opt(formData, "category"),
    skills: opt(formData, "skills"),
    city: opt(formData, "city"),
    isRemote: formData.get("isRemote") === "on",
    salaryMin: opt(formData, "salaryMin"),
    salaryMax: opt(formData, "salaryMax"),
    isSalaryHidden: formData.get("isSalaryHidden") === "on",
    visaRequirement: str(formData, "visaRequirement") || "not_specified",
    saudizationApplicable: formData.get("saudizationApplicable") === "on",
  };
  const values = {
    ...Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, typeof v === "boolean" ? (v ? "on" : "") : (v ?? "")])),
    tags: str(formData, "tags"),
  };
  const parsed = createJobSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: flatten(parsed.error.issues), values };
  const d = parsed.data;
  if (d.salaryMin && d.salaryMax && Number(d.salaryMin) > Number(d.salaryMax)) {
    return { fieldErrors: { salaryMax: "Maximum must be greater than minimum" }, values };
  }

  let slug = "";
  try {
    const companyId = await ownCompanyId(user.id);
    if (!companyId) return { error: "Create your company profile before posting a job.", values };
    const publish = formData.get("intent") !== "draft";
    slug = `${slugify(d.title) || "job"}-${crypto.randomUUID().slice(0, 8)}`;
    await db.insert(jobs).values({
      ...d,
      salaryMin: d.salaryMin || null,
      salaryMax: d.salaryMax || null,
      skills: serializeSkills(d.skills),
      tags: serializeSkills(str(formData, "tags")),
      slug,
      companyId,
      postedById: user.id,
      status: publish ? "active" : "draft",
      publishedAt: publish ? new Date() : null,
    });
  } catch (err) {
    console.error("[createJob]", err);
    return { error: "We couldn't save this job. Please try again.", values };
  }
  revalidatePath("/jobs");
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/jobs");
}

const EMPLOYER_JOB_STATUSES: JobStatus[] = ["draft", "active", "filled", "closed"];
const ADMIN_JOB_STATUSES: JobStatus[] = [...EMPLOYER_JOB_STATUSES, "under_review", "suspended"];

export async function setJobStatusAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const jobId = str(formData, "jobId");
  const status = str(formData, "status") as JobStatus;

  if (isAdminRole(user.role)) {
    if (!ADMIN_JOB_STATUSES.includes(status)) return;
    await db.update(jobs).set({ status, updatedAt: new Date() }).where(eq(jobs.id, jobId));
  } else if (isEmployerRole(user.role)) {
    if (!EMPLOYER_JOB_STATUSES.includes(status)) return;
    const companyId = await ownCompanyId(user.id);
    if (!companyId) return;
    const [job] = await db.select({ publishedAt: jobs.publishedAt, status: jobs.status }).from(jobs).where(and(eq(jobs.id, jobId), eq(jobs.companyId, companyId))).limit(1);
    if (!job || job.status === "suspended") return;
    await db
      .update(jobs)
      .set({ status, updatedAt: new Date(), publishedAt: status === "active" && !job.publishedAt ? new Date() : job.publishedAt })
      .where(and(eq(jobs.id, jobId), eq(jobs.companyId, companyId)));
  } else {
    return;
  }
  revalidatePath("/dashboard", "layout");
  revalidatePath("/jobs");
}

const PIPELINE: ApplicationStatus[] = ["applied", "shortlisted", "interview", "offer", "hired", "rejected"];

export async function setApplicationStatusAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user || !isEmployerRole(user.role)) redirect("/login");
  const id = str(formData, "applicationId");
  const status = str(formData, "status") as ApplicationStatus;
  if (!PIPELINE.includes(status)) return;
  const companyId = await ownCompanyId(user.id);
  if (!companyId) return;

  const [app] = await db
    .select({ id: applications.id, status: applications.status })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .where(and(eq(applications.id, id), eq(jobs.companyId, companyId)))
    .limit(1);
  if (!app || app.status === "withdrawn") return;

  await db
    .update(applications)
    .set({ status, reviewedById: user.id, reviewedAt: new Date(), updatedAt: new Date() })
    .where(eq(applications.id, id));
  revalidatePath("/dashboard/applicants");
  revalidatePath("/dashboard");
}

/* ---------- Settings ---------- */

const accountSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters").max(100),
  lastName: z.string().min(2, "Last name must be at least 2 characters").max(100),
  phone: z
    .string()
    .max(20)
    .optional()
    .refine((v) => !v || /^\+?[0-9\s-]{7,20}$/.test(v), "Enter a valid phone number"),
});

const profileSchema = z.object({
  headline: z.string().max(255).optional(),
  summary: z.string().max(5000).optional(),
  currentCity: z.string().max(100).optional(),
  currentJobTitle: z.string().max(255).optional(),
  desiredJobTitle: z.string().max(255).optional(),
  totalExperienceYears: z.coerce.number().int().min(0).max(60).optional(),
  experienceLevel: z.enum(["entry", "mid", "senior", "lead", "executive"]).optional(),
  visaStatus: z.enum(["citizen", "resident", "work_visa", "visit_visa", "transferable", "not_specified"]).optional(),
  skills: z.string().max(2000).optional(),
});

export async function saveSettingsAction(_: FormState, formData: FormData): Promise<FormState> {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const acc = accountSchema.safeParse({
    firstName: str(formData, "firstName"),
    lastName: str(formData, "lastName"),
    phone: opt(formData, "phone"),
  });
  let prof: ReturnType<typeof profileSchema.safeParse> | null = null;
  if (isSeekerRole(user.role)) {
    prof = profileSchema.safeParse({
      headline: opt(formData, "headline"),
      summary: opt(formData, "summary"),
      currentCity: opt(formData, "currentCity"),
      currentJobTitle: opt(formData, "currentJobTitle"),
      desiredJobTitle: opt(formData, "desiredJobTitle"),
      totalExperienceYears: opt(formData, "totalExperienceYears"),
      experienceLevel: opt(formData, "experienceLevel"),
      visaStatus: opt(formData, "visaStatus"),
      skills: opt(formData, "skills"),
    });
  }
  const fieldErrors = {
    ...(acc.success ? {} : flatten(acc.error.issues)),
    ...(prof && !prof.success ? flatten(prof.error.issues) : {}),
  };
  if (Object.keys(fieldErrors).length || !acc.success) return { fieldErrors };

  try {
    await db
      .update(users)
      .set({ ...acc.data, phone: acc.data.phone ?? null, updatedAt: new Date() })
      .where(eq(users.id, user.id));
    if (prof?.success) {
      const data = {
        ...prof.data,
        skills: serializeSkills(prof.data.skills),
        isOpenToWork: formData.get("isOpenToWork") === "on",
        isProfilePublic: formData.get("isProfilePublic") === "on",
        updatedAt: new Date(),
      };
      await db
        .insert(jobSeekerProfiles)
        .values({ userId: user.id, ...data })
        .onConflictDoUpdate({ target: jobSeekerProfiles.userId, set: data });
    }
  } catch (err) {
    console.error("[settings]", err);
    return { error: "We couldn't save your changes. Please try again." };
  }
  revalidatePath("/settings");
  revalidatePath("/dashboard", "layout");
  return { success: "Your changes have been saved." };
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

export async function changePasswordAction(_: FormState, formData: FormData): Promise<FormState> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { fieldErrors: flatten(parsed.error.issues) };
  try {
    const [row] = await db.select({ hash: users.passwordHash }).from(users).where(eq(users.id, user.id)).limit(1);
    if (!row || !(await bcrypt.compare(parsed.data.currentPassword, row.hash))) {
      return { fieldErrors: { currentPassword: "Current password is incorrect" } };
    }
    await db
      .update(users)
      .set({ passwordHash: await bcrypt.hash(parsed.data.newPassword, 12), updatedAt: new Date() })
      .where(eq(users.id, user.id));
  } catch (err) {
    console.error("[password]", err);
    return { error: "We couldn't update your password. Please try again." };
  }
  return { success: "Password updated." };
}

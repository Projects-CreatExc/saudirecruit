"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { fileFrom, saveAttachment } from "@/lib/agency";
import { getSessionUser } from "@/lib/auth/session";
import { isAdminRole, serializeSkills } from "@/lib/constants";
import { db } from "@/lib/db";
import {
  CANDIDATE_STATUSES,
  INQUIRY_STATUSES,
  candidates,
  companies,
  inquiries,
  jobs,
  siteSettings,
  type CandidateStatus,
  type InquiryStatus,
} from "@/lib/db/schema";
import { slugify } from "@/lib/utils";
import { createJobSchema } from "@/lib/validations/job";
import type { FormState } from "./auth";

async function admin() {
  const user = await getSessionUser();
  if (!user || !isAdminRole(user.role)) redirect("/dashboard");
  return user;
}

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
const UUID = /^[0-9a-f-]{36}$/i;

/* ---------- Requests ---------- */

export async function setInquiryStatusAction(formData: FormData) {
  await admin();
  const id = str(formData, "id");
  const status = str(formData, "status") as InquiryStatus;
  if (!UUID.test(id) || !INQUIRY_STATUSES.includes(status)) return;
  await db.update(inquiries).set({ status, updatedAt: new Date() }).where(eq(inquiries.id, id));
  revalidatePath("/dashboard", "layout");
}

export async function saveInquiryNotesAction(_: FormState, formData: FormData): Promise<FormState> {
  await admin();
  const id = str(formData, "id");
  if (!UUID.test(id)) return { error: "Unknown request." };
  await db
    .update(inquiries)
    .set({ adminNotes: str(formData, "adminNotes").slice(0, 5000) || null, updatedAt: new Date() })
    .where(eq(inquiries.id, id));
  revalidatePath(`/dashboard/admin/requests/${id}`);
  return { success: "Notes saved." };
}

/** Turns a CV submission or guest application into a talent-pool record (the CV file is reused, not copied). */
export async function convertToCandidateAction(formData: FormData) {
  const user = await admin();
  const id = str(formData, "id");
  if (!UUID.test(id)) return;
  const [inq] = await db.select().from(inquiries).where(eq(inquiries.id, id)).limit(1);
  if (!inq || inq.type === "company") return;
  if (inq.candidateId) redirect(`/dashboard/admin/candidates/${inq.candidateId}`);

  const [c] = await db
    .insert(candidates)
    .values({
      fullName: inq.fullName,
      email: inq.email,
      phone: inq.phone,
      city: inq.city,
      headline: inq.type === "application" ? null : inq.headline,
      experienceYears: inq.experienceYears,
      skills: inq.skills,
      notes: [inq.message, inq.adminNotes].filter(Boolean).join("\n\n") || null,
      attachmentId: inq.attachmentId,
      source: inq.type === "application" ? "application" : "request",
      createdById: user.id,
    })
    .returning({ id: candidates.id });
  await db.update(inquiries).set({ status: "converted", candidateId: c.id, updatedAt: new Date() }).where(eq(inquiries.id, id));
  revalidatePath("/dashboard", "layout");
  redirect(`/dashboard/admin/candidates/${c.id}?added=1`);
}

/* ---------- Talent pool ---------- */

const candidateSchema = z.object({
  fullName: z.string().min(2, "Enter the candidate's name").max(200),
  email: z.string().email("Enter a valid email").max(255).optional(),
  phone: z.string().max(30).optional(),
  city: z.string().max(100).optional(),
  nationality: z.string().max(100).optional(),
  headline: z.string().max(255).optional(),
  experienceYears: z.coerce.number().int().min(0).max(60).optional(),
  visaStatus: z.string().max(40).optional(),
  skills: z.string().max(2000).optional(),
  tags: z.string().max(2000).optional(),
  notes: z.string().max(10000).optional(),
  status: z.enum(CANDIDATE_STATUSES).default("active"),
});

export async function saveCandidateAction(_: FormState, formData: FormData): Promise<FormState> {
  const user = await admin();
  const id = str(formData, "id");
  const keys = ["fullName", "email", "phone", "city", "nationality", "headline", "experienceYears", "visaStatus", "skills", "tags", "notes", "status"];
  const values = Object.fromEntries(keys.map((k) => [k, str(formData, k)]));
  const parsed = candidateSchema.safeParse(Object.fromEntries(keys.map((k) => [k, opt(formData, k)])));
  if (!parsed.success) return { fieldErrors: flatten(parsed.error.issues), values };
  const d = parsed.data;

  const data = {
    ...d,
    email: d.email?.toLowerCase() ?? null,
    skills: serializeSkills(d.skills),
    tags: serializeSkills(d.tags),
    updatedAt: new Date(),
  };

  let savedId = id;
  try {
    const cv = fileFrom(formData, "cv");
    let attachmentId: string | undefined;
    if (cv) {
      const saved = await saveAttachment(cv);
      if ("error" in saved) return { fieldErrors: { cv: saved.error }, values };
      attachmentId = saved.id;
    }
    if (UUID.test(id)) {
      await db.update(candidates).set({ ...data, ...(attachmentId ? { attachmentId } : {}) }).where(eq(candidates.id, id));
    } else {
      const [row] = await db
        .insert(candidates)
        .values({ ...data, attachmentId, source: "manual", createdById: user.id })
        .returning({ id: candidates.id });
      savedId = row.id;
    }
  } catch (err) {
    console.error("[candidate save]", err);
    return { error: "We couldn't save this candidate. Please try again.", values };
  }
  revalidatePath("/dashboard/admin/candidates", "layout");
  if (!UUID.test(id)) redirect(`/dashboard/admin/candidates/${savedId}?added=1`);
  return { success: "Candidate saved.", values };
}

export async function setCandidateStatusAction(formData: FormData) {
  await admin();
  const id = str(formData, "id");
  const status = str(formData, "status") as CandidateStatus;
  if (!UUID.test(id) || !CANDIDATE_STATUSES.includes(status)) return;
  await db.update(candidates).set({ status, updatedAt: new Date() }).where(eq(candidates.id, id));
  revalidatePath("/dashboard/admin/candidates", "layout");
}

/* ---------- Companies (created and managed by the agency) ---------- */

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

export async function adminSaveCompanyAction(_: FormState, formData: FormData): Promise<FormState> {
  const user = await admin();
  const id = str(formData, "id");
  const keys = ["name", "industry", "city", "website", "description", "employeeCount", "foundedYear", "crNumber"];
  const values = Object.fromEntries(keys.map((k) => [k, str(formData, k)]));
  const parsed = companySchema.safeParse(Object.fromEntries(keys.map((k) => [k, opt(formData, k)])));
  if (!parsed.success) return { fieldErrors: flatten(parsed.error.issues), values };

  const isVerified = formData.get("isVerified") === "on";
  let newId = id;
  try {
    if (UUID.test(id)) {
      await db.update(companies).set({ ...parsed.data, isVerified, updatedAt: new Date() }).where(eq(companies.id, id));
    } else {
      const slug = `${slugify(parsed.data.name) || "company"}-${crypto.randomUUID().slice(0, 6)}`;
      const [row] = await db
        .insert(companies)
        .values({ ...parsed.data, slug, ownerId: user.id, isVerified })
        .returning({ id: companies.id });
      newId = row.id;
      const fromRequest = str(formData, "fromRequest");
      if (UUID.test(fromRequest)) {
        await db.update(inquiries).set({ status: "in_review", updatedAt: new Date() }).where(eq(inquiries.id, fromRequest));
      }
    }
  } catch (err) {
    console.error("[admin company]", err);
    return { error: "We couldn't save this company. Please try again.", values };
  }
  revalidatePath("/companies");
  revalidatePath("/dashboard/admin/companies", "layout");
  if (!UUID.test(id)) {
    const fromRequest = str(formData, "fromRequest");
    redirect(`/dashboard/admin/jobs/new?company=${newId}${UUID.test(fromRequest) ? `&fromRequest=${fromRequest}` : ""}`);
  }
  return { success: "Company saved.", values };
}

/* ---------- Jobs announced by the agency ---------- */

export async function adminCreateJobAction(_: FormState, formData: FormData): Promise<FormState> {
  const user = await admin();
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
    companyId: str(formData, "companyId"),
    tags: str(formData, "tags"),
    isFeatured: formData.get("isFeatured") === "on" ? "on" : "",
  };
  const companyId = str(formData, "companyId");
  if (!UUID.test(companyId)) return { fieldErrors: { companyId: "Choose the company this job is for." }, values };
  const parsed = createJobSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: flatten(parsed.error.issues), values };
  const d = parsed.data;
  if (d.salaryMin && d.salaryMax && Number(d.salaryMin) > Number(d.salaryMax)) {
    return { fieldErrors: { salaryMax: "Maximum must be greater than minimum" }, values };
  }

  try {
    const [company] = await db.select({ id: companies.id }).from(companies).where(eq(companies.id, companyId)).limit(1);
    if (!company) return { fieldErrors: { companyId: "That company no longer exists." }, values };
    const publish = formData.get("intent") !== "draft";
    await db.insert(jobs).values({
      ...d,
      salaryMin: d.salaryMin || null,
      salaryMax: d.salaryMax || null,
      skills: serializeSkills(d.skills),
      tags: serializeSkills(str(formData, "tags")),
      isFeatured: formData.get("isFeatured") === "on",
      slug: `${slugify(d.title) || "job"}-${crypto.randomUUID().slice(0, 8)}`,
      companyId,
      postedById: user.id,
      status: publish ? "active" : "draft",
      publishedAt: publish ? new Date() : null,
    });
    const fromRequest = str(formData, "fromRequest");
    if (UUID.test(fromRequest)) {
      await db.update(inquiries).set({ status: "converted", updatedAt: new Date() }).where(eq(inquiries.id, fromRequest));
    }
  } catch (err) {
    console.error("[admin job]", err);
    return { error: "We couldn't save this job. Please try again.", values };
  }
  revalidatePath("/jobs");
  revalidatePath("/");
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/admin/jobs?posted=1");
}

/* ---------- Site settings ---------- */

const settingsSchema = z.object({
  whatsapp: z
    .string()
    .max(20)
    .optional()
    .refine((v) => !v || /^\+?[0-9\s-]{8,20}$/.test(v), "Use international format, e.g. +966 5X XXX XXXX"),
  contactEmail: z.string().email("Enter a valid email").max(255).optional(),
  contactPhone: z.string().max(30).optional(),
});

export async function saveSiteSettingsAction(_: FormState, formData: FormData): Promise<FormState> {
  await admin();
  const keys = ["whatsapp", "contactEmail", "contactPhone"] as const;
  const values = Object.fromEntries(keys.map((k) => [k, str(formData, k)]));
  const parsed = settingsSchema.safeParse(Object.fromEntries(keys.map((k) => [k, opt(formData, k)])));
  if (!parsed.success) return { fieldErrors: flatten(parsed.error.issues), values };
  try {
    for (const key of keys) {
      const value = parsed.data[key] ?? "";
      await db
        .insert(siteSettings)
        .values({ key, value, updatedAt: new Date() })
        .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } });
    }
  } catch (err) {
    console.error("[settings]", err);
    return { error: "We couldn't save settings. Run `npm run db:update` if this is a new install.", values };
  }
  revalidatePath("/", "layout");
  return { success: "Settings saved.", values };
}

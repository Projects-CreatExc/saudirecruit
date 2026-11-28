"use server";

import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { fileFrom, overRateLimit, saveAttachment, visitorHash } from "@/lib/agency";
import { serializeSkills } from "@/lib/constants";
import { db } from "@/lib/db";
import { inquiries, jobs } from "@/lib/db/schema";
import type { FormState } from "./auth";

/*
 * Public request forms: no account needed. Every submission lands in the
 * admin's Requests inbox. Protected by a consent checkbox, a hidden honeypot
 * field (bots fill it, people don't) and a per-visitor hourly limit.
 */

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

const phone = z
  .string()
  .min(7, "Enter a phone number we can reach you on")
  .max(30)
  .regex(/^\+?[0-9\s()-]{7,30}$/, "Enter a valid phone number");
const email = z.string().email("Enter a valid email address").max(255);

const SENT = "Thank you. Your request has been received and our team will contact you soon.";

async function guard(formData: FormData): Promise<{ error?: string; fieldErrors?: Record<string, string>; ipHash?: string }> {
  if (str(formData, "hp_field")) return { error: "skip" }; // honeypot filled: silently ignore
  if (formData.get("consent") !== "on") return { fieldErrors: { consent: "Please agree so we can process your details." } };
  const ipHash = await visitorHash();
  if (await overRateLimit(ipHash)) return { error: "Too many requests from your connection. Please try again in an hour." };
  return { ipHash };
}

/* ---------- Candidate: "Send your CV" ---------- */

const candidateSchema = z.object({
  fullName: z.string().min(2, "Enter your full name").max(200),
  email,
  phone,
  city: z.string().max(100).optional(),
  headline: z.string().max(255).optional(),
  experienceYears: z.coerce.number().int().min(0, "Enter 0 or more").max(60).optional(),
  skills: z.string().max(1000).optional(),
  message: z.string().max(3000).optional(),
});

export async function submitCandidateRequestAction(_: FormState, formData: FormData): Promise<FormState> {
  const values = Object.fromEntries(
    ["fullName", "email", "phone", "city", "headline", "experienceYears", "skills", "message"].map((k) => [k, str(formData, k)]),
  );
  const g = await guard(formData);
  if (g.error === "skip") return { success: SENT };
  if (g.error || g.fieldErrors) return { error: g.error, fieldErrors: g.fieldErrors, values };

  const parsed = candidateSchema.safeParse({
    fullName: str(formData, "fullName"),
    email: str(formData, "email"),
    phone: str(formData, "phone"),
    city: opt(formData, "city"),
    headline: opt(formData, "headline"),
    experienceYears: opt(formData, "experienceYears"),
    skills: opt(formData, "skills"),
    message: opt(formData, "message"),
  });
  if (!parsed.success) return { fieldErrors: flatten(parsed.error.issues), values };

  const cv = fileFrom(formData, "cv");
  if (!cv) return { fieldErrors: { cv: "Attach your CV (PDF or Word)." }, values };

  try {
    const saved = await saveAttachment(cv);
    if ("error" in saved) return { fieldErrors: { cv: saved.error }, values };
    await db.insert(inquiries).values({
      type: "candidate",
      ...parsed.data,
      email: parsed.data.email.toLowerCase(),
      skills: serializeSkills(parsed.data.skills),
      attachmentId: saved.id,
      consent: true,
      ipHash: g.ipHash,
    });
  } catch (err) {
    console.error("[candidate request]", err);
    return { error: "We couldn't send your details. Please try again.", values };
  }
  return { success: SENT };
}

/* ---------- Company: "Hire with us" ---------- */

const roleSchema = z.object({
  title: z.string().trim().min(2).max(150),
  count: z.coerce.number().int().min(1).max(500).optional(),
  salary: z.string().trim().max(60).optional(),
  notes: z.string().trim().max(500).optional(),
});

const companySchema = z.object({
  companyName: z.string().min(2, "Enter your company name").max(255),
  fullName: z.string().min(2, "Enter the contact person's name").max(200),
  email,
  phone,
  city: z.string().max(100).optional(),
  industry: z.string().max(100).optional(),
  message: z.string().max(5000).optional(),
});

export async function submitCompanyRequestAction(_: FormState, formData: FormData): Promise<FormState> {
  const values = Object.fromEntries(
    ["companyName", "fullName", "email", "phone", "city", "industry", "message", "roles"].map((k) => [k, str(formData, k)]),
  );
  const g = await guard(formData);
  if (g.error === "skip") return { success: SENT };
  if (g.error || g.fieldErrors) return { error: g.error, fieldErrors: g.fieldErrors, values };

  const parsed = companySchema.safeParse({
    companyName: str(formData, "companyName"),
    fullName: str(formData, "fullName"),
    email: str(formData, "email"),
    phone: str(formData, "phone"),
    city: opt(formData, "city"),
    industry: opt(formData, "industry"),
    message: opt(formData, "message"),
  });
  if (!parsed.success) return { fieldErrors: flatten(parsed.error.issues), values };

  let roles: z.infer<typeof roleSchema>[] = [];
  try {
    const raw = JSON.parse(str(formData, "roles") || "[]");
    roles = (Array.isArray(raw) ? raw : [])
      .filter((r) => r && typeof r.title === "string" && r.title.trim())
      .slice(0, 20)
      .map((r) => roleSchema.parse({ ...r, count: r.count || undefined, salary: r.salary || undefined, notes: r.notes || undefined }));
  } catch {
    return { fieldErrors: { roles: "Check the roles: each needs a job title." }, values };
  }

  const file = fileFrom(formData, "attachment");
  if (!roles.length && !parsed.data.message && !file) {
    return { fieldErrors: { roles: "Add at least one role, a message, or attach a file." }, values };
  }

  try {
    let attachmentId: string | undefined;
    if (file) {
      const saved = await saveAttachment(file);
      if ("error" in saved) return { fieldErrors: { attachment: saved.error }, values };
      attachmentId = saved.id;
    }
    await db.insert(inquiries).values({
      type: "company",
      ...parsed.data,
      email: parsed.data.email.toLowerCase(),
      roles: roles.length ? JSON.stringify(roles) : null,
      attachmentId,
      consent: true,
      ipHash: g.ipHash,
    });
  } catch (err) {
    console.error("[company request]", err);
    return { error: "We couldn't send your request. Please try again.", values };
  }
  return { success: SENT };
}

/* ---------- Guest application to a specific job ---------- */

const guestSchema = z.object({
  fullName: z.string().min(2, "Enter your full name").max(200),
  email,
  phone,
  message: z.string().max(3000).optional(),
});

export async function submitGuestApplicationAction(_: FormState, formData: FormData): Promise<FormState> {
  const values = Object.fromEntries(["fullName", "email", "phone", "message"].map((k) => [k, str(formData, k)]));
  const g = await guard(formData);
  if (g.error === "skip") return { success: SENT };
  if (g.error || g.fieldErrors) return { error: g.error, fieldErrors: g.fieldErrors, values };

  const parsed = guestSchema.safeParse({
    fullName: str(formData, "fullName"),
    email: str(formData, "email"),
    phone: str(formData, "phone"),
    message: opt(formData, "message"),
  });
  if (!parsed.success) return { fieldErrors: flatten(parsed.error.issues), values };

  const cv = fileFrom(formData, "cv");
  if (!cv) return { fieldErrors: { cv: "Attach your CV (PDF or Word)." }, values };

  try {
    const [job] = await db
      .select({ id: jobs.id, title: jobs.title, city: jobs.city })
      .from(jobs)
      .where(and(eq(jobs.id, str(formData, "jobId")), eq(jobs.status, "active"), isNull(jobs.deletedAt)))
      .limit(1);
    if (!job) return { error: "This role is no longer accepting applications.", values };

    const saved = await saveAttachment(cv);
    if ("error" in saved) return { fieldErrors: { cv: saved.error }, values };
    await db.insert(inquiries).values({
      type: "application",
      ...parsed.data,
      email: parsed.data.email.toLowerCase(),
      jobId: job.id,
      headline: `Applied for ${job.title}`.slice(0, 255),
      attachmentId: saved.id,
      consent: true,
      ipHash: g.ipHash,
    });
  } catch (err) {
    console.error("[guest application]", err);
    return { error: "We couldn't send your application. Please try again.", values };
  }
  return { success: "Application sent. Our team will review your CV and contact you if you're shortlisted." };
}

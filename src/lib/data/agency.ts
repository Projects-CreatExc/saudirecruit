import { and, count, desc, eq, ilike, isNull, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { attachments, candidates, companies, inquiries, jobs } from "@/lib/db/schema";
import { parseSkills } from "@/lib/constants";
import type { Result } from "./index";

const DB_ERROR = "We couldn't reach the database. Please try again shortly." as const;
async function safe<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return { data: await fn(), error: null };
  } catch (err) {
    console.error("[agency data]", err);
    return { data: null, error: DB_ERROR };
  }
}

const fileMeta = {
  fileId: attachments.id,
  fileName: attachments.fileName,
  fileSize: attachments.sizeBytes,
};

/* ---------- Requests inbox ---------- */

export function listInquiries(f: { type?: string; status?: string; q?: string }) {
  return safe(() => {
    const conds: (SQL | undefined)[] = [];
    if (f.type) conds.push(eq(inquiries.type, f.type as "candidate"));
    if (f.status) conds.push(eq(inquiries.status, f.status as "new"));
    else conds.push(sql`${inquiries.status} <> 'archived'`);
    if (f.q) {
      const like = `%${f.q}%`;
      conds.push(or(ilike(inquiries.fullName, like), ilike(inquiries.email, like), ilike(inquiries.phone, like), ilike(inquiries.companyName, like), ilike(inquiries.headline, like)));
    }
    return db
      .select({
        id: inquiries.id,
        type: inquiries.type,
        status: inquiries.status,
        fullName: inquiries.fullName,
        email: inquiries.email,
        phone: inquiries.phone,
        companyName: inquiries.companyName,
        headline: inquiries.headline,
        city: inquiries.city,
        roles: inquiries.roles,
        createdAt: inquiries.createdAt,
        jobTitle: jobs.title,
        ...fileMeta,
      })
      .from(inquiries)
      .leftJoin(jobs, eq(inquiries.jobId, jobs.id))
      .leftJoin(attachments, eq(inquiries.attachmentId, attachments.id))
      .where(and(...conds))
      .orderBy(desc(inquiries.createdAt))
      .limit(300);
  });
}

export function getInquiry(id: string) {
  return safe(async () => {
    const [row] = await db
      .select({
        inquiry: inquiries,
        jobTitle: jobs.title,
        jobSlug: jobs.slug,
        companyName: companies.name,
        ...fileMeta,
      })
      .from(inquiries)
      .leftJoin(jobs, eq(inquiries.jobId, jobs.id))
      .leftJoin(companies, eq(jobs.companyId, companies.id))
      .leftJoin(attachments, eq(inquiries.attachmentId, attachments.id))
      .where(eq(inquiries.id, id))
      .limit(1);
    return row ?? null;
  });
}

export function inquiryCounts() {
  return safe(async () => {
    const rows = await db
      .select({ type: inquiries.type, n: count() })
      .from(inquiries)
      .where(eq(inquiries.status, "new"))
      .groupBy(inquiries.type);
    const by = Object.fromEntries(rows.map((r) => [r.type, Number(r.n)])) as Record<string, number>;
    return { ...by, total: rows.reduce((a, r) => a + Number(r.n), 0) };
  });
}

/* ---------- Talent pool ---------- */

export function listCandidates(f: { q?: string; tag?: string; status?: string }) {
  return safe(() => {
    const conds: (SQL | undefined)[] = [];
    if (f.status) conds.push(eq(candidates.status, f.status as "active"));
    else conds.push(sql`${candidates.status} <> 'archived'`);
    if (f.q) {
      const like = `%${f.q}%`;
      conds.push(
        or(
          ilike(candidates.fullName, like),
          ilike(candidates.email, like),
          ilike(candidates.phone, like),
          ilike(candidates.headline, like),
          ilike(candidates.skills, like),
          ilike(candidates.tags, like),
          ilike(candidates.city, like),
        ),
      );
    }
    if (f.tag) conds.push(ilike(candidates.tags, `%${JSON.stringify(f.tag).slice(1, -1)}%`));
    return db
      .select({
        id: candidates.id,
        fullName: candidates.fullName,
        email: candidates.email,
        phone: candidates.phone,
        city: candidates.city,
        headline: candidates.headline,
        experienceYears: candidates.experienceYears,
        tags: candidates.tags,
        skills: candidates.skills,
        status: candidates.status,
        createdAt: candidates.createdAt,
        ...fileMeta,
      })
      .from(candidates)
      .leftJoin(attachments, eq(candidates.attachmentId, attachments.id))
      .where(and(...conds))
      .orderBy(desc(candidates.updatedAt))
      .limit(300);
  });
}

export function getCandidate(id: string) {
  return safe(async () => {
    const [row] = await db
      .select({ candidate: candidates, ...fileMeta })
      .from(candidates)
      .leftJoin(attachments, eq(candidates.attachmentId, attachments.id))
      .where(eq(candidates.id, id))
      .limit(1);
    if (!row) return null;
    const related = await db
      .select({ id: inquiries.id, type: inquiries.type, status: inquiries.status, createdAt: inquiries.createdAt, jobTitle: jobs.title })
      .from(inquiries)
      .leftJoin(jobs, eq(inquiries.jobId, jobs.id))
      .where(
        or(
          eq(inquiries.candidateId, id),
          row.candidate.email ? eq(inquiries.email, row.candidate.email) : undefined,
          row.candidate.phone ? eq(inquiries.phone, row.candidate.phone) : undefined,
        ),
      )
      .orderBy(desc(inquiries.createdAt))
      .limit(20);
    return { ...row, related };
  });
}

/** Every tag in use (candidates + jobs), most used first: powers suggestions and filter chips. */
export async function tagCloud(limit = 40) {
  try {
    const [c, j] = await Promise.all([
      db.select({ tags: candidates.tags }).from(candidates).where(sql`${candidates.tags} is not null`),
      db.select({ tags: jobs.tags }).from(jobs).where(and(sql`${jobs.tags} is not null`, isNull(jobs.deletedAt))),
    ]);
    const counts = new Map<string, number>();
    for (const r of [...c, ...j]) for (const t of parseSkills(r.tags)) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([t]) => t);
  } catch {
    return [];
  }
}

/* ---------- Companies & jobs for admin forms ---------- */

export function companyOptions() {
  return safe(() =>
    db
      .select({ id: companies.id, name: companies.name })
      .from(companies)
      .where(isNull(companies.deletedAt))
      .orderBy(companies.name),
  );
}

export function getCompanyById(id: string) {
  return safe(async () => {
    const [c] = await db.select().from(companies).where(and(eq(companies.id, id), isNull(companies.deletedAt))).limit(1);
    return c ?? null;
  });
}

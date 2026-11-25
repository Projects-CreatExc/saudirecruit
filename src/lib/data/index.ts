import { and, count, desc, eq, ilike, isNull, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { applications, companies, jobs, jobSeekerProfiles, users } from "@/lib/db/schema";

/**
 * Read helpers for server components. Each returns `{ data, error }` so pages can
 * render a proper error state instead of crashing when the database is unreachable.
 */
const DB_ERROR = "We couldn't reach the database. Please try again shortly." as const;
export type Result<T> = { data: T; error: null } | { data: null; error: typeof DB_ERROR };

async function safe<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return { data: await fn(), error: null };
  } catch (err) {
    console.error("[data]", err);
    return { data: null, error: DB_ERROR };
  }
}

const jobCardFields = {
  id: jobs.id,
  slug: jobs.slug,
  title: jobs.title,
  city: jobs.city,
  isRemote: jobs.isRemote,
  jobType: jobs.jobType,
  experienceLevel: jobs.experienceLevel,
  category: jobs.category,
  salaryMin: jobs.salaryMin,
  salaryMax: jobs.salaryMax,
  salaryCurrency: jobs.salaryCurrency,
  isSalaryHidden: jobs.isSalaryHidden,
  isFeatured: jobs.isFeatured,
  saudizationApplicable: jobs.saudizationApplicable,
  publishedAt: jobs.publishedAt,
  createdAt: jobs.createdAt,
  skills: jobs.skills,
  companyName: companies.name,
  companySlug: companies.slug,
  companyLogo: companies.logoUrl,
  companyVerified: companies.isVerified,
  companyIndustry: companies.industry,
  companyEmployees: companies.employeeCount,
};

export type JobCardData = {
  id: string;
  slug: string;
  title: string;
  city: string | null;
  isRemote: boolean;
  jobType: string;
  experienceLevel: string | null;
  category: string | null;
  salaryMin: string | null;
  salaryMax: string | null;
  salaryCurrency: string | null;
  isSalaryHidden: boolean;
  isFeatured: boolean;
  saudizationApplicable: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  skills: string | null;
  companyName: string;
  companySlug: string;
  companyLogo: string | null;
  companyVerified: boolean;
  companyIndustry: string | null;
  companyEmployees: number | null;
};

const liveJob = and(eq(jobs.status, "active"), isNull(jobs.deletedAt));

export type JobFilters = {
  q?: string;
  city?: string;
  type?: string;
  level?: string;
  category?: string;
  remote?: boolean;
  page?: number;
};

export const PAGE_SIZE = 20;

export function searchJobs(filters: JobFilters) {
  return safe(async () => {
    const conds: (SQL | undefined)[] = [liveJob, isNull(companies.deletedAt)];
    if (filters.q) {
      const like = `%${filters.q}%`;
      conds.push(or(ilike(jobs.title, like), ilike(companies.name, like), ilike(jobs.skills, like), ilike(jobs.category, like)));
    }
    if (filters.city) conds.push(ilike(jobs.city, `%${filters.city}%`));
    if (filters.type) conds.push(sql`${jobs.jobType} = ${filters.type}`);
    if (filters.level) conds.push(sql`${jobs.experienceLevel} = ${filters.level}`);
    if (filters.category) conds.push(eq(jobs.category, filters.category));
    if (filters.remote) conds.push(eq(jobs.isRemote, true));
    const where = and(...conds);
    const page = Math.max(1, filters.page ?? 1);

    const [rows, [{ total }]] = await Promise.all([
      db
        .select(jobCardFields)
        .from(jobs)
        .innerJoin(companies, eq(jobs.companyId, companies.id))
        .where(where)
        .orderBy(desc(jobs.isFeatured), desc(jobs.publishedAt), desc(jobs.createdAt))
        .limit(PAGE_SIZE)
        .offset((page - 1) * PAGE_SIZE),
      db.select({ total: count() }).from(jobs).innerJoin(companies, eq(jobs.companyId, companies.id)).where(where),
    ]);
    return { rows: rows as JobCardData[], total: Number(total), page };
  });
}

export function getLatestJobs(limit = 6) {
  return safe(async () => {
    const rows = await db
      .select(jobCardFields)
      .from(jobs)
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(and(liveJob, isNull(companies.deletedAt)))
      .orderBy(desc(jobs.isFeatured), desc(jobs.publishedAt), desc(jobs.createdAt))
      .limit(limit);
    return rows as JobCardData[];
  });
}

export function getPlatformStats() {
  return safe(async () => {
    const [[j], [c], [s]] = await Promise.all([
      db.select({ n: count() }).from(jobs).where(liveJob),
      db.select({ n: count() }).from(companies).where(isNull(companies.deletedAt)),
      db.select({ n: count() }).from(users).where(and(eq(users.role, "job_seeker"), isNull(users.deletedAt))),
    ]);
    return { jobs: Number(j.n), companies: Number(c.n), candidates: Number(s.n) };
  });
}

export function getJobBySlug(slug: string) {
  return safe(async () => {
    const [row] = await db
      .select({
        job: jobs,
        company: {
          id: companies.id,
          name: companies.name,
          slug: companies.slug,
          logoUrl: companies.logoUrl,
          description: companies.description,
          industry: companies.industry,
          city: companies.city,
          employeeCount: companies.employeeCount,
          foundedYear: companies.foundedYear,
          website: companies.website,
          isVerified: companies.isVerified,
          ownerId: companies.ownerId,
        },
      })
      .from(jobs)
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(and(eq(jobs.slug, slug), isNull(jobs.deletedAt)))
      .limit(1);
    return row ?? null;
  });
}

export function getUserApplicationForJob(userId: string, jobId: string) {
  return safe(async () => {
    const [row] = await db
      .select({ id: applications.id, status: applications.status, createdAt: applications.createdAt })
      .from(applications)
      .where(and(eq(applications.jobId, jobId), eq(applications.applicantId, userId)))
      .limit(1);
    return row ?? null;
  });
}

export function listCompanies(q?: string, industry?: string) {
  return safe(async () => {
    const conds: (SQL | undefined)[] = [isNull(companies.deletedAt)];
    if (q) conds.push(or(ilike(companies.name, `%${q}%`), ilike(companies.description, `%${q}%`)));
    if (industry) conds.push(eq(companies.industry, industry));
    return db
      .select({
        id: companies.id,
        name: companies.name,
        slug: companies.slug,
        logoUrl: companies.logoUrl,
        description: companies.description,
        industry: companies.industry,
        city: companies.city,
        employeeCount: companies.employeeCount,
        isVerified: companies.isVerified,
        openJobs: sql<number>`(select count(*) from ${jobs} where ${jobs.companyId} = ${companies.id} and ${jobs.status} = 'active' and ${jobs.deletedAt} is null)`.mapWith(Number),
      })
      .from(companies)
      .where(and(...conds))
      .orderBy(desc(companies.isVerified), desc(companies.createdAt))
      .limit(60);
  });
}

export function getCompanyBySlug(slug: string) {
  return safe(async () => {
    const [company] = await db
      .select()
      .from(companies)
      .where(and(eq(companies.slug, slug), isNull(companies.deletedAt)))
      .limit(1);
    if (!company) return null;
    const openJobs = await db
      .select(jobCardFields)
      .from(jobs)
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(and(eq(jobs.companyId, company.id), liveJob))
      .orderBy(desc(jobs.publishedAt));
    return { company, openJobs: openJobs as JobCardData[] };
  });
}

/* ---------- Signed-in views ---------- */

export function getAccount(userId: string) {
  return safe(async () => {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        role: users.role,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user) return null;
    const [profile] = await db.select().from(jobSeekerProfiles).where(eq(jobSeekerProfiles.userId, userId)).limit(1);
    return { user, profile: profile ?? null };
  });
}

export function getOwnedCompany(userId: string) {
  return safe(async () => {
    const [company] = await db
      .select()
      .from(companies)
      .where(and(eq(companies.ownerId, userId), isNull(companies.deletedAt)))
      .limit(1);
    return company ?? null;
  });
}

export function getSeekerApplications(userId: string) {
  return safe(() =>
    db
      .select({
        id: applications.id,
        status: applications.status,
        createdAt: applications.createdAt,
        updatedAt: applications.updatedAt,
        jobTitle: jobs.title,
        jobSlug: jobs.slug,
        jobCity: jobs.city,
        isRemote: jobs.isRemote,
        companyName: companies.name,
        companyLogo: companies.logoUrl,
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(and(eq(applications.applicantId, userId), isNull(applications.deletedAt)))
      .orderBy(desc(applications.createdAt)),
  );
}

export function getEmployerJobs(companyId: string) {
  return safe(() =>
    db
      .select({
        id: jobs.id,
        slug: jobs.slug,
        title: jobs.title,
        status: jobs.status,
        city: jobs.city,
        isRemote: jobs.isRemote,
        jobType: jobs.jobType,
        applicationCount: jobs.applicationCount,
        viewCount: jobs.viewCount,
        publishedAt: jobs.publishedAt,
        createdAt: jobs.createdAt,
      })
      .from(jobs)
      .where(and(eq(jobs.companyId, companyId), isNull(jobs.deletedAt)))
      .orderBy(desc(jobs.createdAt)),
  );
}

export function getEmployerApplicants(companyId: string) {
  return safe(() =>
    db
      .select({
        id: applications.id,
        status: applications.status,
        createdAt: applications.createdAt,
        coverLetter: applications.coverLetter,
        jobTitle: jobs.title,
        jobSlug: jobs.slug,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        headline: jobSeekerProfiles.headline,
        city: jobSeekerProfiles.currentCity,
      })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(users, eq(applications.applicantId, users.id))
      .leftJoin(jobSeekerProfiles, eq(jobSeekerProfiles.userId, users.id))
      .where(and(eq(jobs.companyId, companyId), isNull(applications.deletedAt)))
      .orderBy(desc(applications.createdAt)),
  );
}

export function getAdminOverview() {
  return safe(async () => {
    const [roleCounts, jobCounts, recentJobs, recentUsers] = await Promise.all([
      db.select({ role: users.role, n: count() }).from(users).where(isNull(users.deletedAt)).groupBy(users.role),
      db.select({ status: jobs.status, n: count() }).from(jobs).where(isNull(jobs.deletedAt)).groupBy(jobs.status),
      db
        .select({
          id: jobs.id,
          slug: jobs.slug,
          title: jobs.title,
          status: jobs.status,
          createdAt: jobs.createdAt,
          applicationCount: jobs.applicationCount,
          companyName: companies.name,
        })
        .from(jobs)
        .innerJoin(companies, eq(jobs.companyId, companies.id))
        .where(isNull(jobs.deletedAt))
        .orderBy(desc(jobs.createdAt))
        .limit(15),
      db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          role: users.role,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(isNull(users.deletedAt))
        .orderBy(desc(users.createdAt))
        .limit(10),
    ]);
    const [[apps]] = await Promise.all([db.select({ n: count() }).from(applications)]);
    return {
      roleCounts: Object.fromEntries(roleCounts.map((r) => [r.role, Number(r.n)])) as Record<string, number>,
      jobCounts: Object.fromEntries(jobCounts.map((r) => [r.status, Number(r.n)])) as Record<string, number>,
      applications: Number(apps.n),
      recentJobs,
      recentUsers,
    };
  });
}

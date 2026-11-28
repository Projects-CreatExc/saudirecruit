import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { after } from "next/server";
import { eq, sql } from "drizzle-orm";
import { ArrowLeft, BadgeCheck, Building2, Globe, ShieldCheck, Users } from "lucide-react";
import { ApplyForm } from "@/components/jobs/apply-form";
import { JobMeta } from "@/components/jobs/job-card";
import { LinkButton } from "@/components/ui/button";
import { Alert } from "@/components/ui/field";
import { Avatar, Badge, Card, Container } from "@/components/ui/misc";
import { getSessionUser } from "@/lib/auth/session";
import { APPLICATION_STATUSES, EXPERIENCE_LEVELS, VISA_STATUSES, isSeekerRole, labelFor, parseSkills } from "@/lib/constants";
import { getAccount, getJobBySlug, getResumeMeta, getUserApplicationForJob } from "@/lib/data";
import { db } from "@/lib/db";
import { jobs } from "@/lib/db/schema";
import { timeAgo } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const res = await getJobBySlug(slug);
  const row = res.data;
  if (!row) return { title: "Job not found" };
  return {
    title: `${row.job.title} at ${row.company.name}`,
    description: row.job.description.slice(0, 160),
  };
}

function Section({ title, body }: { title: string; body?: string | null }) {
  if (!body) return null;
  return (
    <section className="border-t border-line pt-8">
      <h2 className="text-lg font-semibold tracking-[-0.015em]">{title}</h2>
      <div className="mt-3 text-[15px] leading-[1.75] whitespace-pre-line text-body">{body}</div>
    </section>
  );
}

export default async function JobPage({ params }: Props) {
  const { slug } = await params;
  const [res, user] = await Promise.all([getJobBySlug(slug), getSessionUser()]);

  if (res.error) {
    return (
      <Container className="py-16">
        <Alert>{res.error}</Alert>
      </Container>
    );
  }
  if (!res.data) notFound();
  const { job, company } = res.data;
  const isOwner = user?.id === company.ownerId;
  if (job.status !== "active" && !isOwner) notFound();

  const existing = user && isSeekerRole(user.role) ? (await getUserApplicationForJob(user.id, job.id)).data : null;
  const cv =
    user && isSeekerRole(user.role) && !existing ? await getResumeMeta((await getAccount(user.id)).data?.profile?.resumeUrl) : null;
  const skills = parseSkills(job.skills);
  const visa = job.visaRequirement && job.visaRequirement !== "not_specified" ? labelFor(VISA_STATUSES, job.visaRequirement) : null;

  if (!isOwner) {
    after(async () => {
      try {
        await db.update(jobs).set({ viewCount: sql`${jobs.viewCount} + 1` }).where(eq(jobs.id, job.id));
      } catch {
        /* best effort */
      }
    });
  }

  const statusMeta = existing ? APPLICATION_STATUSES.find((s) => s.value === existing.status) : null;

  return (
    <Container className="py-8 sm:py-12">
      <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4 rtl:rotate-180" /> All jobs
      </Link>

      {job.status !== "active" && (
        <div className="mt-6">
          <Alert tone="info">This listing is not public. Its status is &ldquo;{job.status.replace("_", " ")}&rdquo;, so only you can see it.</Alert>
        </div>
      )}

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-14">
        <article>
          <div className="flex items-center gap-3">
            <Avatar name={company.name} src={company.logoUrl} size={48} square />
            <div>
              <Link href={`/companies/${company.slug}`} className="inline-flex items-center gap-1.5 font-semibold hover:underline">
                {company.name}
                {company.isVerified && <BadgeCheck className="size-4 text-brand" aria-label="Verified company" />}
              </Link>
              <p className="text-sm text-muted">{company.industry ?? "Hiring in Saudi Arabia"}</p>
            </div>
          </div>

          <h1 className="display-lg mt-6">{job.title}</h1>
          <div className="mt-4">
            <JobMeta job={job} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {job.experienceLevel && <Badge>{labelFor(EXPERIENCE_LEVELS, job.experienceLevel)}</Badge>}
            {job.category && <Badge>{job.category}</Badge>}
            {job.saudizationApplicable && <Badge tone="brand">Saudization role</Badge>}
            {visa && <Badge tone="info">Requires: {visa}</Badge>}
            <Badge tone="neutral">Posted {timeAgo(new Date(job.publishedAt ?? job.createdAt)).replace("Just now", "just now")}</Badge>
          </div>

          <div className="mt-10 space-y-8">
            <Section title="About the role" body={job.description} />
            <Section title="Requirements" body={job.requirements} />
            <Section title="Benefits" body={job.benefits} />
            {skills.length > 0 && (
              <section className="border-t border-line pt-8">
                <h2 className="text-lg font-semibold tracking-[-0.015em]">Skills</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <li key={s} className="rounded-lg border border-line px-3 py-1 text-sm text-ink-soft">
                      {s}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card id="apply" className="scroll-mt-24 p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-base font-semibold">Interested in this role?</h2>
            <div className="mt-4">
              {isOwner ? (
                <div className="space-y-3">
                  <p className="text-sm text-body">You posted this role. {job.applicationCount} applications so far.</p>
                  <LinkButton href="/dashboard/applicants" variant="dark" className="w-full">
                    Review applicants
                  </LinkButton>
                </div>
              ) : !user ? (
                <div className="space-y-3">
                  <LinkButton href={`/login?callbackUrl=${encodeURIComponent(`/jobs/${job.slug}`)}`} size="lg" className="w-full">
                    Log in to apply
                  </LinkButton>
                  <LinkButton href="/register" variant="outline" size="lg" className="w-full">
                    Create a free profile
                  </LinkButton>
                </div>
              ) : !isSeekerRole(user.role) ? (
                <p className="text-sm text-body">Applications are available to job seeker accounts only.</p>
              ) : existing && statusMeta ? (
                <div className="space-y-3">
                  <div className="rounded-xl bg-brand-soft p-4 text-sm text-brand-ink" role="status">
                    <p className="font-semibold">You applied {timeAgo(new Date(existing.createdAt)).toLowerCase()}.</p>
                    <p className="mt-0.5">The hiring team will update your status as they review.</p>
                  </div>
                  <p className="flex items-center justify-between gap-2 text-sm">
                    Application status <Badge tone={statusMeta.tone}>{statusMeta.label}</Badge>
                  </p>
                  <LinkButton href="/applications" variant="outline" className="w-full">
                    Track your applications
                  </LinkButton>
                </div>
              ) : (
                <ApplyForm jobId={job.id} slug={job.slug} cvName={cv?.fileName} />
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-semibold">About {company.name}</h2>
            {company.description && <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-body">{company.description}</p>}
            <ul className="mt-4 space-y-2 text-sm text-body">
              {company.city && (
                <li className="flex items-center gap-2">
                  <Building2 className="size-4 text-subtle" /> {company.city}
                </li>
              )}
              {company.employeeCount && (
                <li className="flex items-center gap-2">
                  <Users className="size-4 text-subtle" /> {company.employeeCount.toLocaleString()} employees
                </li>
              )}
              {company.website && (
                <li className="flex items-center gap-2">
                  <Globe className="size-4 text-subtle" />
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="truncate hover:text-ink hover:underline">
                    {company.website.replace(/^https?:\/\//, "")}
                  </a>
                </li>
              )}
              {company.isVerified && (
                <li className="flex items-center gap-2 text-brand-ink">
                  <ShieldCheck className="size-4 text-brand" /> Verified employer
                </li>
              )}
            </ul>
            <LinkButton href={`/companies/${company.slug}`} variant="outline" size="sm" className="mt-5 w-full">
              View company
            </LinkButton>
          </Card>
        </aside>
      </div>
      {!isOwner && !existing && (!user || isSeekerRole(user.role)) && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 px-5 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
          <a href="#apply" className="flex h-12 items-center justify-center rounded-full bg-brand font-semibold text-white">
            {user ? "Apply now" : "Log in to apply"}
          </a>
        </div>
      )}
    </Container>
  );
}

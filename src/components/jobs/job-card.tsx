import Link from "next/link";
import { BadgeCheck, Banknote, Clock, MapPin } from "lucide-react";
import { EXPERIENCE_LEVELS, JOB_TYPES, labelFor, parseSkills } from "@/lib/constants";
import type { JobCardData } from "@/lib/data";
import { formatSalary, timeAgo } from "@/lib/utils";
import { buttonStyles } from "@/components/ui/button";
import { Avatar, Badge } from "@/components/ui/misc";

export function JobMeta({ job }: { job: Pick<JobCardData, "city" | "isRemote" | "jobType" | "salaryMin" | "salaryMax" | "salaryCurrency" | "isSalaryHidden"> }) {
  const location = [job.city, job.isRemote ? "Remote" : null].filter(Boolean).join(" · ") || "Saudi Arabia";
  const salary = !job.isSalaryHidden && (job.salaryMin || job.salaryMax)
    ? formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency ?? "SAR")
    : null;
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-body">
      <li className="inline-flex items-center gap-1.5">
        <MapPin className="size-3.5 text-subtle" aria-hidden /> {location}
      </li>
      <li className="inline-flex items-center gap-1.5">
        <Clock className="size-3.5 text-subtle" aria-hidden /> {labelFor(JOB_TYPES, job.jobType)}
      </li>
      {salary && (
        <li className="inline-flex items-center gap-1.5">
          <Banknote className="size-3.5 text-subtle" aria-hidden /> {salary} / month
        </li>
      )}
    </ul>
  );
}

/** Wellfound-style listing row: company context first, then the role. */
export function JobCard({ job, showCompany = true }: { job: JobCardData; showCompany?: boolean }) {
  const tags = parseSkills(job.tags);
  const skills = [...tags.map((t) => `#${t}`), ...parseSkills(job.skills)].slice(0, 5);
  const posted = job.publishedAt ?? job.createdAt;
  return (
    <article className="group relative rounded-[var(--radius-card)] border border-line bg-white p-5 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[var(--shadow-card)] sm:p-6">
      {showCompany && (
        <div className="mb-4 flex items-center gap-3">
          <Avatar name={job.companyName} src={job.companyLogo} size={40} square />
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate text-[15px] font-semibold">
              <Link href={`/companies/${job.companySlug}`} className="relative z-10 hover:underline">
                {job.companyName}
              </Link>
              {job.companyVerified && <BadgeCheck className="size-4 shrink-0 text-brand" aria-label="Verified company" />}
            </p>
            <p className="truncate text-sm text-muted">
              {[job.companyIndustry, job.companyEmployees ? `${job.companyEmployees.toLocaleString()} employees` : null]
                .filter(Boolean)
                .join(" · ") || "Hiring in Saudi Arabia"}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {job.isFeatured && <Badge tone="gold">Featured</Badge>}
            {job.saudizationApplicable && <Badge tone="brand">Saudization</Badge>}
            {job.experienceLevel && <Badge>{labelFor(EXPERIENCE_LEVELS, job.experienceLevel)}</Badge>}
          </div>
          <h3 className="text-lg font-semibold tracking-[-0.015em]">
            <Link href={`/jobs/${job.slug}`} className="after:absolute after:inset-0 after:rounded-[var(--radius-card)]">
              {job.title}
            </Link>
          </h3>
          <div className="mt-2">
            <JobMeta job={job} />
          </div>
          {skills.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <li key={s} className="rounded-md border border-line px-2 py-0.5 text-xs text-ink-soft">
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
          <span className="text-xs text-subtle">{timeAgo(new Date(posted))}</span>
          <span className={buttonStyles({ variant: "outline", size: "sm", className: "transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-white" })} aria-hidden>
            View role
          </span>
        </div>
      </div>
    </article>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, FileText, Plus } from "lucide-react";
import { ApplicationStatusBadge, JobStatusBadge } from "@/components/app/status";
import { JobCard } from "@/components/jobs/job-card";
import { Button, LinkButton } from "@/components/ui/button";
import { Alert } from "@/components/ui/field";
import { Avatar, Card, EmptyState, PageHeader, Stat } from "@/components/ui/misc";
import { setJobStatusAction } from "@/lib/actions/recruiting";
import { requireUser } from "@/lib/auth/session";
import { ROLE_LABELS, isAdminRole, isEmployerRole } from "@/lib/constants";
import {
  getAccount,
  getAdminOverview,
  getEmployerApplicants,
  getEmployerJobs,
  getLatestJobs,
  getOwnedCompany,
  getSeekerApplications,
} from "@/lib/data";
import { timeAgo } from "@/lib/utils";
import type { UserRole } from "@/types";

export const metadata: Metadata = { title: "Dashboard" };

function firstName(name?: string | null) {
  return name?.split(" ")[0] ?? "there";
}

function SectionTitle({ title, href, cta }: { title: string; href?: string; cta?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-base font-semibold">{title}</h2>
      {href && (
        <Link href={href} className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
          {cta ?? "View all"} <ArrowRight className="size-3.5 rtl:rotate-180" />
        </Link>
      )}
    </div>
  );
}

/* ---------------- Job seeker ---------------- */
async function SeekerDashboard({ userId, name }: { userId: string; name: string }) {
  const [appsRes, accRes, jobsRes] = await Promise.all([getSeekerApplications(userId), getAccount(userId), getLatestJobs(3)]);
  if (appsRes.error) return <Alert>{appsRes.error}</Alert>;
  const apps = appsRes.data;
  const active = apps.filter((a) => !["rejected", "withdrawn", "hired"].includes(a.status)).length;
  const interviews = apps.filter((a) => a.status === "interview" || a.status === "offer").length;

  const p = accRes.data?.profile;
  const checks = [
    { done: !!p?.resumeUrl, label: "Upload your CV" },
    { done: !!p?.headline, label: "Add a headline" },
    { done: !!p?.summary, label: "Write a short summary" },
    { done: !!p?.skills, label: "List your skills" },
    { done: !!p?.currentCity, label: "Add your city" },
    { done: !!p?.experienceLevel, label: "Set your experience level" },
  ];
  const pct = Math.round((checks.filter((c) => c.done).length / checks.length) * 100);

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName(name)}`}
        description="Here's where your search stands today."
        actions={<LinkButton href="/jobs" variant="dark">Find jobs</LinkButton>}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Applications" value={apps.length} />
        <Stat label="In progress" value={active} />
        <Stat label="Interviews and offers" value={interviews} />
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-[1fr_320px]">
        <section>
          <SectionTitle title="Recent applications" href="/applications" />
          {apps.length === 0 ? (
            <EmptyState
              icon={<FileText className="size-5" />}
              title="No applications yet"
              description="When you apply to a role it will appear here with its live status."
              action={<LinkButton href="/jobs">Browse open roles</LinkButton>}
            />
          ) : (
            <Card className="divide-y divide-line">
              {apps.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center gap-4 p-4">
                  <Avatar name={a.companyName} src={a.companyLogo} size={40} square />
                  <div className="min-w-0 flex-1">
                    <Link href={`/jobs/${a.jobSlug}`} className="block truncate font-medium hover:underline">
                      {a.jobTitle}
                    </Link>
                    <p className="truncate text-sm text-muted">
                      {a.companyName} · Applied {timeAgo(new Date(a.createdAt))}
                    </p>
                  </div>
                  <ApplicationStatusBadge status={a.status} />
                </div>
              ))}
            </Card>
          )}
        </section>

        <aside>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Profile strength</h2>
              <span className="text-sm font-medium">{pct}%</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${pct}%` }} />
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {checks.map((c) => (
                <li key={c.label} className={c.done ? "text-muted line-through" : "text-ink-soft"}>
                  {c.label}
                </li>
              ))}
            </ul>
            {pct < 100 && (
              <LinkButton href="/settings" variant="outline" size="sm" className="mt-5 w-full">
                Complete profile
              </LinkButton>
            )}
          </Card>
        </aside>
      </div>

      {jobsRes.data && jobsRes.data.length > 0 && (
        <section className="mt-10">
          <SectionTitle title="New on SaudiRecruit" href="/jobs" cta="Browse all" />
          <div className="grid gap-3">
            {jobsRes.data.map((j) => (
              <JobCard key={j.id} job={j} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

/* ---------------- Employer ---------------- */
async function EmployerDashboard({ userId, name }: { userId: string; name: string }) {
  const companyRes = await getOwnedCompany(userId);
  if (companyRes.error) return <Alert>{companyRes.error}</Alert>;
  const company = companyRes.data;

  if (!company) {
    return (
      <>
        <PageHeader title={`Welcome, ${firstName(name)}`} description="Let's get your company ready to hire." />
        <EmptyState
          icon={<Building2 className="size-5" />}
          title="Create your company profile"
          description="Candidates see this on every role you post. Add your name, industry, city and a short description to get started."
          action={<LinkButton href="/dashboard/company">Set up company profile</LinkButton>}
        />
      </>
    );
  }

  const [jobsRes, appsRes] = await Promise.all([getEmployerJobs(company.id), getEmployerApplicants(company.id)]);
  const jobs = jobsRes.data ?? [];
  const apps = appsRes.data ?? [];
  const newApps = apps.filter((a) => a.status === "applied").length;

  return (
    <>
      <PageHeader
        title={company.name}
        description={`Welcome back, ${firstName(name)}. Here's your hiring at a glance.`}
        actions={
          <LinkButton href="/dashboard/jobs/new" variant="dark">
            <Plus className="size-4" /> Post a job
          </LinkButton>
        }
      />
      {(jobsRes.error || appsRes.error) && (
        <div className="mb-6">
          <Alert>{jobsRes.error ?? appsRes.error}</Alert>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Active jobs" value={jobs.filter((j) => j.status === "active").length} hint={`${jobs.length} total`} />
        <Stat label="Applicants" value={apps.length} />
        <Stat label="Waiting for review" value={newApps} />
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-2">
        <section>
          <SectionTitle title="Latest applicants" href="/dashboard/applicants" />
          {apps.length === 0 ? (
            <EmptyState title="No applicants yet" description="Applicants for your roles will appear here." />
          ) : (
            <Card className="divide-y divide-line">
              {apps.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-4">
                  <Avatar name={`${a.firstName} ${a.lastName}`} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {a.firstName} {a.lastName}
                    </p>
                    <p className="truncate text-sm text-muted">{a.jobTitle}</p>
                  </div>
                  <ApplicationStatusBadge status={a.status} />
                </div>
              ))}
            </Card>
          )}
        </section>
        <section>
          <SectionTitle title="Your jobs" href="/dashboard/jobs" />
          {jobs.length === 0 ? (
            <EmptyState
              title="No jobs posted"
              description="Post your first role to start receiving applications."
              action={<LinkButton href="/dashboard/jobs/new">Post a job</LinkButton>}
            />
          ) : (
            <Card className="divide-y divide-line">
              {jobs.slice(0, 5).map((j) => (
                <div key={j.id} className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <Link href={`/jobs/${j.slug}`} className="block truncate font-medium hover:underline">
                      {j.title}
                    </Link>
                    <p className="text-sm text-muted">
                      {j.applicationCount} applicants · {j.viewCount} views
                    </p>
                  </div>
                  <JobStatusBadge status={j.status} />
                </div>
              ))}
            </Card>
          )}
        </section>
      </div>
    </>
  );
}

/* ---------------- Admin ---------------- */
async function AdminDashboard({ role }: { role: UserRole }) {
  const res = await getAdminOverview();
  if (res.error) return <Alert>{res.error}</Alert>;
  const d = res.data;
  const sum = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0);

  return (
    <>
      <PageHeader title="Platform overview" description={`Signed in as ${ROLE_LABELS[role]}.`} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Users" value={sum(d.roleCounts)} hint={`${d.roleCounts.job_seeker ?? 0} candidates · ${d.roleCounts.employer ?? 0} employers`} />
        <Stat label="Active jobs" value={d.jobCounts.active ?? 0} hint={`${sum(d.jobCounts)} total`} />
        <Stat label="Suspended jobs" value={d.jobCounts.suspended ?? 0} />
        <Stat label="Applications" value={d.applications} />
      </div>

      <section className="mt-10">
        <SectionTitle title="Recent job posts" href="/dashboard/admin/jobs" />
        {d.recentJobs.length === 0 ? (
          <EmptyState title="No jobs posted yet" />
        ) : (
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-line text-start text-xs text-muted">
                  <th className="px-4 py-3 text-start font-medium">Role</th>
                  <th className="px-4 py-3 text-start font-medium">Company</th>
                  <th className="px-4 py-3 text-start font-medium">Status</th>
                  <th className="px-4 py-3 text-start font-medium">Posted</th>
                  <th className="px-4 py-3 text-end font-medium">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {d.recentJobs.map((j) => (
                  <tr key={j.id} className="hover:bg-surface">
                    <td className="px-4 py-3 font-medium">
                      <Link href={`/jobs/${j.slug}`} className="hover:underline">
                        {j.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-body">{j.companyName}</td>
                    <td className="px-4 py-3">
                      <JobStatusBadge status={j.status} />
                    </td>
                    <td className="px-4 py-3 text-muted">{timeAgo(new Date(j.createdAt))}</td>
                    <td className="px-4 py-3 text-end">
                      <form action={setJobStatusAction}>
                        <input type="hidden" name="jobId" value={j.id} />
                        {j.status === "suspended" ? (
                          <Button type="submit" name="status" value="active" variant="outline" size="sm">
                            Reinstate
                          </Button>
                        ) : (
                          <Button type="submit" name="status" value="suspended" variant="danger" size="sm">
                            Suspend
                          </Button>
                        )}
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </section>

      <section className="mt-10">
        <SectionTitle title="Newest users" href="/dashboard/admin/users" />
        <Card className="divide-y divide-line">
          {d.recentUsers.map((u) => (
            <div key={u.id} className="flex items-center gap-3 p-4">
              <Avatar name={`${u.firstName} ${u.lastName}`} size={36} />
              <div className="min-w-0 flex-1">
                <Link href={`/dashboard/admin/users/${u.id}`} className="block truncate font-medium hover:underline">
                  {u.firstName} {u.lastName}
                </Link>
                <p className="truncate text-sm text-muted">{u.email}</p>
              </div>
              <span className="hidden text-sm text-muted sm:block">{ROLE_LABELS[u.role]}</span>
              <span className="text-xs text-subtle">{timeAgo(new Date(u.createdAt))}</span>
            </div>
          ))}
        </Card>
      </section>
    </>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();
  if (isAdminRole(user.role)) return <AdminDashboard role={user.role} />;
  if (isEmployerRole(user.role)) return <EmployerDashboard userId={user.id} name={user.name} />;
  return <SeekerDashboard userId={user.id} name={user.name} />;
}

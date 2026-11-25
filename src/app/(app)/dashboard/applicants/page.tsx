import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { ApplicationStatusBadge } from "@/components/app/status";
import { StatusSelect } from "@/components/app/status-select";
import { LinkButton } from "@/components/ui/button";
import { Alert } from "@/components/ui/field";
import { Avatar, Card, EmptyState, PageHeader } from "@/components/ui/misc";
import { setApplicationStatusAction } from "@/lib/actions/recruiting";
import { requireUser } from "@/lib/auth/session";
import { APPLICATION_STATUSES, isEmployerRole } from "@/lib/constants";
import { getEmployerApplicants, getOwnedCompany } from "@/lib/data";
import { cn, timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Applicants" };

const PIPELINE = APPLICATION_STATUSES.filter((s) => s.value !== "withdrawn");

type SP = Record<string, string | string[] | undefined>;

export default async function ApplicantsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const user = await requireUser("/dashboard/applicants");
  if (!isEmployerRole(user.role)) redirect("/dashboard");
  const companyRes = await getOwnedCompany(user.id);
  if (companyRes.error) return <Alert>{companyRes.error}</Alert>;
  if (!companyRes.data) redirect("/dashboard/company");

  const sp = await searchParams;
  const filter = typeof sp.status === "string" ? sp.status : "all";
  const res = await getEmployerApplicants(companyRes.data.id);
  const all = res.data ?? [];
  const list = filter === "all" ? all : all.filter((a) => a.status === filter);
  const counts = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s.value, all.filter((a) => a.status === s.value).length]));

  const tabs = [{ value: "all", label: "All", n: all.length }, ...APPLICATION_STATUSES.map((s) => ({ value: s.value, label: s.label, n: counts[s.value] }))];

  return (
    <>
      <PageHeader title="Applicants" description="Review candidates and move them through your pipeline." />

      <nav aria-label="Filter by status" className="-mx-5 mb-6 flex gap-1.5 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0">
        {tabs.map((t) => (
          <Link
            key={t.value}
            href={t.value === "all" ? "/dashboard/applicants" : `/dashboard/applicants?status=${t.value}`}
            aria-current={filter === t.value ? "page" : undefined}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              filter === t.value ? "border-ink bg-ink text-white" : "border-line text-ink-soft hover:border-ink",
            )}
          >
            {t.label}
            <span className={filter === t.value ? "text-white/60" : "text-subtle"}>{t.n}</span>
          </Link>
        ))}
      </nav>

      {res.error ? (
        <Alert>{res.error}</Alert>
      ) : list.length === 0 ? (
        <EmptyState
          icon={<Users className="size-5" />}
          title={all.length === 0 ? "No applicants yet" : "No applicants with this status"}
          description={all.length === 0 ? "Share your open roles to start receiving applications." : undefined}
          action={all.length === 0 ? <LinkButton href="/dashboard/jobs">Manage jobs</LinkButton> : undefined}
        />
      ) : (
        <Card className="divide-y divide-line">
          {list.map((a) => (
            <div key={a.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
              <Avatar name={`${a.firstName} ${a.lastName}`} size={44} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {a.firstName} {a.lastName}
                </p>
                <p className="text-sm text-body">{[a.headline, a.city].filter(Boolean).join(" · ") || "No headline yet"}</p>
                <p className="mt-1 text-sm text-muted">
                  Applied for{" "}
                  <Link href={`/jobs/${a.jobSlug}`} className="text-ink hover:underline">
                    {a.jobTitle}
                  </Link>{" "}
                  · {timeAgo(new Date(a.createdAt))} ·{" "}
                  <a href={`mailto:${a.email}`} className="text-ink hover:underline">
                    {a.email}
                  </a>
                </p>
                {a.coverLetter && (
                  <details className="mt-3 text-sm">
                    <summary className="cursor-pointer font-medium text-ink-soft hover:text-ink">Read note</summary>
                    <p className="mt-2 rounded-xl bg-surface p-4 leading-relaxed whitespace-pre-line text-body">{a.coverLetter}</p>
                  </details>
                )}
              </div>
              <div className="shrink-0">
                {a.status === "withdrawn" ? (
                  <ApplicationStatusBadge status={a.status} />
                ) : (
                  <StatusSelect
                    action={setApplicationStatusAction}
                    idName="applicationId"
                    id={a.id}
                    value={a.status}
                    options={PIPELINE}
                    label={`Status for ${a.firstName} ${a.lastName}`}
                  />
                )}
              </div>
            </div>
          ))}
        </Card>
      )}
    </>
  );
}

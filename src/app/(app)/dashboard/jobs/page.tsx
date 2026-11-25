import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Briefcase, Plus } from "lucide-react";
import { JobStatusBadge } from "@/components/app/status";
import { StatusSelect } from "@/components/app/status-select";
import { LinkButton } from "@/components/ui/button";
import { Alert } from "@/components/ui/field";
import { Card, EmptyState, PageHeader } from "@/components/ui/misc";
import { setJobStatusAction } from "@/lib/actions/recruiting";
import { requireUser } from "@/lib/auth/session";
import { JOB_TYPES, isEmployerRole, labelFor } from "@/lib/constants";
import { getEmployerJobs, getOwnedCompany } from "@/lib/data";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Your jobs" };

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "filled", label: "Filled" },
  { value: "closed", label: "Closed" },
];

export default async function EmployerJobsPage() {
  const user = await requireUser("/dashboard/jobs");
  if (!isEmployerRole(user.role)) redirect("/dashboard");
  const companyRes = await getOwnedCompany(user.id);
  if (companyRes.error) return <Alert>{companyRes.error}</Alert>;
  if (!companyRes.data) redirect("/dashboard/company");
  const res = await getEmployerJobs(companyRes.data.id);

  return (
    <>
      <PageHeader
        title="Jobs"
        description="Manage every role your company has posted."
        actions={
          <LinkButton href="/dashboard/jobs/new" variant="dark">
            <Plus className="size-4" /> Post a job
          </LinkButton>
        }
      />
      {res.error ? (
        <Alert>{res.error}</Alert>
      ) : res.data.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="size-5" />}
          title="No jobs yet"
          description="Post your first role. It takes about five minutes."
          action={<LinkButton href="/dashboard/jobs/new">Post a job</LinkButton>}
        />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-muted">
                <th className="px-5 py-3 text-start font-medium">Role</th>
                <th className="px-5 py-3 text-start font-medium">Applicants</th>
                <th className="px-5 py-3 text-start font-medium">Views</th>
                <th className="px-5 py-3 text-start font-medium">Created</th>
                <th className="px-5 py-3 text-end font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {res.data.map((j) => (
                <tr key={j.id} className="hover:bg-surface">
                  <td className="px-5 py-4">
                    <Link href={`/jobs/${j.slug}`} className="font-medium hover:underline">
                      {j.title}
                    </Link>
                    <p className="text-muted">
                      {[j.city, j.isRemote ? "Remote" : null, labelFor(JOB_TYPES, j.jobType)].filter(Boolean).join(" · ")}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <Link href="/dashboard/applicants" className="hover:underline">
                      {j.applicationCount}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-body">{j.viewCount}</td>
                  <td className="px-5 py-4 text-muted">{timeAgo(new Date(j.createdAt))}</td>
                  <td className="px-5 py-4 text-end">
                    {j.status === "suspended" || j.status === "under_review" || j.status === "expired" ? (
                      <JobStatusBadge status={j.status} />
                    ) : (
                      <StatusSelect action={setJobStatusAction} idName="jobId" id={j.id} value={j.status} options={STATUS_OPTIONS} label={`Status for ${j.title}`} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}

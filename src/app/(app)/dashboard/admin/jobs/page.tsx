import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase } from "lucide-react";
import { AdminSearch, FilterTabs, Td, Th } from "@/components/app/admin-ui";
import { JobStatusBadge } from "@/components/app/status";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/field";
import { Card, EmptyState, PageHeader } from "@/components/ui/misc";
import { setJobStatusAction } from "@/lib/actions/recruiting";
import { requireAdmin } from "@/lib/auth/session";
import { adminListJobs } from "@/lib/data";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Jobs · Admin" };

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

export default async function AdminJobsPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireAdmin("/dashboard/admin/jobs");
  const sp = await searchParams;
  const q = one(sp.q);
  const status = one(sp.status);
  const res = await adminListJobs(q, status);

  return (
    <>
      <PageHeader title="Jobs" description="Every listing on the platform. Suspend anything that breaks the posting rules." />
      <AdminSearch action="/dashboard/admin/jobs" q={q} placeholder="Search by title or company" keep={{ status }} />
      <FilterTabs
        base="/dashboard/admin/jobs"
        param="status"
        active={status}
        keep={{ q }}
        tabs={[
          { value: "active", label: "Active" },
          { value: "draft", label: "Drafts" },
          { value: "suspended", label: "Suspended" },
          { value: "closed", label: "Closed" },
        ]}
      />
      {res.error ? (
        <Alert>{res.error}</Alert>
      ) : res.data.length === 0 ? (
        <EmptyState icon={<Briefcase className="size-5" />} title="No jobs found" />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-line">
              <tr>
                <Th>Role</Th>
                <Th>Company</Th>
                <Th>Status</Th>
                <Th>Applicants</Th>
                <Th>Posted</Th>
                <Th end>Moderation</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {res.data.map((j) => (
                <tr key={j.id} className="hover:bg-surface">
                  <Td>
                    <Link href={`/jobs/${j.slug}`} className="font-medium hover:underline">
                      {j.title}
                    </Link>
                    <span className="block text-muted">{j.city ?? "-"}</span>
                  </Td>
                  <Td>
                    <Link href={`/companies/${j.companySlug}`} className="hover:underline">
                      {j.companyName}
                    </Link>
                  </Td>
                  <Td>
                    <JobStatusBadge status={j.status} />
                  </Td>
                  <Td>{j.applicationCount}</Td>
                  <Td className="whitespace-nowrap text-muted">{timeAgo(new Date(j.createdAt))}</Td>
                  <Td end>
                    <form action={setJobStatusAction}>
                      <input type="hidden" name="jobId" value={j.id} />
                      {j.status === "suspended" ? (
                        <Button type="submit" name="status" value="active" size="sm" variant="outline">
                          Reinstate
                        </Button>
                      ) : (
                        <Button type="submit" name="status" value="suspended" size="sm" variant="danger">
                          Suspend
                        </Button>
                      )}
                    </form>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}

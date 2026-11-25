import type { Metadata } from "next";
import Link from "next/link";
import { Download, FileText } from "lucide-react";
import { AdminSearch, FilterTabs, Td, Th } from "@/components/app/admin-ui";
import { ApplicationStatusBadge } from "@/components/app/status";
import { Alert } from "@/components/ui/field";
import { Card, EmptyState, PageHeader } from "@/components/ui/misc";
import { requireAdmin } from "@/lib/auth/session";
import { APPLICATION_STATUSES } from "@/lib/constants";
import { adminListApplications } from "@/lib/data";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Applications · Admin" };

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

export default async function AdminApplicationsPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireAdmin("/dashboard/admin/applications");
  const sp = await searchParams;
  const q = one(sp.q);
  const status = one(sp.status);
  const res = await adminListApplications(q, status);

  return (
    <>
      <PageHeader title="Applications" description="Every application across all companies, with the CV that was sent." />
      <AdminSearch action="/dashboard/admin/applications" q={q} placeholder="Search candidate, job or company" keep={{ status }} />
      <FilterTabs
        base="/dashboard/admin/applications"
        param="status"
        active={status}
        keep={{ q }}
        tabs={APPLICATION_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
      />
      {res.error ? (
        <Alert>{res.error}</Alert>
      ) : res.data.length === 0 ? (
        <EmptyState icon={<FileText className="size-5" />} title="No applications found" />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b border-line">
              <tr>
                <Th>Candidate</Th>
                <Th>Job</Th>
                <Th>Status</Th>
                <Th>Applied</Th>
                <Th end>CV</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {res.data.map((a) => {
                const cv = a.resumeUrl ?? a.profileResume;
                return (
                  <tr key={a.id} className="hover:bg-surface">
                    <Td>
                      <Link href={`/dashboard/admin/users/${a.userId}`} className="font-medium hover:underline">
                        {a.firstName} {a.lastName}
                      </Link>
                      <span className="block text-muted">{a.email}</span>
                    </Td>
                    <Td>
                      <Link href={`/jobs/${a.jobSlug}`} className="hover:underline">
                        {a.jobTitle}
                      </Link>
                      <span className="block text-muted">{a.companyName}</span>
                    </Td>
                    <Td>
                      <ApplicationStatusBadge status={a.status} />
                    </Td>
                    <Td className="whitespace-nowrap text-muted">{timeAgo(new Date(a.createdAt))}</Td>
                    <Td end>
                      {cv ? (
                        <a href={cv} className="inline-flex items-center gap-1 font-medium text-brand hover:underline">
                          <Download className="size-3.5" /> Download
                        </a>
                      ) : (
                        <span className="text-subtle">No CV</span>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}

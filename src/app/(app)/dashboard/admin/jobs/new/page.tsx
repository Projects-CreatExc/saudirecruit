import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { JobForm } from "@/components/app/job-form";
import { LinkButton } from "@/components/ui/button";
import { Alert } from "@/components/ui/field";
import { EmptyState, PageHeader } from "@/components/ui/misc";
import { parseRoles } from "@/lib/agency-meta";
import { requireAdmin } from "@/lib/auth/session";
import { companyOptions, getInquiry, tagCloud } from "@/lib/data/agency";

export const metadata: Metadata = { title: "Post a job · Admin" };

type SP = Record<string, string | string[] | undefined>;
const uuid = (v: unknown) => (typeof v === "string" && /^[0-9a-f-]{36}$/i.test(v) ? v : undefined);

export default async function AdminNewJobPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireAdmin("/dashboard/admin/jobs/new");
  const sp = await searchParams;
  const fromRequest = uuid(sp.fromRequest);
  const [companies, tags, reqRes] = await Promise.all([companyOptions(), tagCloud(), fromRequest ? getInquiry(fromRequest) : Promise.resolve(null)]);
  if (companies.error) return <Alert>{companies.error}</Alert>;
  const req = reqRes?.data?.inquiry ?? null;
  const role = req ? parseRoles(req.roles)[0] : undefined;

  // Pre-fill from the hiring request; match the company by name when it already exists.
  const companyId =
    uuid(sp.company) ?? (req?.companyName ? companies.data.find((c) => c.name.toLowerCase() === req.companyName!.toLowerCase())?.id : undefined);
  const initial: Record<string, string> = {
    companyId: companyId ?? "",
    title: role?.title ?? "",
    city: req?.city ?? "",
    category: req?.industry ?? "",
    requirements: [role?.notes, role?.count ? `Positions: ${role.count}` : null].filter(Boolean).join("\n"),
    description: req?.message ?? "",
  };
  const salary = role?.salary?.replace(/,/g, "").match(/\d+/g);
  if (salary?.[0]) initial.salaryMin = salary[0];
  if (salary?.[1]) initial.salaryMax = salary[1];

  return (
    <>
      <Link href={fromRequest ? `/dashboard/admin/requests/${fromRequest}` : "/dashboard/admin/jobs"} className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4 rtl:rotate-180" /> {fromRequest ? "Back to request" : "Jobs"}
      </Link>
      <PageHeader title="Post a job" description="Announce a role on behalf of a company. It appears on the public jobs page when published." />
      {companies.data.length === 0 ? (
        <EmptyState
          title="Add a company first"
          description="Every job belongs to a company."
          action={
            <LinkButton href={`/dashboard/admin/companies/new${fromRequest ? `?fromRequest=${fromRequest}` : ""}`}>
              <Plus className="size-4" /> Add company
            </LinkButton>
          }
        />
      ) : (
        <>
          {req && (
            <div className="mb-6">
              <Alert tone="info">
                Pre-filled from {req.companyName ?? req.fullName}&apos;s hiring request{parseRoles(req.roles).length > 1 ? " (first role). Post the other roles one by one." : "."}
              </Alert>
            </div>
          )}
          <JobForm admin={{ companies: companies.data, fromRequest, initial }} tagSuggestions={tags} />
        </>
      )}
    </>
  );
}

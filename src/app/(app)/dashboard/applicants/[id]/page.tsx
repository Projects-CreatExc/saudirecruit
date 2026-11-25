import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CandidateProfile } from "@/components/app/candidate-profile";
import { ApplicationStatusBadge } from "@/components/app/status";
import { StatusSelect } from "@/components/app/status-select";
import { Alert } from "@/components/ui/field";
import { Card } from "@/components/ui/misc";
import { setApplicationStatusAction } from "@/lib/actions/recruiting";
import { requireUser } from "@/lib/auth/session";
import { APPLICATION_STATUSES, isEmployerRole } from "@/lib/constants";
import { getApplicantDetail, getOwnedCompany } from "@/lib/data";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Candidate" };

const PIPELINE = APPLICATION_STATUSES.filter((s) => s.value !== "withdrawn");

export default async function ApplicantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/dashboard/applicants/${id}`);
  if (!isEmployerRole(user.role)) redirect("/dashboard");
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const companyRes = await getOwnedCompany(user.id);
  if (companyRes.error) return <Alert>{companyRes.error}</Alert>;
  if (!companyRes.data) redirect("/dashboard/company");

  const res = await getApplicantDetail(id, companyRes.data.id);
  if (res.error) return <Alert>{res.error}</Alert>;
  if (!res.data) notFound();
  const a = res.data;
  const name = `${a.firstName} ${a.lastName}`;

  return (
    <>
      <Link href="/dashboard/applicants" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4 rtl:rotate-180" /> All applicants
      </Link>
      <CandidateProfile
        c={a}
        resume={a.resume}
        aside={
          <>
            <Card className="p-5">
              <p className="text-xs text-muted">Applied for</p>
              <Link href={`/jobs/${a.jobSlug}`} className="mt-1 block font-semibold hover:underline">
                {a.jobTitle}
              </Link>
              <p className="mt-1 text-sm text-muted">{timeAgo(new Date(a.appliedAt))}</p>
              <div className="mt-4 border-t border-line pt-4">
                <p className="mb-2 text-xs text-muted">Status</p>
                {a.status === "withdrawn" ? (
                  <ApplicationStatusBadge status={a.status} />
                ) : (
                  <StatusSelect action={setApplicationStatusAction} idName="applicationId" id={a.applicationId} value={a.status} options={PIPELINE} label={`Status for ${name}`} />
                )}
              </div>
            </Card>
            {a.coverLetter && (
              <Card className="p-5">
                <p className="text-xs text-muted">Note from {a.firstName}</p>
                <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-body">{a.coverLetter}</p>
              </Card>
            )}
          </>
        }
      />
    </>
  );
}

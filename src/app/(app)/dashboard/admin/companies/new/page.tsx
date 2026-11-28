import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CompanyForm } from "@/components/app/company-form";
import { Alert } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/misc";
import { requireAdmin } from "@/lib/auth/session";
import { getInquiry } from "@/lib/data/agency";

export const metadata: Metadata = { title: "Add company · Admin" };

type SP = Record<string, string | string[] | undefined>;

export default async function NewCompanyPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireAdmin("/dashboard/admin/companies/new");
  const sp = await searchParams;
  const fromRequest = typeof sp.fromRequest === "string" && /^[0-9a-f-]{36}$/i.test(sp.fromRequest) ? sp.fromRequest : undefined;
  const req = fromRequest ? (await getInquiry(fromRequest)).data?.inquiry : null;

  const initial = {
    name: req?.companyName ?? "",
    industry: req?.industry ?? "",
    city: req?.city ?? "",
    website: "",
    crNumber: "",
    employeeCount: "",
    foundedYear: "",
    description: "",
  };

  return (
    <>
      <Link href={fromRequest ? `/dashboard/admin/requests/${fromRequest}` : "/dashboard/admin/companies"} className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4 rtl:rotate-180" /> {fromRequest ? "Back to request" : "Companies"}
      </Link>
      <PageHeader title="Add company" description="Companies you add are managed by the agency. Next, you'll post their first job." />
      {req && (
        <div className="mb-6">
          <Alert tone="info">Pre-filled from {req.fullName}&apos;s hiring request. Check the details before saving.</Alert>
        </div>
      )}
      <CompanyForm initial={initial} isNew admin={{ fromRequest }} />
    </>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CompanyForm } from "@/components/app/company-form";
import { LinkButton } from "@/components/ui/button";
import { Alert } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/misc";
import { requireUser } from "@/lib/auth/session";
import { isEmployerRole } from "@/lib/constants";
import { getOwnedCompany } from "@/lib/data";

export const metadata: Metadata = { title: "Company profile" };

export default async function CompanySettingsPage() {
  const user = await requireUser("/dashboard/company");
  if (!isEmployerRole(user.role)) redirect("/dashboard");
  const res = await getOwnedCompany(user.id);
  if (res.error) return <Alert>{res.error}</Alert>;
  const c = res.data;

  const initial = {
    name: c?.name ?? "",
    industry: c?.industry ?? "",
    city: c?.city ?? "",
    website: c?.website ?? "",
    crNumber: c?.crNumber ?? "",
    employeeCount: c?.employeeCount?.toString() ?? "",
    foundedYear: c?.foundedYear?.toString() ?? "",
    description: c?.description ?? "",
  };

  return (
    <>
      <PageHeader
        title={c ? "Company profile" : "Set up your company"}
        description={c ? "This is what candidates see on your roles and company page." : "Candidates see this on every role you post."}
        actions={
          c ? (
            <LinkButton href={`/companies/${c.slug}`} variant="outline">
              View public page
            </LinkButton>
          ) : undefined
        }
      />
      <CompanyForm initial={initial} isNew={!c} />
    </>
  );
}

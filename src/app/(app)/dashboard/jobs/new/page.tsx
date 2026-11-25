import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { JobForm } from "@/components/app/job-form";
import { PageHeader } from "@/components/ui/misc";
import { requireUser } from "@/lib/auth/session";
import { isEmployerRole } from "@/lib/constants";
import { getOwnedCompany } from "@/lib/data";

export const metadata: Metadata = { title: "Post a job" };

export default async function NewJobPage() {
  const user = await requireUser("/dashboard/jobs/new");
  if (!isEmployerRole(user.role)) redirect("/dashboard");
  const company = await getOwnedCompany(user.id);
  if (company.data === null && !company.error) redirect("/dashboard/company");

  return (
    <>
      <PageHeader title="Post a job" description="Publish now, or save a draft and finish later." />
      <JobForm />
    </>
  );
}

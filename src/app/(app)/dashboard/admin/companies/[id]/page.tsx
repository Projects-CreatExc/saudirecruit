import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";
import { CompanyForm } from "@/components/app/company-form";
import { LinkButton } from "@/components/ui/button";
import { Alert } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/misc";
import { requireAdmin } from "@/lib/auth/session";
import { getCompanyById } from "@/lib/data/agency";

export const metadata: Metadata = { title: "Edit company · Admin" };

export default async function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdmin(`/dashboard/admin/companies/${id}`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const res = await getCompanyById(id);
  if (res.error) return <Alert>{res.error}</Alert>;
  if (!res.data) notFound();
  const c = res.data;

  return (
    <>
      <Link href="/dashboard/admin/companies" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4 rtl:rotate-180" /> Companies
      </Link>
      <PageHeader
        title={c.name}
        description="Edit the public company profile."
        actions={
          <>
            <LinkButton href={`/companies/${c.slug}`} variant="outline">
              View public page
            </LinkButton>
            <LinkButton href={`/dashboard/admin/jobs/new?company=${c.id}`} variant="dark">
              <Plus className="size-4" /> Post a job
            </LinkButton>
          </>
        }
      />
      <CompanyForm
        isNew={false}
        admin={{ id: c.id, isVerified: c.isVerified }}
        initial={{
          name: c.name,
          industry: c.industry ?? "",
          city: c.city ?? "",
          website: c.website ?? "",
          crNumber: c.crNumber ?? "",
          employeeCount: c.employeeCount?.toString() ?? "",
          foundedYear: c.foundedYear?.toString() ?? "",
          description: c.description ?? "",
        }}
      />
    </>
  );
}

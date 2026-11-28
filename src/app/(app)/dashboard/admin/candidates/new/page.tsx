import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CandidateEditor } from "@/components/app/candidate-editor";
import { PageHeader } from "@/components/ui/misc";
import { requireAdmin } from "@/lib/auth/session";
import { tagCloud } from "@/lib/data/agency";

export const metadata: Metadata = { title: "Add candidate · Admin" };

export default async function NewCandidatePage() {
  await requireAdmin("/dashboard/admin/candidates/new");
  const tags = await tagCloud();
  return (
    <>
      <Link href="/dashboard/admin/candidates" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4 rtl:rotate-180" /> Talent pool
      </Link>
      <PageHeader title="Add candidate" description="Only admins can see candidates in the talent pool." />
      <CandidateEditor tagSuggestions={tags} />
    </>
  );
}

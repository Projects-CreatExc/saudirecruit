import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Building2, Plus } from "lucide-react";
import { AdminSearch, Td, Th } from "@/components/app/admin-ui";
import { Button, LinkButton } from "@/components/ui/button";
import { Alert } from "@/components/ui/field";
import { Avatar, Card, EmptyState, PageHeader } from "@/components/ui/misc";
import { adminSetCompanyVerifiedAction } from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/auth/session";
import { adminListCompanies } from "@/lib/data";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Companies · Admin" };

type SP = Record<string, string | string[] | undefined>;

export default async function AdminCompaniesPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireAdmin("/dashboard/admin/companies");
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() || undefined : undefined;
  const res = await adminListCompanies(q);

  return (
    <>
      <PageHeader
        title="Companies"
        description="Companies the agency manages and employers who signed up. Verify after checking the CR number."
        actions={
          <LinkButton href="/dashboard/admin/companies/new" variant="dark">
            <Plus className="size-4" /> Add company
          </LinkButton>
        }
      />
      <AdminSearch action="/dashboard/admin/companies" q={q} placeholder="Search companies" />
      {res.error ? (
        <Alert>{res.error}</Alert>
      ) : res.data.length === 0 ? (
        <EmptyState icon={<Building2 className="size-5" />} title="No companies found" />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="border-b border-line">
              <tr>
                <Th>Company</Th>
                <Th>Owner</Th>
                <Th>CR number</Th>
                <Th>Jobs</Th>
                <Th>Created</Th>
                <Th end>Verification</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {res.data.map((c) => (
                <tr key={c.id} className="hover:bg-surface">
                  <Td>
                    <Link href={`/dashboard/admin/companies/${c.id}`} className="flex items-center gap-3">
                      <Avatar name={c.name} size={34} square />
                      <span className="min-w-0">
                        <span className="flex items-center gap-1 truncate font-medium hover:underline">
                          {c.name}
                          {c.isVerified && <BadgeCheck className="size-4 text-brand" aria-label="Verified" />}
                        </span>
                        <span className="block truncate text-muted">{[c.industry, c.city].filter(Boolean).join(" · ") || "-"}</span>
                      </span>
                    </Link>
                  </Td>
                  <Td>
                    <Link href={`/dashboard/admin/users/${c.ownerId}`} className="hover:underline">
                      {c.ownerName}
                    </Link>
                    <span className="block text-muted">{c.ownerEmail}</span>
                  </Td>
                  <Td className="font-mono text-xs">{c.crNumber || <span className="font-sans text-subtle">Not provided</span>}</Td>
                  <Td>{c.jobs}</Td>
                  <Td className="whitespace-nowrap text-muted">{timeAgo(new Date(c.createdAt))}</Td>
                  <Td end>
                    <form action={adminSetCompanyVerifiedAction}>
                      <input type="hidden" name="companyId" value={c.id} />
                      <input type="hidden" name="verified" value={c.isVerified ? "false" : "true"} />
                      <Button type="submit" size="sm" variant={c.isVerified ? "outline" : "primary"}>
                        {c.isVerified ? "Remove badge" : "Verify"}
                      </Button>
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

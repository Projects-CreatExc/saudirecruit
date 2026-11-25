import type { Metadata } from "next";
import Link from "next/link";
import { Download, Users } from "lucide-react";
import { AdminSearch, FilterTabs, Td, Th } from "@/components/app/admin-ui";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/field";
import { Avatar, Badge, Card, EmptyState, PageHeader } from "@/components/ui/misc";
import { adminSetUserActiveAction } from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/lib/constants";
import { adminListUsers } from "@/lib/data";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Users · Admin" };

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

const ROLE_TABS = [
  { value: "job_seeker", label: "Candidates" },
  { value: "employer", label: "Employers" },
  { value: "admin", label: "Admins" },
];

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<SP> }) {
  const admin = await requireAdmin("/dashboard/admin/users");
  const sp = await searchParams;
  const q = one(sp.q);
  const role = one(sp.role);
  const res = await adminListUsers(q, role);

  return (
    <>
      <PageHeader title="Users" description="Every account on the platform. Open a candidate to see their full profile and CV." />
      <AdminSearch action="/dashboard/admin/users" q={q} placeholder="Search by name or email" keep={{ role }} />
      <FilterTabs base="/dashboard/admin/users" param="role" active={role} tabs={ROLE_TABS} keep={{ q }} />

      {res.error ? (
        <Alert>{res.error}</Alert>
      ) : res.data.length === 0 ? (
        <EmptyState icon={<Users className="size-5" />} title="No users found" />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b border-line">
              <tr>
                <Th>User</Th>
                <Th>Role</Th>
                <Th>CV</Th>
                <Th>Applications</Th>
                <Th>Joined</Th>
                <Th end>Access</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {res.data.map((u) => (
                <tr key={u.id} className="hover:bg-surface">
                  <Td>
                    <Link href={`/dashboard/admin/users/${u.id}`} className="flex items-center gap-3">
                      <Avatar name={`${u.firstName} ${u.lastName}`} size={34} />
                      <span className="min-w-0">
                        <span className="block truncate font-medium hover:underline">
                          {u.firstName} {u.lastName}
                        </span>
                        <span className="block truncate text-muted">{u.email}</span>
                      </span>
                    </Link>
                  </Td>
                  <Td>{ROLE_LABELS[u.role]}</Td>
                  <Td>
                    {u.resumeUrl ? (
                      <a href={u.resumeUrl} className="inline-flex items-center gap-1 font-medium text-brand hover:underline">
                        <Download className="size-3.5" /> CV
                      </a>
                    ) : (
                      <span className="text-subtle">-</span>
                    )}
                  </Td>
                  <Td>{u.applications}</Td>
                  <Td className="whitespace-nowrap text-muted">{timeAgo(new Date(u.createdAt))}</Td>
                  <Td end>
                    {u.id === admin.id ? (
                      <Badge tone="info">You</Badge>
                    ) : (
                      <form action={adminSetUserActiveAction} className="inline-flex items-center gap-2">
                        {!u.isActive && <Badge tone="danger">Disabled</Badge>}
                        <input type="hidden" name="userId" value={u.id} />
                        <input type="hidden" name="active" value={u.isActive ? "false" : "true"} />
                        <Button type="submit" size="sm" variant={u.isActive ? "danger" : "outline"}>
                          {u.isActive ? "Disable" : "Enable"}
                        </Button>
                      </form>
                    )}
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

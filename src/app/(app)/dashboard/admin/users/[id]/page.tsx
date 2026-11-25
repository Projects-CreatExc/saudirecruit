import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import { CandidateProfile } from "@/components/app/candidate-profile";
import { ApplicationStatusBadge } from "@/components/app/status";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/field";
import { Badge, Card } from "@/components/ui/misc";
import { adminSetUserActiveAction } from "@/lib/actions/admin";
import { requireAdmin } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/lib/constants";
import { adminGetUser } from "@/lib/data";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "User · Admin" };

export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdmin(`/dashboard/admin/users/${id}`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const res = await adminGetUser(id);
  if (res.error) return <Alert>{res.error}</Alert>;
  if (!res.data) notFound();
  const u = res.data;

  return (
    <>
      <Link href="/dashboard/admin/users" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4 rtl:rotate-180" /> All users
      </Link>
      <CandidateProfile
        c={u}
        resume={u.resume}
        aside={
          <>
            <Card className="space-y-3 p-5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted">Role</span>
                <span className="font-medium">{ROLE_LABELS[u.role]}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Status</span>
                {u.isActive ? <Badge tone="brand">Active</Badge> : <Badge tone="danger">Disabled</Badge>}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Joined</span>
                <span>{timeAgo(new Date(u.joinedAt))}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Last login</span>
                <span>{u.lastLoginAt ? timeAgo(new Date(u.lastLoginAt)) : "Never"}</span>
              </div>
              {u.company && (
                <div className="flex items-center justify-between">
                  <span className="text-muted">Company</span>
                  <Link href={`/companies/${u.company.slug}`} className="font-medium hover:underline">
                    {u.company.name}
                  </Link>
                </div>
              )}
              {u.userId !== admin.id && (
                <form action={adminSetUserActiveAction} className="border-t border-line pt-3">
                  <input type="hidden" name="userId" value={u.userId} />
                  <input type="hidden" name="active" value={u.isActive ? "false" : "true"} />
                  <Button type="submit" size="sm" variant={u.isActive ? "danger" : "outline"} className="w-full">
                    {u.isActive ? "Disable account" : "Enable account"}
                  </Button>
                </form>
              )}
            </Card>

            {u.applications.length > 0 && (
              <Card className="p-5">
                <p className="mb-3 text-sm font-semibold">Applications ({u.applications.length})</p>
                <ul className="space-y-3">
                  {u.applications.map((a) => (
                    <li key={a.id} className="text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/jobs/${a.jobSlug}`} className="font-medium hover:underline">
                          {a.jobTitle}
                        </Link>
                        <ApplicationStatusBadge status={a.status} />
                      </div>
                      <p className="mt-0.5 flex items-center gap-2 text-muted">
                        {a.companyName} · {timeAgo(new Date(a.createdAt))}
                        {a.resumeUrl && (
                          <a href={a.resumeUrl} className="inline-flex items-center gap-1 text-brand hover:underline" aria-label="CV sent with this application">
                            <Download className="size-3" /> CV
                          </a>
                        )}
                      </p>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </>
        }
      />
    </>
  );
}

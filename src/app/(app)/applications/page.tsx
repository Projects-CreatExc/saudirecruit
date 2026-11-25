import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { ApplicationStatusBadge } from "@/components/app/status";
import { Button, LinkButton } from "@/components/ui/button";
import { Alert } from "@/components/ui/field";
import { Avatar, Card, EmptyState, PageHeader } from "@/components/ui/misc";
import { withdrawApplicationAction } from "@/lib/actions/recruiting";
import { requireUser } from "@/lib/auth/session";
import { APPLICATION_STATUSES, isAdminRole, isEmployerRole } from "@/lib/constants";
import { getSeekerApplications } from "@/lib/data";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Applications" };

const STEPS = ["applied", "shortlisted", "interview", "offer", "hired"];

export default async function ApplicationsPage() {
  const user = await requireUser("/applications");
  if (isEmployerRole(user.role)) redirect("/dashboard/applicants");
  if (isAdminRole(user.role)) redirect("/dashboard");
  const res = await getSeekerApplications(user.id);

  return (
    <>
      <PageHeader
        title="Applications"
        description="Every role you've applied to, with its latest status."
        actions={<LinkButton href="/jobs" variant="dark">Find more jobs</LinkButton>}
      />
      {res.error ? (
        <Alert>{res.error}</Alert>
      ) : res.data.length === 0 ? (
        <EmptyState
          icon={<FileText className="size-5" />}
          title="You haven't applied anywhere yet"
          description="Browse open roles and apply in a couple of clicks."
          action={<LinkButton href="/jobs">Browse jobs</LinkButton>}
        />
      ) : (
        <div className="grid gap-3">
          {res.data.map((a) => {
            const stepIndex = STEPS.indexOf(a.status);
            const closed = a.status === "rejected" || a.status === "withdrawn";
            return (
              <Card key={a.id} className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Avatar name={a.companyName} src={a.companyLogo} size={44} square />
                  <div className="min-w-0 flex-1">
                    <Link href={`/jobs/${a.jobSlug}`} className="font-semibold hover:underline">
                      {a.jobTitle}
                    </Link>
                    <p className="text-sm text-muted">
                      {[a.companyName, a.jobCity, a.isRemote ? "Remote" : null].filter(Boolean).join(" · ")} · Applied {timeAgo(new Date(a.createdAt))}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ApplicationStatusBadge status={a.status} />
                    {!closed && a.status !== "hired" && (
                      <form action={withdrawApplicationAction}>
                        <input type="hidden" name="applicationId" value={a.id} />
                        <Button type="submit" variant="ghost" size="sm" className="text-muted">
                          Withdraw
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
                {!closed && (
                  <ol className="mt-5 grid grid-cols-5 gap-1.5" aria-label="Application progress">
                    {STEPS.map((s, i) => (
                      <li key={s}>
                        <span className={`block h-1 rounded-full ${i <= stepIndex ? "bg-brand" : "bg-surface-2"}`} />
                        <span className={`mt-1.5 hidden text-xs sm:block ${i <= stepIndex ? "text-ink" : "text-subtle"}`}>
                          {APPLICATION_STATUSES.find((x) => x.value === s)?.label}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </>
  );
}

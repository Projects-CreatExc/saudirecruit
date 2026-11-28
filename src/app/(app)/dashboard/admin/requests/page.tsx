import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Inbox, Paperclip } from "lucide-react";
import { AdminSearch, FilterTabs } from "@/components/app/admin-ui";
import { Alert, Select } from "@/components/ui/field";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui/misc";
import { INQUIRY_STATUS_META, INQUIRY_TYPE_META, parseRoles } from "@/lib/agency-meta";
import { requireAdmin } from "@/lib/auth/session";
import { inquiryCounts, listInquiries } from "@/lib/data/agency";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Requests · Admin" };

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

export default async function RequestsPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireAdmin("/dashboard/admin/requests");
  const sp = await searchParams;
  const type = one(sp.type);
  const status = one(sp.status);
  const q = one(sp.q);
  const [res, counts] = await Promise.all([listInquiries({ type, status, q }), inquiryCounts()]);
  const c = counts.data ?? { total: 0 };

  const tabs = Object.entries(INQUIRY_TYPE_META).map(([value, m]) => ({
    value,
    label: `${m.plural}${(c as Record<string, number>)[value] ? ` (${(c as Record<string, number>)[value]} new)` : ""}`,
  }));

  return (
    <>
      <PageHeader title="Requests" description="CVs, hiring requests and job applications sent from the website. No account needed to send them." />
      <AdminSearch action="/dashboard/admin/requests" q={q} placeholder="Search name, email, phone or company" keep={{ type, status }} />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <FilterTabs base="/dashboard/admin/requests" param="type" active={type} tabs={tabs} keep={{ q, status }} />
        <form action="/dashboard/admin/requests" method="get" className="flex shrink-0 gap-2">
          {type && <input type="hidden" name="type" value={type} />}
          {q && <input type="hidden" name="q" value={q} />}
          <Select name="status" defaultValue={status ?? ""} aria-label="Status" className="h-9 w-44 rounded-full text-sm">
            <option value="">Open (not archived)</option>
            {Object.entries(INQUIRY_STATUS_META).map(([v, m]) => (
              <option key={v} value={v}>
                {m.label}
              </option>
            ))}
          </Select>
          <button type="submit" className="h-9 rounded-full border border-line-strong px-4 text-sm font-medium hover:border-ink">
            Filter
          </button>
        </form>
      </div>

      {res.error ? (
        <Alert>{res.error}</Alert>
      ) : res.data.length === 0 ? (
        <EmptyState
          icon={<Inbox className="size-5" />}
          title={q || type || status ? "Nothing matches these filters" : "No requests yet"}
          description="When visitors send a CV, a hiring request or apply to a job, it appears here."
        />
      ) : (
        <Card className="divide-y divide-line overflow-hidden">
          {res.data.map((r) => {
            const t = INQUIRY_TYPE_META[r.type];
            const st = INQUIRY_STATUS_META[r.status];
            const roles = parseRoles(r.roles);
            const summary =
              r.type === "company"
                ? [r.companyName, roles.length ? `${roles.length} role${roles.length > 1 ? "s" : ""}: ${roles.map((x) => x.title).slice(0, 3).join(", ")}` : null].filter(Boolean).join(" · ")
                : r.type === "application"
                  ? `For ${r.jobTitle ?? "a job"}`
                  : [r.headline, r.city].filter(Boolean).join(" · ");
            return (
              <Link key={r.id} href={`/dashboard/admin/requests/${r.id}`} className="flex items-center gap-4 p-4 transition-colors hover:bg-surface sm:p-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`font-semibold ${r.status === "new" ? "" : "font-medium"}`}>{r.fullName}</span>
                    <Badge tone={t?.tone}>{t?.label ?? r.type}</Badge>
                    {r.status !== "new" && <Badge tone={st?.tone}>{st?.label}</Badge>}
                    {r.status === "new" && <span className="size-2 rounded-full bg-brand" aria-label="New" />}
                  </div>
                  <p className="mt-1 truncate text-sm text-body">{summary || r.email}</p>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {[r.phone, r.email].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5 text-xs text-muted">
                  {timeAgo(new Date(r.createdAt))}
                  {r.fileId && <Paperclip className="size-3.5" aria-label="Has attachment" />}
                </div>
                <ChevronRight className="size-4 shrink-0 text-subtle rtl:rotate-180" />
              </Link>
            );
          })}
        </Card>
      )}
    </>
  );
}

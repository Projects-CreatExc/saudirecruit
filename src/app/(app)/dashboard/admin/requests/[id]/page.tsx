import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Briefcase, Building2, Download, FileText, Mail, MessageCircle, Phone, UserPlus } from "lucide-react";
import { InquiryNotes } from "@/components/app/inquiry-notes";
import { Button, LinkButton } from "@/components/ui/button";
import { Alert } from "@/components/ui/field";
import { Badge, Card } from "@/components/ui/misc";
import { convertToCandidateAction, setInquiryStatusAction } from "@/lib/actions/agency-admin";
import { INQUIRY_STATUS_META, INQUIRY_TYPE_META, parseRoles } from "@/lib/agency-meta";
import { whatsappLink } from "@/lib/agency";
import { requireAdmin } from "@/lib/auth/session";
import { parseSkills } from "@/lib/constants";
import { getInquiry } from "@/lib/data/agency";
import { formatBytes } from "@/lib/resume";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Request · Admin" };

const QUICK_STATUSES = ["in_review", "contacted", "archived"] as const;

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdmin(`/dashboard/admin/requests/${id}`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const res = await getInquiry(id);
  if (res.error) return <Alert>{res.error}</Alert>;
  if (!res.data) notFound();
  const { inquiry: r, jobTitle, jobSlug, companyName, fileId, fileName, fileSize } = res.data;
  const t = INQUIRY_TYPE_META[r.type];
  const st = INQUIRY_STATUS_META[r.status];
  const roles = parseRoles(r.roles);
  const skills = parseSkills(r.skills);
  const wa = r.phone ? whatsappLink(r.phone, `Hello ${r.fullName.split(" ")[0]}, this is SaudiRecruit regarding your ${t?.label.toLowerCase() ?? "request"}.`) : null;

  const facts = [
    ["Company", r.companyName],
    ["City", r.city],
    ["Industry", r.industry],
    ["Current title", r.type === "application" ? null : r.headline],
    ["Experience", r.experienceYears != null ? `${r.experienceYears} years` : null],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <>
      <Link href="/dashboard/admin/requests" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4 rtl:rotate-180" /> All requests
      </Link>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={t?.tone}>{t?.label}</Badge>
              <Badge tone={st?.tone}>{st?.label}</Badge>
              <span className="text-sm text-muted">Received {timeAgo(new Date(r.createdAt)).toLowerCase()}</span>
            </div>
            <h1 className="display-md mt-4">{r.fullName}</h1>
            {r.type === "application" && jobTitle && (
              <p className="mt-1 text-body">
                Applied for{" "}
                <Link href={`/jobs/${jobSlug}`} className="font-medium text-ink hover:underline">
                  {jobTitle}
                </Link>
                {companyName ? ` at ${companyName}` : ""}
              </p>
            )}
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-5 text-sm">
              {r.email && (
                <li className="flex items-center gap-2">
                  <Mail className="size-4 text-subtle" />
                  <a href={`mailto:${r.email}`} className="hover:underline">
                    {r.email}
                  </a>
                </li>
              )}
              {r.phone && (
                <li className="flex items-center gap-2">
                  <Phone className="size-4 text-subtle" />
                  <a href={`tel:${r.phone}`} className="hover:underline">
                    {r.phone}
                  </a>
                </li>
              )}
              {wa && (
                <li className="flex items-center gap-2">
                  <MessageCircle className="size-4 text-subtle" />
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    WhatsApp
                  </a>
                </li>
              )}
            </ul>
            {facts.length > 0 && (
              <dl className="mt-5 grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
                {facts.map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-muted">{k}</dt>
                    <dd className="mt-0.5 text-[15px]">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
            {skills.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-1.5 border-t border-line pt-5">
                {skills.map((s) => (
                  <li key={s} className="rounded-lg border border-line px-2.5 py-1 text-sm text-ink-soft">
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {roles.length > 0 && (
            <Card className="overflow-x-auto">
              <h2 className="px-6 pt-5 text-base font-semibold">Roles requested</h2>
              <table className="mt-3 w-full min-w-[560px] text-sm">
                <thead className="border-y border-line text-xs text-muted">
                  <tr>
                    <th className="px-6 py-2.5 text-start font-medium">Job title</th>
                    <th className="px-4 py-2.5 text-start font-medium">People</th>
                    <th className="px-4 py-2.5 text-start font-medium">Salary</th>
                    <th className="px-6 py-2.5 text-start font-medium">Requirements</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {roles.map((x, i) => (
                    <tr key={i}>
                      <td className="px-6 py-3 font-medium">{x.title}</td>
                      <td className="px-4 py-3">{x.count ?? "-"}</td>
                      <td className="px-4 py-3">{x.salary ?? "-"}</td>
                      <td className="px-6 py-3 text-body">{x.notes ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {r.message && (
            <Card className="p-6">
              <h2 className="text-base font-semibold">Message</h2>
              <p className="mt-2 text-[15px] leading-relaxed whitespace-pre-line text-body">{r.message}</p>
            </Card>
          )}

          <Card className="p-6">
            <InquiryNotes id={r.id} defaultValue={r.adminNotes} />
          </Card>
        </div>

        <aside className="space-y-4">
          {fileId && (
            <Card className="flex items-center gap-3 p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <FileText className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{fileName}</p>
                <p className="text-xs text-muted">{formatBytes(fileSize ?? 0)}</p>
              </div>
              <a href={`/api/files/${fileId}`} aria-label="Download file" className="inline-flex size-10 items-center justify-center rounded-full bg-ink text-white hover:bg-ink-soft">
                <Download className="size-4" />
              </a>
            </Card>
          )}

          <Card className="space-y-3 p-5">
            <p className="text-sm font-semibold">Next step</p>
            {r.type === "company" ? (
              <>
                <LinkButton href={`/dashboard/admin/companies/new?fromRequest=${r.id}`} className="w-full">
                  <Building2 className="size-4" /> Create company & post job
                </LinkButton>
                <LinkButton href={`/dashboard/admin/jobs/new?fromRequest=${r.id}`} variant="outline" className="w-full">
                  <Briefcase className="size-4" /> Post job for existing company
                </LinkButton>
              </>
            ) : r.candidateId ? (
              <LinkButton href={`/dashboard/admin/candidates/${r.candidateId}`} variant="outline" className="w-full">
                Open in talent pool
              </LinkButton>
            ) : (
              <form action={convertToCandidateAction}>
                <input type="hidden" name="id" value={r.id} />
                <Button type="submit" className="w-full">
                  <UserPlus className="size-4" /> Add to talent pool
                </Button>
              </form>
            )}
          </Card>

          <Card className="p-5">
            <p className="mb-3 text-sm font-semibold">Status</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_STATUSES.map((s) => (
                <form key={s} action={setInquiryStatusAction}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="status" value={s} />
                  <button
                    type="submit"
                    disabled={r.status === s}
                    className="h-9 rounded-full border border-line-strong px-3.5 text-sm font-medium transition-colors hover:border-ink disabled:border-ink disabled:bg-ink disabled:text-white"
                  >
                    {INQUIRY_STATUS_META[s].label}
                  </button>
                </form>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </>
  );
}

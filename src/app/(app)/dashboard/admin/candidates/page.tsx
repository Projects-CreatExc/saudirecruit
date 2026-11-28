import type { Metadata } from "next";
import Link from "next/link";
import { Contact, Download, Plus } from "lucide-react";
import { AdminSearch, FilterTabs, Td, Th } from "@/components/app/admin-ui";
import { LinkButton } from "@/components/ui/button";
import { Alert } from "@/components/ui/field";
import { Avatar, Badge, Card, EmptyState, PageHeader } from "@/components/ui/misc";
import { CANDIDATE_STATUS_META } from "@/lib/agency-meta";
import { requireAdmin } from "@/lib/auth/session";
import { parseSkills } from "@/lib/constants";
import { listCandidates, tagCloud } from "@/lib/data/agency";
import { cn, timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Talent pool · Admin" };

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

export default async function CandidatesPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireAdmin("/dashboard/admin/candidates");
  const sp = await searchParams;
  const q = one(sp.q);
  const tag = one(sp.tag);
  const status = one(sp.status);
  const [res, tags] = await Promise.all([listCandidates({ q, tag, status }), tagCloud(24)]);

  const tagHref = (t?: string) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (status) p.set("status", status);
    if (t) p.set("tag", t);
    const s = p.toString();
    return `/dashboard/admin/candidates${s ? `?${s}` : ""}`;
  };

  return (
    <>
      <PageHeader
        title="Talent pool"
        description="Your private candidate database. Never shown on the public website."
        actions={
          <LinkButton href="/dashboard/admin/candidates/new" variant="dark">
            <Plus className="size-4" /> Add candidate
          </LinkButton>
        }
      />
      <AdminSearch action="/dashboard/admin/candidates" q={q} placeholder="Search name, phone, title, skill or tag" keep={{ tag, status }} />
      <FilterTabs
        base="/dashboard/admin/candidates"
        param="status"
        active={status}
        keep={{ q, tag }}
        tabs={Object.entries(CANDIDATE_STATUS_META).map(([value, m]) => ({ value, label: m.label }))}
      />
      {tags.length > 0 && (
        <div className="-mx-5 mb-5 flex gap-1.5 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {tag && (
            <Link href={tagHref()} className="shrink-0 rounded-full bg-ink px-3 py-1 text-sm font-medium text-white">
              #{tag} ✕
            </Link>
          )}
          {tags
            .filter((t) => t !== tag)
            .map((t) => (
              <Link key={t} href={tagHref(t)} className="shrink-0 rounded-full border border-line px-3 py-1 text-sm text-ink-soft hover:border-ink">
                #{t}
              </Link>
            ))}
        </div>
      )}

      {res.error ? (
        <Alert>{res.error}</Alert>
      ) : res.data.length === 0 ? (
        <EmptyState
          icon={<Contact className="size-5" />}
          title={q || tag || status ? "No candidates match" : "Your talent pool is empty"}
          description="Add candidates yourself, or open a CV request and choose 'Add to talent pool'."
          action={<LinkButton href="/dashboard/admin/candidates/new">Add candidate</LinkButton>}
        />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b border-line">
              <tr>
                <Th>Candidate</Th>
                <Th>Tags</Th>
                <Th>Status</Th>
                <Th>Added</Th>
                <Th end>CV</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {res.data.map((c) => {
                const ts = parseSkills(c.tags);
                const st = CANDIDATE_STATUS_META[c.status];
                return (
                  <tr key={c.id} className="hover:bg-surface">
                    <Td>
                      <Link href={`/dashboard/admin/candidates/${c.id}`} className="flex items-center gap-3">
                        <Avatar name={c.fullName} size={34} />
                        <span className="min-w-0">
                          <span className="block truncate font-medium hover:underline">{c.fullName}</span>
                          <span className="block truncate text-muted">
                            {[c.headline, c.experienceYears != null ? `${c.experienceYears} yrs` : null, c.city].filter(Boolean).join(" · ") || c.phone || c.email}
                          </span>
                        </span>
                      </Link>
                    </Td>
                    <Td>
                      <div className="flex max-w-xs flex-wrap gap-1">
                        {ts.slice(0, 4).map((t) => (
                          <Link key={t} href={tagHref(t)} className={cn("rounded-full px-2 py-0.5 text-xs", t === tag ? "bg-ink text-white" : "bg-brand-soft text-brand-ink")}>
                            #{t}
                          </Link>
                        ))}
                        {ts.length > 4 && <span className="text-xs text-muted">+{ts.length - 4}</span>}
                      </div>
                    </Td>
                    <Td>
                      <Badge tone={st?.tone}>{st?.label ?? c.status}</Badge>
                    </Td>
                    <Td className="whitespace-nowrap text-muted">{timeAgo(new Date(c.createdAt))}</Td>
                    <Td end>
                      {c.fileId ? (
                        <a href={`/api/files/${c.fileId}`} className="inline-flex items-center gap-1 font-medium text-brand hover:underline">
                          <Download className="size-3.5" /> CV
                        </a>
                      ) : (
                        <span className="text-subtle">-</span>
                      )}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}

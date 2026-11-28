import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, FileText, Mail, MessageCircle, Phone } from "lucide-react";
import { CandidateEditor } from "@/components/app/candidate-editor";
import { Alert } from "@/components/ui/field";
import { Badge, Card } from "@/components/ui/misc";
import { CANDIDATE_STATUS_META, INQUIRY_STATUS_META, INQUIRY_TYPE_META } from "@/lib/agency-meta";
import { whatsappLink } from "@/lib/agency";
import { requireAdmin } from "@/lib/auth/session";
import { parseSkills } from "@/lib/constants";
import { getCandidate, tagCloud } from "@/lib/data/agency";
import { formatBytes } from "@/lib/resume";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Candidate · Admin" };

type SP = Record<string, string | string[] | undefined>;

export default async function CandidatePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<SP> }) {
  const { id } = await params;
  const sp = await searchParams;
  await requireAdmin(`/dashboard/admin/candidates/${id}`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [res, tags] = await Promise.all([getCandidate(id), tagCloud()]);
  if (res.error) return <Alert>{res.error}</Alert>;
  if (!res.data) notFound();
  const { candidate: c, fileId, fileName, fileSize, related } = res.data;
  const st = CANDIDATE_STATUS_META[c.status];
  const wa = c.phone ? whatsappLink(c.phone, `Hello ${c.fullName.split(" ")[0]}, this is SaudiRecruit.`) : null;

  const initial = {
    fullName: c.fullName,
    email: c.email ?? "",
    phone: c.phone ?? "",
    city: c.city ?? "",
    nationality: c.nationality ?? "",
    headline: c.headline ?? "",
    experienceYears: c.experienceYears?.toString() ?? "",
    visaStatus: c.visaStatus ?? "",
    skills: parseSkills(c.skills).join(", "),
    tags: c.tags ?? "",
    notes: c.notes ?? "",
    status: c.status,
  };

  return (
    <>
      <Link href="/dashboard/admin/candidates" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4 rtl:rotate-180" /> Talent pool
      </Link>
      {sp.added === "1" && (
        <div className="mb-6">
          <Alert tone="success">Added to your talent pool. Add tags so you can find this person later.</Alert>
        </div>
      )}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="display-md">{c.fullName}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone={st?.tone}>{st?.label}</Badge>
            <span className="text-sm text-muted">Source: {c.source === "manual" ? "added by admin" : c.source === "application" ? "job application" : "CV request"}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <CandidateEditor id={c.id} initial={initial} tagSuggestions={tags} hasCv={!!fileId} />
        <aside className="space-y-4">
          <Card className="space-y-2.5 p-5 text-sm">
            {c.phone && (
              <a href={`tel:${c.phone}`} className="flex items-center gap-2 hover:underline">
                <Phone className="size-4 text-subtle" /> {c.phone}
              </a>
            )}
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline">
                <MessageCircle className="size-4 text-subtle" /> WhatsApp
              </a>
            )}
            {c.email && (
              <a href={`mailto:${c.email}`} className="flex items-center gap-2 truncate hover:underline">
                <Mail className="size-4 text-subtle" /> {c.email}
              </a>
            )}
            {!c.phone && !c.email && <p className="text-muted">No contact details yet.</p>}
          </Card>
          {fileId ? (
            <Card className="flex items-center gap-3 p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <FileText className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{fileName}</p>
                <p className="text-xs text-muted">{formatBytes(fileSize ?? 0)}</p>
              </div>
              <a href={`/api/files/${fileId}`} aria-label="Download CV" className="inline-flex size-10 items-center justify-center rounded-full bg-ink text-white hover:bg-ink-soft">
                <Download className="size-4" />
              </a>
            </Card>
          ) : (
            <Card className="border-dashed p-5 text-sm text-muted">No CV on file. Upload one in the form.</Card>
          )}
          {related.length > 0 && (
            <Card className="p-5">
              <p className="mb-3 text-sm font-semibold">Requests from this person</p>
              <ul className="space-y-2.5 text-sm">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link href={`/dashboard/admin/requests/${r.id}`} className="flex items-center justify-between gap-2 hover:underline">
                      <span className="truncate">{r.jobTitle ? `Applied: ${r.jobTitle}` : INQUIRY_TYPE_META[r.type]?.label}</span>
                      <Badge tone={INQUIRY_STATUS_META[r.status]?.tone}>{INQUIRY_STATUS_META[r.status]?.label}</Badge>
                    </Link>
                    <p className="text-xs text-muted">{timeAgo(new Date(r.createdAt))}</p>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </aside>
      </div>
    </>
  );
}

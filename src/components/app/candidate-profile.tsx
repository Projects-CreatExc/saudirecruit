import { Download, FileText, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { EXPERIENCE_LEVELS, VISA_STATUSES, labelFor, parseSkills } from "@/lib/constants";
import { formatBytes } from "@/lib/resume";
import { timeAgo } from "@/lib/utils";
import { Avatar, Badge, Card } from "@/components/ui/misc";

export type CandidateData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  headline: string | null;
  summary: string | null;
  currentCity: string | null;
  currentJobTitle: string | null;
  desiredJobTitle: string | null;
  experienceLevel: string | null;
  totalExperienceYears: number | null;
  visaStatus: string | null;
  skills: string | null;
  isOpenToWork: boolean | null;
  joinedAt?: Date;
};

export type ResumeMeta = { id: string; fileName: string; sizeBytes: number; createdAt: Date } | null;

export function ResumeCard({ resume, name }: { resume: ResumeMeta; name: string }) {
  if (!resume) {
    return (
      <Card className="flex items-center gap-3 border-dashed p-5 text-sm text-muted">
        <FileText className="size-5 shrink-0" /> {name} hasn&apos;t uploaded a CV yet.
      </Card>
    );
  }
  return (
    <Card className="flex items-center gap-4 p-5">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
        <FileText className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{resume.fileName}</p>
        <p className="text-sm text-muted">
          {formatBytes(resume.sizeBytes)} · uploaded {timeAgo(new Date(resume.createdAt)).toLowerCase()}
        </p>
      </div>
      <a
        href={`/api/cv/${resume.id}`}
        className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-ink px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-soft"
      >
        <Download className="size-4" /> Download CV
      </a>
    </Card>
  );
}

export function CandidateProfile({ c, resume, aside }: { c: CandidateData; resume: ResumeMeta; aside?: React.ReactNode }) {
  const name = `${c.firstName} ${c.lastName}`;
  const skills = parseSkills(c.skills);
  const facts = [
    { label: "Current role", value: c.currentJobTitle },
    { label: "Looking for", value: c.desiredJobTitle },
    { label: "Experience", value: [labelFor(EXPERIENCE_LEVELS, c.experienceLevel), c.totalExperienceYears != null ? `${c.totalExperienceYears} years` : null].filter(Boolean).join(" · ") || null },
    { label: "Visa / residency", value: c.visaStatus && c.visaStatus !== "not_specified" ? labelFor(VISA_STATUSES, c.visaStatus) : null },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
      <div className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Avatar name={name} size={64} />
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-medium tracking-[-0.02em]">{name}</h2>
              <p className="mt-0.5 text-body">{c.headline || "No headline yet"}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {c.isOpenToWork && <Badge tone="brand">Open to work</Badge>}
                {c.currentCity && (
                  <Badge>
                    <MapPin className="size-3" /> {c.currentCity}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-5 text-sm">
            <li className="flex items-center gap-2">
              <Mail className="size-4 text-subtle" />
              <a href={`mailto:${c.email}`} className="hover:underline">
                {c.email}
              </a>
            </li>
            {c.phone && (
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-subtle" />
                <a href={`tel:${c.phone}`} className="hover:underline">
                  {c.phone}
                </a>
              </li>
            )}
          </ul>
        </Card>

        <ResumeCard resume={resume} name={c.firstName} />

        <Card className="p-6">
          <h3 className="text-base font-semibold">Profile</h3>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            {facts.map((f) => (
              <div key={f.label}>
                <dt className="text-xs text-muted">{f.label}</dt>
                <dd className="mt-0.5 text-[15px]">{f.value || <span className="text-subtle">Not provided</span>}</dd>
              </div>
            ))}
          </dl>
          {c.summary && (
            <div className="mt-6 border-t border-line pt-5">
              <h4 className="text-xs text-muted">Summary</h4>
              <p className="mt-1.5 text-[15px] leading-relaxed whitespace-pre-line text-body">{c.summary}</p>
            </div>
          )}
          {skills.length > 0 && (
            <div className="mt-6 border-t border-line pt-5">
              <h4 className="text-xs text-muted">Skills</h4>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <li key={s} className="rounded-lg border border-line px-2.5 py-1 text-sm text-ink-soft">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>
      <aside className="space-y-4">
        {aside}
        <p className="flex items-start gap-2 px-1 text-xs leading-relaxed text-muted">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0" /> Candidate data is shared only for recruitment. Don&apos;t forward it outside your hiring team.
        </p>
      </aside>
    </div>
  );
}

import { APPLICATION_STATUSES, JOB_STATUS_META } from "@/lib/constants";
import type { ApplicationStatus, JobStatus } from "@/types";
import { Badge } from "@/components/ui/misc";

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const meta = APPLICATION_STATUSES.find((s) => s.value === status);
  return <Badge tone={meta?.tone ?? "neutral"}>{meta?.label ?? status}</Badge>;
}

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const meta = JOB_STATUS_META[status];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
}

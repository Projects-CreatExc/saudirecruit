type Tone = "neutral" | "brand" | "gold" | "danger" | "warning" | "info";

export const INQUIRY_TYPE_META: Record<string, { label: string; plural: string; tone: Tone }> = {
  candidate: { label: "CV submission", plural: "CVs", tone: "info" },
  company: { label: "Hiring request", plural: "Hiring requests", tone: "gold" },
  application: { label: "Job application", plural: "Applications", tone: "brand" },
};

export const INQUIRY_STATUS_META: Record<string, { label: string; tone: Tone }> = {
  new: { label: "New", tone: "brand" },
  in_review: { label: "In review", tone: "info" },
  contacted: { label: "Contacted", tone: "gold" },
  converted: { label: "Done", tone: "neutral" },
  archived: { label: "Archived", tone: "neutral" },
};

export const CANDIDATE_STATUS_META: Record<string, { label: string; tone: Tone }> = {
  active: { label: "Available", tone: "brand" },
  shortlisted: { label: "Shortlisted", tone: "info" },
  placed: { label: "Placed", tone: "gold" },
  archived: { label: "Archived", tone: "neutral" },
};

export type RoleRequest = { title: string; count?: number; salary?: string; notes?: string };
export function parseRoles(raw?: string | null): RoleRequest[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((r) => r && r.title) : [];
  } catch {
    return [];
  }
}

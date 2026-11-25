import type { ApplicationStatus, JobStatus, UserRole } from "@/types";

export const JOB_TYPES = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "temporary", label: "Temporary" },
  { value: "internship", label: "Internship" },
] as const;

export const EXPERIENCE_LEVELS = [
  { value: "entry", label: "Entry level" },
  { value: "mid", label: "Mid level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
  { value: "executive", label: "Executive" },
] as const;

export const VISA_STATUSES = [
  { value: "not_specified", label: "Not specified" },
  { value: "citizen", label: "Saudi citizen" },
  { value: "resident", label: "Resident (Iqama)" },
  { value: "work_visa", label: "Work visa" },
  { value: "visit_visa", label: "Visit visa" },
  { value: "transferable", label: "Transferable Iqama" },
] as const;

export const SAUDI_CITIES = [
  "Riyadh",
  "Jeddah",
  "Dammam",
  "Khobar",
  "Mecca",
  "Medina",
  "Dhahran",
  "Jubail",
  "Yanbu",
  "Tabuk",
  "Abha",
  "NEOM",
] as const;

export const CATEGORIES = [
  "Engineering",
  "Technology",
  "Healthcare",
  "Finance",
  "Construction",
  "Energy",
  "Hospitality",
  "Sales & Marketing",
  "Operations",
  "Human Resources",
  "Education",
  "Legal",
] as const;

export const APPLICATION_STATUSES: { value: ApplicationStatus; label: string; tone: "neutral" | "brand" | "gold" | "danger" | "warning" | "info" }[] = [
  { value: "applied", label: "Applied", tone: "neutral" },
  { value: "shortlisted", label: "Shortlisted", tone: "info" },
  { value: "interview", label: "Interview", tone: "gold" },
  { value: "offer", label: "Offer", tone: "brand" },
  { value: "hired", label: "Hired", tone: "brand" },
  { value: "rejected", label: "Not selected", tone: "danger" },
  { value: "withdrawn", label: "Withdrawn", tone: "neutral" },
];

export const JOB_STATUS_META: Record<JobStatus, { label: string; tone: "neutral" | "brand" | "gold" | "danger" | "warning" | "info" }> = {
  draft: { label: "Draft", tone: "neutral" },
  under_review: { label: "Under review", tone: "warning" },
  active: { label: "Active", tone: "brand" },
  filled: { label: "Filled", tone: "info" },
  closed: { label: "Closed", tone: "neutral" },
  expired: { label: "Expired", tone: "neutral" },
  suspended: { label: "Suspended", tone: "danger" },
};

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super admin",
  admin: "Admin",
  recruitment_manager: "Recruitment manager",
  hr_manager: "HR manager",
  employer: "Employer",
  job_seeker: "Job seeker",
};

export function labelFor<T extends { value: string; label: string }>(list: readonly T[], value?: string | null) {
  return list.find((i) => i.value === value)?.label ?? null;
}

export const isAdminRole = (role?: UserRole | null) => role === "super_admin" || role === "admin";
export const isEmployerRole = (role?: UserRole | null) =>
  role === "employer" || role === "hr_manager" || role === "recruitment_manager";
export const isSeekerRole = (role?: UserRole | null) => role === "job_seeker";

/** Skills are stored as a JSON array in a text column; tolerate comma lists too. */
export function parseSkills(raw?: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {
    /* fall through */
  }
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function serializeSkills(raw?: string | null): string | null {
  const list = parseSkills(raw);
  return list.length ? JSON.stringify(list.slice(0, 25)) : null;
}

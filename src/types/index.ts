export type UserRole =
  | "super_admin"
  | "admin"
  | "recruitment_manager"
  | "hr_manager"
  | "employer"
  | "job_seeker";

export type JobStatus =
  | "draft"
  | "under_review"
  | "active"
  | "filled"
  | "closed"
  | "expired"
  | "suspended";

export type ApplicationStatus =
  | "applied"
  | "shortlisted"
  | "interview"
  | "offer"
  | "hired"
  | "rejected"
  | "withdrawn";

export type Locale = "en" | "ar";

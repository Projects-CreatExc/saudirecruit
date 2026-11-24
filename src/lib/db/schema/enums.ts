import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "super_admin",
  "admin",
  "recruitment_manager",
  "hr_manager",
  "employer",
  "job_seeker",
]);

export const jobStatusEnum = pgEnum("job_status", [
  "draft",
  "under_review",
  "active",
  "filled",
  "closed",
  "expired",
  "suspended",
]);

export const applicationStatusEnum = pgEnum("application_status", [
  "applied",
  "shortlisted",
  "interview",
  "offer",
  "hired",
  "rejected",
  "withdrawn",
]);

export const experienceLevelEnum = pgEnum("experience_level", [
  "entry",
  "mid",
  "senior",
  "lead",
  "executive",
]);

export const jobTypeEnum = pgEnum("job_type", [
  "full_time",
  "part_time",
  "contract",
  "temporary",
  "internship",
]);

export const genderEnum = pgEnum("gender", [
  "male",
  "female",
  "not_specified",
]);

export const visaStatusEnum = pgEnum("visa_status", [
  "citizen",
  "resident",
  "work_visa",
  "visit_visa",
  "transferable",
  "not_specified",
]);

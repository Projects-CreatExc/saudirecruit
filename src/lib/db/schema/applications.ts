import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { jobs } from "./jobs";
import { users } from "./users";
import { applicationStatusEnum } from "./enums";

export const applications = pgTable(
  "applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id),
    applicantId: uuid("applicant_id")
      .notNull()
      .references(() => users.id),
    status: applicationStatusEnum("status").notNull().default("applied"),
    coverLetter: text("cover_letter"),
    resumeUrl: text("resume_url"),
    matchScore: integer("match_score"), // AI-calculated 0-100
    notes: text("notes"), // Internal recruiter notes
    reviewedById: uuid("reviewed_by_id").references(() => users.id),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("idx_applications_unique").on(table.jobId, table.applicantId),
    index("idx_applications_job").on(table.jobId),
    index("idx_applications_applicant").on(table.applicantId),
    index("idx_applications_status").on(table.status),
  ]
);

export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;

import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  date,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { experienceLevelEnum, genderEnum, visaStatusEnum } from "./enums";

export const jobSeekerProfiles = pgTable(
  "job_seeker_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id),

    // Personal
    headline: varchar("headline", { length: 255 }),
    headlineAr: varchar("headline_ar", { length: 255 }),
    summary: text("summary"),
    summaryAr: text("summary_ar"),
    dateOfBirth: date("date_of_birth"),
    gender: genderEnum("gender").default("not_specified"),
    nationality: varchar("nationality", { length: 100 }),
    currentCity: varchar("current_city", { length: 100 }),
    currentCountry: varchar("current_country", { length: 100 }),

    // Professional
    experienceLevel: experienceLevelEnum("experience_level"),
    totalExperienceYears: integer("total_experience_years"),
    currentJobTitle: varchar("current_job_title", { length: 255 }),
    desiredJobTitle: varchar("desired_job_title", { length: 255 }),
    desiredSalary: integer("desired_salary"),
    skills: text("skills"), // JSON array
    languages: text("languages"), // JSON array

    // Saudi-specific
    visaStatus: visaStatusEnum("visa_status").default("not_specified"),

    // Documents
    resumeUrl: text("resume_url"),
    resumeUpdatedAt: timestamp("resume_updated_at", { withTimezone: true }),

    // Settings
    isOpenToWork: boolean("is_open_to_work").notNull().default(true),
    isProfilePublic: boolean("is_profile_public").notNull().default(true),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_profiles_user").on(table.userId),
    index("idx_profiles_experience").on(table.experienceLevel),
    index("idx_profiles_open").on(table.isOpenToWork),
  ]
);

export type JobSeekerProfile = typeof jobSeekerProfiles.$inferSelect;
export type NewJobSeekerProfile = typeof jobSeekerProfiles.$inferInsert;

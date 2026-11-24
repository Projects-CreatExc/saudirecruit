import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  decimal,
  index,
} from "drizzle-orm/pg-core";
import { companies } from "./companies";
import { users } from "./users";
import {
  jobStatusEnum,
  experienceLevelEnum,
  jobTypeEnum,
  genderEnum,
  visaStatusEnum,
} from "./enums";

export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    titleAr: varchar("title_ar", { length: 255 }),
    slug: varchar("slug", { length: 300 }).notNull().unique(),
    description: text("description").notNull(),
    descriptionAr: text("description_ar"),
    requirements: text("requirements"),
    requirementsAr: text("requirements_ar"),
    benefits: text("benefits"),
    benefitsAr: text("benefits_ar"),

    // Company & poster
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id),
    postedById: uuid("posted_by_id")
      .notNull()
      .references(() => users.id),

    // Job details
    jobType: jobTypeEnum("job_type").notNull().default("full_time"),
    experienceLevel: experienceLevelEnum("experience_level"),
    category: varchar("category", { length: 100 }),
    skills: text("skills"), // JSON array stored as text
    city: varchar("city", { length: 100 }),
    country: varchar("country", { length: 100 }).default("Saudi Arabia"),
    isRemote: boolean("is_remote").notNull().default(false),

    // Salary
    salaryMin: decimal("salary_min", { precision: 12, scale: 2 }),
    salaryMax: decimal("salary_max", { precision: 12, scale: 2 }),
    salaryCurrency: varchar("salary_currency", { length: 3 }).default("SAR"),
    isSalaryHidden: boolean("is_salary_hidden").notNull().default(false),

    // Saudi-specific
    genderPreference: genderEnum("gender_preference").default("not_specified"),
    visaRequirement: visaStatusEnum("visa_requirement").default("not_specified"),
    saudizationApplicable: boolean("saudization_applicable")
      .notNull()
      .default(false),

    // Status & dates
    status: jobStatusEnum("status").notNull().default("draft"),
    applicationCount: integer("application_count").notNull().default(0),
    viewCount: integer("view_count").notNull().default(0),
    isFeatured: boolean("is_featured").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_jobs_slug").on(table.slug),
    index("idx_jobs_company").on(table.companyId),
    index("idx_jobs_status").on(table.status),
    index("idx_jobs_category").on(table.category),
    index("idx_jobs_city").on(table.city),
    index("idx_jobs_type").on(table.jobType),
    index("idx_jobs_featured").on(table.isFeatured),
    index("idx_jobs_published").on(table.publishedAt),
  ]
);

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;

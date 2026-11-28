import { boolean, customType, index, integer, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { jobs } from "./jobs";
import { users } from "./users";

/*
 * Agency-managed data: requests sent from the public website (no account
 * needed) and the admin's private talent pool. Status/type columns are
 * varchar with app-level validation so the tables can be created with
 * plain, re-runnable SQL (see scripts/db-update.mjs).
 */

const bytea = customType<{ data: Buffer; driverData: string | Buffer }>({
  dataType() {
    return "bytea";
  },
  toDriver(value) {
    return `\\x${value.toString("hex")}`;
  },
  fromDriver(value) {
    const v: unknown = value;
    if (Buffer.isBuffer(v)) return v;
    if (v instanceof Uint8Array) return Buffer.from(v);
    const s = String(v);
    return s.startsWith("\\x") ? Buffer.from(s.slice(2), "hex") : Buffer.from(s, "binary");
  },
});

/** Files sent without an account (CVs from request forms, company job descriptions). Admin-only downloads. */
export const attachments = pgTable("attachments", {
  id: uuid("id").defaultRandom().primaryKey(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 120 }).notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  data: bytea("data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const INQUIRY_TYPES = ["candidate", "company", "application"] as const;
export const INQUIRY_STATUSES = ["new", "in_review", "contacted", "converted", "archived"] as const;
export type InquiryType = (typeof INQUIRY_TYPES)[number];
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

/** Everything visitors send in: CV submissions, hiring requests, and guest job applications. */
export const inquiries = pgTable(
  "inquiries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    type: varchar("type", { length: 20 }).$type<InquiryType>().notNull(),
    status: varchar("status", { length: 20 }).$type<InquiryStatus>().notNull().default("new"),
    fullName: varchar("full_name", { length: 200 }).notNull(),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 30 }),
    companyName: varchar("company_name", { length: 255 }),
    city: varchar("city", { length: 100 }),
    industry: varchar("industry", { length: 100 }),
    headline: varchar("headline", { length: 255 }),
    experienceYears: integer("experience_years"),
    skills: text("skills"), // JSON array
    message: text("message"),
    roles: text("roles"), // JSON: [{ title, count, salary, notes }]
    jobId: uuid("job_id").references(() => jobs.id),
    attachmentId: uuid("attachment_id").references(() => attachments.id),
    consent: boolean("consent").notNull().default(false),
    ipHash: varchar("ip_hash", { length: 64 }),
    adminNotes: text("admin_notes"),
    candidateId: uuid("candidate_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_inquiries_type_status").on(t.type, t.status), index("idx_inquiries_created").on(t.createdAt)],
);

export const CANDIDATE_STATUSES = ["active", "shortlisted", "placed", "archived"] as const;
export type CandidateStatus = (typeof CANDIDATE_STATUSES)[number];

/** The agency's private talent pool, managed only by admins. Never shown publicly. */
export const candidates = pgTable(
  "candidates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: varchar("full_name", { length: 200 }).notNull(),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 30 }),
    city: varchar("city", { length: 100 }),
    nationality: varchar("nationality", { length: 100 }),
    headline: varchar("headline", { length: 255 }),
    experienceYears: integer("experience_years"),
    visaStatus: varchar("visa_status", { length: 40 }),
    skills: text("skills"), // JSON array
    tags: text("tags"), // JSON array
    notes: text("notes"),
    attachmentId: uuid("attachment_id").references(() => attachments.id),
    status: varchar("status", { length: 20 }).$type<CandidateStatus>().notNull().default("active"),
    source: varchar("source", { length: 20 }).notNull().default("manual"),
    createdById: uuid("created_by_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_candidates_status").on(t.status), index("idx_candidates_created").on(t.createdAt)],
);

/** Small key/value store for settings the admin edits (WhatsApp number, contact email). */
export const siteSettings = pgTable("site_settings", {
  key: varchar("key", { length: 64 }).primaryKey(),
  value: text("value"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

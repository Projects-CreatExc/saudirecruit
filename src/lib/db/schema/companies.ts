import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const companies = pgTable(
  "companies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    nameAr: varchar("name_ar", { length: 255 }),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    descriptionAr: text("description_ar"),
    industry: varchar("industry", { length: 100 }),
    website: varchar("website", { length: 500 }),
    logoUrl: text("logo_url"),
    coverUrl: text("cover_url"),
    city: varchar("city", { length: 100 }),
    country: varchar("country", { length: 100 }).default("Saudi Arabia"),
    employeeCount: integer("employee_count"),
    foundedYear: integer("founded_year"),
    crNumber: varchar("cr_number", { length: 50 }), // Saudi Commercial Registration
    isVerified: boolean("is_verified").notNull().default(false),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_companies_slug").on(table.slug),
    index("idx_companies_owner").on(table.ownerId),
    index("idx_companies_industry").on(table.industry),
  ]
);

export type Company = typeof companies.$inferSelect;
export type NewCompany = typeof companies.$inferInsert;

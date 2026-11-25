import { customType, index, integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";

/** Postgres bytea. Sent as a "\x…" hex literal so it works with the Neon HTTP driver. */
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

/**
 * Uploaded CV files. Stored in Postgres so no extra storage service is needed.
 * Old versions are kept only while an application still points at them.
 */
export const resumeFiles = pgTable(
  "resume_files",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 120 }).notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    data: bytea("data").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_resume_files_user").on(table.userId)],
);

export type ResumeFile = typeof resumeFiles.$inferSelect;

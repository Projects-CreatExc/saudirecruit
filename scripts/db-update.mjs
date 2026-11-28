// Brings the database up to date with the current code. Safe to run any number
// of times: every step checks first and skips what already exists.
//
//   npm run db:update
//
// Matches the Drizzle schema in src/lib/db/schema exactly, so a later
// `npm run db:push` sees no difference.

import { readFileSync, existsSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing. Add it to .env.local.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const run = (q) => sql.query(q);
const fk = (table, name, def) =>
  run(`DO $$ BEGIN ALTER TABLE "${table}" ADD CONSTRAINT "${name}" ${def}; EXCEPTION WHEN duplicate_object THEN NULL; END $$`);

const steps = [
  ["CV storage (resume_files)", async () => {
    await run(`CREATE TABLE IF NOT EXISTS "resume_files" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid NOT NULL,
      "file_name" varchar(255) NOT NULL,
      "mime_type" varchar(120) NOT NULL,
      "size_bytes" integer NOT NULL,
      "data" bytea NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL)`);
    await fk("resume_files", "resume_files_user_id_users_id_fk",
      `FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action`);
    await run(`CREATE INDEX IF NOT EXISTS "idx_resume_files_user" ON "resume_files" USING btree ("user_id")`);
  }],
  ["Job tags", async () => {
    await run(`ALTER TABLE "jobs" ADD COLUMN IF NOT EXISTS "tags" text`);
  }],
  ["Uploaded files (attachments)", async () => {
    await run(`CREATE TABLE IF NOT EXISTS "attachments" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "file_name" varchar(255) NOT NULL,
      "mime_type" varchar(120) NOT NULL,
      "size_bytes" integer NOT NULL,
      "data" bytea NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL)`);
  }],
  ["Requests inbox (inquiries)", async () => {
    await run(`CREATE TABLE IF NOT EXISTS "inquiries" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "type" varchar(20) NOT NULL,
      "status" varchar(20) DEFAULT 'new' NOT NULL,
      "full_name" varchar(200) NOT NULL,
      "email" varchar(255),
      "phone" varchar(30),
      "company_name" varchar(255),
      "city" varchar(100),
      "industry" varchar(100),
      "headline" varchar(255),
      "experience_years" integer,
      "skills" text,
      "message" text,
      "roles" text,
      "job_id" uuid,
      "attachment_id" uuid,
      "consent" boolean DEFAULT false NOT NULL,
      "ip_hash" varchar(64),
      "admin_notes" text,
      "candidate_id" uuid,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL)`);
    await fk("inquiries", "inquiries_job_id_jobs_id_fk",
      `FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action`);
    await fk("inquiries", "inquiries_attachment_id_attachments_id_fk",
      `FOREIGN KEY ("attachment_id") REFERENCES "public"."attachments"("id") ON DELETE no action ON UPDATE no action`);
    await run(`CREATE INDEX IF NOT EXISTS "idx_inquiries_type_status" ON "inquiries" USING btree ("type","status")`);
    await run(`CREATE INDEX IF NOT EXISTS "idx_inquiries_created" ON "inquiries" USING btree ("created_at")`);
  }],
  ["Talent pool (candidates)", async () => {
    await run(`CREATE TABLE IF NOT EXISTS "candidates" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "full_name" varchar(200) NOT NULL,
      "email" varchar(255),
      "phone" varchar(30),
      "city" varchar(100),
      "nationality" varchar(100),
      "headline" varchar(255),
      "experience_years" integer,
      "visa_status" varchar(40),
      "skills" text,
      "tags" text,
      "notes" text,
      "attachment_id" uuid,
      "status" varchar(20) DEFAULT 'active' NOT NULL,
      "source" varchar(20) DEFAULT 'manual' NOT NULL,
      "created_by_id" uuid,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL)`);
    await fk("candidates", "candidates_attachment_id_attachments_id_fk",
      `FOREIGN KEY ("attachment_id") REFERENCES "public"."attachments"("id") ON DELETE no action ON UPDATE no action`);
    await fk("candidates", "candidates_created_by_id_users_id_fk",
      `FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action`);
    await run(`CREATE INDEX IF NOT EXISTS "idx_candidates_status" ON "candidates" USING btree ("status")`);
    await run(`CREATE INDEX IF NOT EXISTS "idx_candidates_created" ON "candidates" USING btree ("created_at")`);
  }],
  ["Site settings", async () => {
    await run(`CREATE TABLE IF NOT EXISTS "site_settings" (
      "key" varchar(64) PRIMARY KEY NOT NULL,
      "value" text,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL)`);
  }],
];

for (const [label, step] of steps) {
  await step();
  console.log(`  ✓ ${label}`);
}
console.log("Database is up to date.");

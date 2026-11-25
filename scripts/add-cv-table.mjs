// One-time setup: creates the resume_files table used for CV uploads.
// Safe to run more than once. Matches src/lib/db/schema/resumes.ts exactly,
// so a later `npm run db:push` sees no difference.
//
//   npm run db:add-cv-table

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
await sql.query(`CREATE TABLE IF NOT EXISTS "resume_files" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "file_name" varchar(255) NOT NULL,
  "mime_type" varchar(120) NOT NULL,
  "size_bytes" integer NOT NULL,
  "data" bytea NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
)`);
await sql.query(`DO $$ BEGIN
  ALTER TABLE "resume_files" ADD CONSTRAINT "resume_files_user_id_users_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$`);
await sql.query(`CREATE INDEX IF NOT EXISTS "idx_resume_files_user" ON "resume_files" USING btree ("user_id")`);
console.log("CV storage is ready.");

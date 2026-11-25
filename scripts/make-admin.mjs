// Promote an existing account to admin.
//
//   npm run make-admin -- you@example.com
//   npm run make-admin -- you@example.com super_admin
//
// Register the account on the website first, then run this once.

import { readFileSync, existsSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const [email, role = "admin"] = process.argv.slice(2);
if (!email || !["admin", "super_admin"].includes(role)) {
  console.error("Usage: npm run make-admin -- you@example.com [admin|super_admin]");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing. Add it to .env.local.");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const rows = await sql.query(
  "update users set role = $1, is_active = true, updated_at = now() where email = $2 returning email, role",
  [role, email.trim().toLowerCase()],
);
if (!rows.length) {
  console.error(`No account found for ${email}. Register on the website first, then run this again.`);
  process.exit(1);
}
console.log(`${rows[0].email} is now ${rows[0].role}. Log out and back in, then open /dashboard.`);

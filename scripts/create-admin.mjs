// Create (or reset) the admin account with a fresh temporary password.
//
//   npm run create-admin -- you@example.com
//
// The password is generated on YOUR computer and printed only in your terminal.
// Log in with it, then change it under Settings > Password.
// If the account already exists, it becomes admin and gets the new password.

import { readFileSync, existsSync } from "node:fs";
import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";

for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const email = (process.argv[2] ?? "").trim().toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("Usage: npm run create-admin -- you@example.com");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing. Add it to .env.local.");
  process.exit(1);
}

// Readable but strong: no look-alike characters; always has upper, lower and a digit.
const pick = (set) => set[randomInt(set.length)];
const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const lower = "abcdefghijkmnpqrstuvwxyz";
const digit = "23456789";
const all = upper + lower + digit;
const chars = [pick(upper), pick(lower), pick(digit), ...Array.from({ length: 11 }, () => pick(all))];
for (let i = chars.length - 1; i > 0; i--) {
  const j = randomInt(i + 1);
  [chars[i], chars[j]] = [chars[j], chars[i]];
}
const password = chars.join("");
const hash = await bcrypt.hash(password, 12);

const sql = neon(process.env.DATABASE_URL);
const rows = await sql.query(
  `insert into users (email, password_hash, first_name, last_name, role, is_active, is_verified)
   values ($1, $2, 'Admin', 'SaudiRecruit', 'admin', true, true)
   on conflict (email) do update
     set password_hash = excluded.password_hash, role = 'admin', is_active = true, deleted_at = null, updated_at = now()
   returning email, (xmax = 0) as created`,
  [email, hash],
);

console.log("");
console.log(rows[0].created ? "Admin account created." : "Existing account is now admin and has a new password.");
console.log(`  Email:    ${rows[0].email}`);
console.log(`  Password: ${password}`);
console.log("");
console.log("Log in at /login, then change this password under Settings.");

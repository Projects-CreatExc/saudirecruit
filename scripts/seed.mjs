// Sample data for SaudiRecruit (fictional companies and jobs).
//
//   npm run db:seed          add sample data (safe to run more than once)
//   npm run db:seed:reset    remove ALL sample data again
//
// Reads DATABASE_URL from .env.local or .env. Every sample account uses an
// @sample.saudirecruit.dev email, is inactive and cannot log in.

import { readFileSync, existsSync } from "node:fs";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";

for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing. Add it to .env.local (copy it from your Neon dashboard).");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const q = (text, params = []) => sql.query(text, params);
const DOMAIN = "sample.saudirecruit.dev";

if (process.argv.includes("--reset")) {
  const owners = `select id from users where email like '%@${DOMAIN}'`;
  const comps = `select id from companies where owner_id in (${owners})`;
  const jobsQ = `select id from jobs where company_id in (${comps})`;
  await q(`delete from applications where job_id in (${jobsQ})`);
  await q(`delete from jobs where company_id in (${comps})`);
  await q(`delete from companies where owner_id in (${owners})`);
  await q(`delete from users where email like '%@${DOMAIN}'`);
  console.log("Sample data removed.");
  process.exit(0);
}

const companies = [
  { key: "najd", name: "Najd Build & Infrastructure", industry: "Construction", city: "Riyadh", size: 1200, founded: 2004, verified: true,
    about: "Najd Build delivers commercial towers, hospitals and transport infrastructure across the Central Region, with more than 60 completed projects." },
  { key: "rawdah", name: "Rawdah Health Group", industry: "Healthcare", city: "Jeddah", size: 3400, founded: 1998, verified: true,
    about: "A network of four hospitals and twelve clinics on the Red Sea coast, known for cardiac care and nurse-led patient programmes." },
  { key: "tamkeen", name: "Tamkeen Digital", industry: "Technology", city: "Riyadh", size: 180, founded: 2019, verified: true,
    about: "Tamkeen builds payments and government-services platforms used by millions of people in the Kingdom. Product-led, remote-friendly, fast-moving." },
  { key: "sahel", name: "Sahel Energy Services", industry: "Energy", city: "Dhahran", size: 850, founded: 2008, verified: false,
    about: "Engineering and maintenance services for upstream and downstream energy facilities in the Eastern Province." },
  { key: "qimam", name: "Qimam Capital Partners", industry: "Finance", city: "Riyadh", size: 95, founded: 2016, verified: true,
    about: "A CMA-licensed investment firm focused on growth equity in Saudi consumer, healthcare and technology companies." },
  { key: "wadi", name: "Wadi Logistics", industry: "Operations", city: "Dammam", size: 620, founded: 2011, verified: false,
    about: "Warehousing, last-mile delivery and fleet services connecting King Abdulaziz Port to retailers across the GCC." },
  { key: "saraab", name: "Saraab Hospitality", industry: "Hospitality", city: "Jeddah", size: 400, founded: 2020, verified: true,
    about: "Boutique hotels and resorts on the Red Sea coast and in NEOM, designed around local craft and slow travel." },
  { key: "manara", name: "Manara Learning", industry: "Education", city: "Medina", size: 140, founded: 2017, verified: false,
    about: "Bilingual K-12 schools and online courses helping students in the Kingdom learn English, STEM and the arts." },
  { key: "bayan", name: "Bayan Legal Advisory", industry: "Legal", city: "Riyadh", size: 60, founded: 2013, verified: true,
    about: "Corporate, employment and regulatory law for companies investing in and expanding within Saudi Arabia." },
];

// [title, company, category, type, level, city, remote, min, max, featured, saudization, visa, skills, hideSalary]
const jobs = [
  ["Senior Civil Engineer", "najd", "Engineering", "full_time", "senior", "Riyadh", false, 18000, 26000, true, false, "transferable", ["AutoCAD", "Primavera P6", "Structural design"]],
  ["Site HSE Manager", "najd", "Construction", "full_time", "lead", "Riyadh", false, 22000, 30000, false, false, "work_visa", ["NEBOSH", "Risk assessment", "Site audits"]],
  ["Quantity Surveyor", "najd", "Construction", "contract", "mid", "Jeddah", false, 12000, 16000, false, false, "not_specified", ["Cost estimation", "CostX", "FIDIC"]],
  ["HR Business Partner", "najd", "Human Resources", "full_time", "senior", "Riyadh", false, 15000, 20000, false, true, "citizen", ["Employee relations", "Saudi Labor Law", "Workforce planning"]],
  ["Registered Nurse, ICU", "rawdah", "Healthcare", "full_time", "mid", "Jeddah", false, 11000, 15000, true, false, "work_visa", ["BLS", "ACLS", "Critical care"]],
  ["Consultant Cardiologist", "rawdah", "Healthcare", "full_time", "executive", "Jeddah", false, 55000, 75000, false, false, "work_visa", ["Interventional cardiology", "SCFHS licence"]],
  ["Patient Services Coordinator", "rawdah", "Healthcare", "part_time", "entry", "Jeddah", false, 4500, 6000, false, true, "citizen", ["Arabic and English", "Customer service"]],
  ["Senior Frontend Engineer", "tamkeen", "Technology", "full_time", "senior", "Riyadh", true, 20000, 28000, true, false, "not_specified", ["React", "TypeScript", "Next.js"]],
  ["Product Designer", "tamkeen", "Technology", "full_time", "mid", "Riyadh", true, 14000, 20000, false, false, "not_specified", ["Figma", "Design systems", "User research"]],
  ["Data Analyst", "tamkeen", "Technology", "full_time", "mid", "Riyadh", false, 12000, 17000, false, true, "citizen", ["SQL", "Power BI", "Python"]],
  ["Cloud DevOps Engineer", "tamkeen", "Technology", "contract", "senior", "Riyadh", true, 22000, 30000, false, false, "transferable", ["AWS", "Kubernetes", "Terraform"]],
  ["Process Engineer", "sahel", "Energy", "full_time", "senior", "Dhahran", false, 24000, 32000, true, false, "transferable", ["Aspen HYSYS", "Process safety", "P&IDs"]],
  ["Graduate Mechanical Engineer", "sahel", "Energy", "full_time", "entry", "Jubail", false, 7000, 9000, false, true, "citizen", ["SolidWorks", "Maintenance planning"]],
  ["Investment Analyst", "qimam", "Finance", "full_time", "mid", "Riyadh", false, 16000, 22000, false, true, "citizen", ["Financial modelling", "Valuation", "CFA Level II"]],
  ["Compliance Officer", "qimam", "Finance", "full_time", "senior", "Riyadh", false, 18000, 24000, false, false, "resident", ["AML", "CMA regulations", "KYC"], true],
  ["Fleet Operations Supervisor", "wadi", "Operations", "full_time", "mid", "Dammam", false, 9000, 12000, false, false, "transferable", ["Fleet management", "SAP", "Route planning"]],
  ["Warehouse Associate", "wadi", "Operations", "temporary", "entry", "Dammam", false, 4000, 5000, false, false, "transferable", ["Forklift licence", "Inventory"]],
  ["Key Account Manager", "wadi", "Sales & Marketing", "full_time", "senior", "Riyadh", false, 14000, 19000, false, false, "not_specified", ["B2B sales", "Negotiation", "CRM"]],
  ["Front Office Manager", "saraab", "Hospitality", "full_time", "senior", "Jeddah", false, 13000, 18000, false, false, "work_visa", ["Opera PMS", "Guest relations", "Team leadership"]],
  ["Executive Chef", "saraab", "Hospitality", "full_time", "lead", "NEOM", false, 20000, 28000, true, false, "work_visa", ["Menu development", "HACCP", "Kitchen operations"]],
  ["English Language Teacher", "manara", "Education", "full_time", "mid", "Medina", false, 9000, 12000, false, false, "work_visa", ["CELTA", "Classroom management"]],
  ["Curriculum Designer", "manara", "Education", "contract", "senior", "Medina", true, 12000, 16000, false, false, "not_specified", ["Instructional design", "Bilingual content"]],
  ["Corporate Associate Lawyer", "bayan", "Legal", "full_time", "senior", "Riyadh", false, 25000, 35000, true, true, "citizen", ["M&A", "Arabic and English drafting", "Saudi Companies Law"]],
];

const benefits = [
  "Housing allowance (25% of basic salary)",
  "Transport allowance",
  "Medical insurance for you and your family",
  "Annual return flights",
  "30 days annual leave",
  "End-of-service benefits",
].join("\n");

const slugify = (t) => t.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/^-+|-+$/g, "");

const ids = {};
for (const c of companies) {
  const email = `talent.${c.key}@${DOMAIN}`;
  const hash = await bcrypt.hash(randomUUID(), 10);
  await q(
    `insert into users (email, password_hash, first_name, last_name, role, is_active, is_verified)
     values ($1, $2, 'Talent', 'Team', 'employer', false, true) on conflict (email) do nothing`,
    [email, hash],
  );
  const [owner] = await q(`select id from users where email = $1`, [email]);
  const slug = `${slugify(c.name)}-sample`;
  await q(
    `insert into companies (name, slug, description, industry, city, employee_count, founded_year, is_verified, owner_id)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9) on conflict (slug) do nothing`,
    [c.name, slug, c.about, c.industry, c.city, c.size, c.founded, c.verified, owner.id],
  );
  const [company] = await q(`select id from companies where slug = $1`, [slug]);
  ids[c.key] = { company: company.id, owner: owner.id, name: c.name };
}

let added = 0;
for (const [i, j] of jobs.entries()) {
  const [title, key, category, type, level, city, remote, min, max, featured, saudi, visa, skills, hide = false] = j;
  const c = ids[key];
  const slug = `${slugify(title)}-${key}-sample`;
  const description = [
    `${c.name} is hiring a ${title} to join the team in ${city}${remote ? " (remote friendly)" : ""}.`,
    "",
    `You'll work with a supportive, high-standards team on projects that matter to the Kingdom's growth. This role reports to the department lead and has clear goals for your first 90 days.`,
    "",
    "What you'll do:",
    `• Own day-to-day ${category.toLowerCase()} work and deliver to agreed timelines`,
    "• Collaborate with colleagues across departments and with external partners",
    "• Bring structure, quality and clear communication to everything you touch",
  ].join("\n");
  const requirements = [
    `• ${{ entry: "0-2", mid: "3-5", senior: "6-10", lead: "8+", executive: "12+" }[level]} years of relevant experience`,
    ...skills.map((s) => `• ${s}`),
    "• Fluent English; Arabic is a plus",
  ].join("\n");

  const res = await q(
    `insert into jobs (title, slug, description, requirements, benefits, company_id, posted_by_id, job_type, experience_level, category,
       skills, city, is_remote, salary_min, salary_max, is_salary_hidden, is_featured, saudization_applicable, visa_requirement,
       status, published_at, view_count)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,'active', now() - ($20 || ' hours')::interval, $21)
     on conflict (slug) do nothing returning id`,
    [title, slug, description, requirements, benefits, c.company, c.owner, type, level, category, JSON.stringify(skills), city,
     remote, min, max, hide, featured, saudi, visa, String(i * 7 + 1), 40 + ((i * 37) % 260)],
  );
  added += res.length;
}

// Tags for filtering (added to existing sample jobs too, if they have none yet).
try {
  await q(`update jobs set tags = json_build_array(category, case when is_remote then 'Remote' end, case when saudization_applicable then 'Saudization' end, initcap(experience_level::text))::text
           where slug like '%-sample' and tags is null`);
  await q(`update jobs set tags = (select json_agg(x)::text from json_array_elements_text(tags::json) x where x is not null and x <> '') where slug like '%-sample'`);
} catch {
  console.log("(Run `npm run db:update` first to enable job tags.)");
}

console.log(`Sample data ready: ${companies.length} companies, ${added} new jobs (${jobs.length - added} already existed).`);

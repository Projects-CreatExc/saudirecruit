import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Building2, Search } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Button, LinkButton } from "@/components/ui/button";
import { Alert, Select } from "@/components/ui/field";
import { Avatar, Badge, Container, EmptyState } from "@/components/ui/misc";
import { CATEGORIES } from "@/lib/constants";
import { listCompanies } from "@/lib/data";

export const metadata: Metadata = {
  title: "Companies hiring in Saudi Arabia",
  description: "Discover employers hiring across Saudi Arabia and see their open roles.",
};

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

export default async function CompaniesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const raw = await searchParams;
  const q = one(raw.q);
  const industry = one(raw.industry);
  const res = await listCompanies(q, industry);

  return (
    <>
      <section className="hero-wash border-b border-line">
        <Container className="py-12 sm:py-16">
          <p className="eyebrow text-brand">Companies</p>
          <h1 className="display-lg mt-3">Teams hiring in the Kingdom.</h1>
          <form action="/companies" method="get" role="search" className="mt-8 flex max-w-3xl flex-col gap-2 sm:flex-row">
            <label className="flex h-12 flex-1 items-center gap-3 rounded-full border border-line bg-white px-4 shadow-[var(--shadow-card)] focus-within:border-ink">
              <Search className="size-[18px] text-muted" aria-hidden />
              <span className="sr-only">Company name</span>
              <input name="q" defaultValue={q} placeholder="Search companies" className="h-full w-full bg-transparent text-[15px] placeholder:text-subtle focus:outline-none" />
            </label>
            <Select name="industry" defaultValue={industry ?? ""} aria-label="Industry" className="h-12 rounded-full sm:w-56">
              <option value="">All industries</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Button type="submit" variant="dark" className="h-12 px-7">
              Search
            </Button>
          </form>
        </Container>
      </section>

      <Container className="py-10">
        {res.error ? (
          <Alert>{res.error}</Alert>
        ) : res.data.length === 0 ? (
          <EmptyState
            icon={<Building2 className="size-5" />}
            title={q || industry ? "No companies match your search" : "No companies yet"}
            description={q || industry ? "Try another name or industry." : "Be the first employer to set up a company profile on SaudiRecruit."}
            action={
              q || industry ? (
                <LinkButton href="/companies" variant="outline">
                  Clear search
                </LinkButton>
              ) : (
                <LinkButton href="/register?role=employer">Create a company profile</LinkButton>
              )
            }
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {res.data.map((c, i) => (
              <Reveal as="li" key={c.id} delay={(i % 3) * 70}>
                <Link
                  href={`/companies/${c.slug}`}
                  className="flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-white p-6 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[var(--shadow-card)]"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={c.name} src={c.logoUrl} size={44} square />
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 truncate font-semibold">
                        {c.name}
                        {c.isVerified && <BadgeCheck className="size-4 shrink-0 text-brand" aria-label="Verified" />}
                      </p>
                      <p className="truncate text-sm text-muted">
                        {[c.industry, c.employeeCount ? `${c.employeeCount.toLocaleString()} employees` : null].filter(Boolean).join(" · ") || "Saudi Arabia"}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 line-clamp-3 flex-1 text-sm leading-relaxed text-body">{c.description || "No description yet."}</p>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-sm text-muted">{c.city ?? ""}</span>
                    <Badge tone={c.openJobs > 0 ? "brand" : "neutral"}>
                      {c.openJobs} open {c.openJobs === 1 ? "role" : "roles"}
                    </Badge>
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}

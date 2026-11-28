import type { Metadata } from "next";
import Link from "next/link";
import { SearchX, SlidersHorizontal } from "lucide-react";
import { JobCard } from "@/components/jobs/job-card";
import { Reveal } from "@/components/motion/reveal";
import { SearchBar } from "@/components/jobs/search-bar";
import { Button, LinkButton } from "@/components/ui/button";
import { Checkbox, Label, Select, Alert } from "@/components/ui/field";
import { Container, EmptyState } from "@/components/ui/misc";
import { CATEGORIES, EXPERIENCE_LEVELS, JOB_TYPES } from "@/lib/constants";
import { PAGE_SIZE, searchJobs } from "@/lib/data";

export const metadata: Metadata = {
  title: "Jobs in Saudi Arabia",
  description: "Search open roles across Saudi Arabia and apply directly to hiring companies.",
};

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;

function Filters({ sp }: { sp: Record<string, string | undefined> }) {
  return (
    <form action="/jobs" method="get" className="space-y-5">
      {sp.q && <input type="hidden" name="q" value={sp.q} />}
      {sp.city && <input type="hidden" name="city" value={sp.city} />}
      {sp.tag && <input type="hidden" name="tag" value={sp.tag} />}
      <div>
        <Label htmlFor="f-category">Category</Label>
        <Select id="f-category" name="category" defaultValue={sp.category ?? ""}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="f-type">Job type</Label>
        <Select id="f-type" name="type" defaultValue={sp.type ?? ""}>
          <option value="">Any type</option>
          {JOB_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="f-level">Experience</Label>
        <Select id="f-level" name="level" defaultValue={sp.level ?? ""}>
          <option value="">Any level</option>
          {EXPERIENCE_LEVELS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
      </div>
      <Checkbox name="remote" value="1" defaultChecked={sp.remote === "1"} label="Remote only" />
      <div className="flex gap-2 pt-1">
        <Button type="submit" variant="dark" size="sm" className="flex-1">
          Apply filters
        </Button>
        <LinkButton href="/jobs" variant="ghost" size="sm">
          Reset
        </LinkButton>
      </div>
    </form>
  );
}

export default async function JobsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const raw = await searchParams;
  const sp = {
    q: one(raw.q),
    city: one(raw.city),
    type: one(raw.type),
    level: one(raw.level),
    category: one(raw.category),
    tag: one(raw.tag),
    remote: one(raw.remote),
    page: one(raw.page),
  };
  const page = Math.max(1, Number(sp.page) || 1);
  const res = await searchJobs({ ...sp, remote: sp.remote === "1", page });
  const total = res.data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const activeFilters = [sp.category, sp.type, sp.level, sp.remote, sp.tag].filter(Boolean).length;

  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    Object.entries({ ...sp, page: String(p) }).forEach(([k, v]) => v && params.set(k, v));
    return `/jobs?${params.toString()}`;
  };

  const heading = [sp.q, sp.category, sp.tag ? `#${sp.tag}` : null].filter(Boolean).join(" · ") || "All jobs";

  return (
    <>
      <section className="hero-wash border-b border-line">
        <Container className="py-12 sm:py-16">
          <p className="eyebrow text-brand">Jobs in Saudi Arabia</p>
          <h1 className="display-lg mt-3">Find what&apos;s next.</h1>
          <div className="mt-8 max-w-4xl">
            <SearchBar q={sp.q} city={sp.city} extra={{ category: sp.category, type: sp.type, level: sp.level, remote: sp.remote, tag: sp.tag }} />
          </div>
        </Container>
      </section>

      <Container className="grid gap-8 py-10 lg:grid-cols-[260px_1fr] lg:gap-12">
        <aside aria-label="Filters">
          <details className="group rounded-2xl border border-line p-4 lg:hidden" open={activeFilters > 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between text-[15px] font-semibold [&::-webkit-details-marker]:hidden">
              <span className="inline-flex items-center gap-2">
                <SlidersHorizontal className="size-4" /> Filters {activeFilters > 0 && `(${activeFilters})`}
              </span>
              <span className="text-sm font-normal text-muted group-open:hidden">Show</span>
              <span className="hidden text-sm font-normal text-muted group-open:inline">Hide</span>
            </summary>
            <div className="mt-5">
              <Filters sp={sp} />
            </div>
          </details>
          <div className="hidden lg:sticky lg:top-24 lg:block">
            <h2 className="mb-5 text-sm font-semibold">Filters</h2>
            <Filters sp={sp} />
          </div>
        </aside>

        <div>
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <h2 className="text-lg font-semibold tracking-[-0.015em]">{heading}</h2>
            {res.data && (
              <p className="shrink-0 text-sm text-muted">
                {total.toLocaleString()} {total === 1 ? "role" : "roles"}
                {sp.city ? ` in ${sp.city}` : ""}
              </p>
            )}
          </div>

          {res.error ? (
            <Alert>{res.error}</Alert>
          ) : res.data.rows.length === 0 ? (
            <EmptyState
              icon={<SearchX className="size-5" />}
              title="No roles match your search"
              description="Try a broader title, a different city, or clear some filters."
              action={
                <LinkButton href="/jobs" variant="outline">
                  Clear all filters
                </LinkButton>
              }
            />
          ) : (
            <div className="grid gap-3">
              {res.data.rows.map((job, i) => (
                <Reveal key={job.id} delay={Math.min(i, 6) * 60}>
                  <JobCard job={job} />
                </Reveal>
              ))}
            </div>
          )}

          {pages > 1 && (
            <nav aria-label="Pagination" className="mt-10 flex items-center justify-between gap-4">
              {page > 1 ? (
                <LinkButton href={pageHref(page - 1)} variant="outline" size="sm">
                  Previous
                </LinkButton>
              ) : (
                <span />
              )}
              <span className="text-sm text-muted">
                Page {page} of {pages}
              </span>
              {page < pages ? (
                <LinkButton href={pageHref(page + 1)} variant="outline" size="sm">
                  Next
                </LinkButton>
              ) : (
                <span />
              )}
            </nav>
          )}

          <p className="mt-10 text-sm text-muted">
            Hiring?{" "}
            <Link href="/register?role=employer" className="font-medium text-ink underline underline-offset-4">
              Post a role for free
            </Link>
          </p>
        </div>
      </Container>
    </>
  );
}

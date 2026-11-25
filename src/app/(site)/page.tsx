import Link from "next/link";
import { ArrowRight, Briefcase, Plus } from "lucide-react";
import { SearchBar } from "@/components/jobs/search-bar";
import { JobCard } from "@/components/jobs/job-card";
import { LinkButton } from "@/components/ui/button";
import { Container, EmptyState } from "@/components/ui/misc";
import { CATEGORIES } from "@/lib/constants";
import { getLatestJobs, getPlatformStats } from "@/lib/data";

export const dynamic = "force-dynamic";

const employerSteps = [
  {
    title: "Post roles in minutes",
    body: "Structured job posts with salary ranges in SAR, city, experience level and the skills that matter. Publish now or save as a draft.",
  },
  {
    title: "Review in one pipeline",
    body: "Every applicant lands in a single list. Move people from applied to shortlisted, interview, offer and hired without spreadsheets.",
  },
  {
    title: "Built for Saudi hiring",
    body: "Flag Saudization roles, state visa and Iqama requirements up front, and add your Commercial Registration to your company profile.",
  },
];

const candidateSteps = [
  { title: "Create one profile", body: "Your headline, experience, skills and visa status in one place, reused for every application." },
  { title: "Search real openings", body: "Filter by city, job type, level and remote work. Salaries are shown whenever employers publish them." },
  { title: "Apply directly", body: "Send your application straight to the hiring company with an optional note. No middlemen." },
  { title: "Track every step", body: "See exactly where each application stands, from applied to offer, and withdraw any time." },
];

const faqs = [
  {
    q: "Is SaudiRecruit free for job seekers?",
    a: "Yes. Creating a profile, searching roles and applying is free for candidates.",
  },
  {
    q: "Who can post jobs?",
    a: "Any employer account. Create your company profile first, then publish roles from your dashboard. Our team can suspend listings that break the posting guidelines.",
  },
  {
    q: "Do I need to live in Saudi Arabia to apply?",
    a: "No. Each role states its visa and residency requirements, so you can see whether a transferable Iqama, a work visa or Saudi citizenship is needed before you apply.",
  },
  {
    q: "What does the Saudization tag mean?",
    a: "It marks roles that count toward the employer's Nitaqat localisation targets and are typically open to Saudi nationals.",
  },
  {
    q: "Can I withdraw an application?",
    a: "Yes. Open Applications in your account and withdraw at any time. The employer will see it as withdrawn.",
  },
];

export default async function HomePage() {
  const [statsRes, jobsRes] = await Promise.all([getPlatformStats(), getLatestJobs(5)]);
  const stats = statsRes.data;
  const latest = jobsRes.data ?? [];
  const showStats = !!stats && stats.jobs + stats.companies > 0;

  return (
    <>
      {/* Hero */}
      <section className="hero-wash relative overflow-hidden">
        <Container className="pt-16 pb-20 text-center sm:pt-24 sm:pb-24">
          <p className="mx-auto inline-flex animate-fade-up items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 text-sm text-body shadow-[var(--shadow-card)]">
            <span className="size-1.5 rounded-full bg-brand" aria-hidden />
            Hiring across the Kingdom, in Riyadh, Jeddah, Dammam and beyond
          </p>
          <h1 className="display-xl mx-auto mt-8 max-w-5xl animate-fade-up text-balance [animation-delay:60ms]">
            Where Saudi talent meets
            <br />
            <em className="font-medium text-brand italic">ambitious employers.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-[640px] animate-fade-up text-lg leading-relaxed text-body [animation-delay:120ms] sm:text-xl sm:leading-[30px]">
            Search real openings and apply directly to hiring teams, or post roles and manage every applicant in one clean pipeline.
          </p>
          <div className="mx-auto mt-10 max-w-3xl animate-fade-up text-start [animation-delay:180ms]">
            <SearchBar />
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-2 text-sm">
            <span className="text-muted">Popular:</span>
            {["Engineering", "Healthcare", "Finance", "Technology"].map((c) => (
              <Link
                key={c}
                href={`/jobs?category=${encodeURIComponent(c)}`}
                className="rounded-full border border-line bg-white px-3 py-0.5 text-ink-soft transition-colors hover:border-ink hover:text-ink"
              >
                {c}
              </Link>
            ))}
          </div>

          {showStats && (
            <dl className="mx-auto mt-14 grid max-w-2xl grid-cols-3 divide-x divide-line rounded-2xl border border-line bg-white/80 py-5 rtl:divide-x-reverse">
              {[
                { label: "Open roles", value: stats.jobs },
                { label: "Companies", value: stats.companies },
                { label: "Candidates", value: stats.candidates },
              ].map((s) => (
                <div key={s.label} className="px-3">
                  <dt className="text-xs text-muted sm:text-sm">{s.label}</dt>
                  <dd className="mt-1 text-2xl font-medium tracking-[-0.03em] sm:text-3xl">{s.value.toLocaleString()}</dd>
                </div>
              ))}
            </dl>
          )}
        </Container>
      </section>

      {/* Dual audience */}
      <section aria-label="Choose your path">
        <Container className="grid gap-5 md:grid-cols-2">
          <Link
            href="/jobs"
            className="group relative flex min-h-[380px] flex-col overflow-hidden rounded-[var(--radius-panel)] bg-ink p-8 text-white transition-transform duration-300 hover:-translate-y-1 sm:p-10"
          >
            <p className="eyebrow text-[#7fd1ad]">For candidates</p>
            <h2 className="display-md mt-4">
              Find your <span className="text-[#7fd1ad] italic">next role.</span>
            </h2>
            <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-white/70">
              Apply directly to companies hiring across Saudi Arabia, with salaries and visa requirements stated up front.
            </p>
            <span className="mt-8 inline-flex h-12 w-fit items-center gap-2 rounded-full bg-white px-6 font-semibold text-ink transition-colors group-hover:bg-[#e8f3ee]">
              Browse jobs <ArrowRight className="size-4 rtl:rotate-180" />
            </span>
            <div aria-hidden className="pointer-events-none absolute -end-6 -bottom-8 hidden w-[58%] rotate-[-4deg] rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur lg:block">
              {[0, 1, 2].map((i) => (
                <div key={i} className="mb-2 flex items-center gap-3 rounded-xl bg-white/[0.06] p-3 last:mb-0">
                  <span className="size-8 rounded-lg bg-white/15" />
                  <span className="flex-1 space-y-1.5">
                    <span className="block h-2 w-3/4 rounded bg-white/30" />
                    <span className="block h-2 w-1/2 rounded bg-white/15" />
                  </span>
                  <span className="h-6 w-12 rounded-full bg-[#7fd1ad]/30" />
                </div>
              ))}
            </div>
          </Link>

          <Link
            href="/register?role=employer"
            className="group relative flex min-h-[380px] flex-col overflow-hidden rounded-[var(--radius-panel)] border border-brand/15 bg-brand-soft p-8 transition-transform duration-300 hover:-translate-y-1 sm:p-10"
          >
            <p className="eyebrow text-brand">For employers</p>
            <h2 className="display-md mt-4">
              Find your <span className="text-brand italic">next hire.</span>
            </h2>
            <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-body">
              Post roles, review applicants and move candidates through your pipeline from a single dashboard.
            </p>
            <span className="mt-8 inline-flex h-12 w-fit items-center gap-2 rounded-full bg-brand px-6 font-semibold text-white transition-colors group-hover:bg-brand-hover">
              Start hiring <ArrowRight className="size-4 rtl:rotate-180" />
            </span>
            <div aria-hidden className="pointer-events-none absolute -end-6 -bottom-8 hidden w-[58%] rotate-[3deg] rounded-2xl border border-brand/15 bg-white p-4 shadow-[var(--shadow-pop)] lg:block">
              <div className="mb-3 flex gap-1.5">
                {["Applied", "Shortlisted", "Interview"].map((s, i) => (
                  <span key={s} className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${i === 1 ? "bg-ink text-white" : "bg-surface-2 text-muted"}`}>
                    {s}
                  </span>
                ))}
              </div>
              {[0, 1].map((i) => (
                <div key={i} className="mb-2 flex items-center gap-3 rounded-xl border border-line p-3 last:mb-0">
                  <span className="size-8 rounded-full bg-surface-2" />
                  <span className="flex-1 space-y-1.5">
                    <span className="block h-2 w-2/3 rounded bg-line-strong" />
                    <span className="block h-2 w-1/2 rounded bg-line" />
                  </span>
                </div>
              ))}
            </div>
          </Link>
        </Container>
      </section>

      {/* Latest roles */}
      <section className="pt-24 sm:pt-32" aria-labelledby="latest-heading">
        <Container>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-brand">Live on SaudiRecruit</p>
              <h2 id="latest-heading" className="display-lg mt-3">
                Latest openings
              </h2>
            </div>
            <LinkButton href="/jobs" variant="outline">
              View all jobs <ArrowRight className="size-4 rtl:rotate-180" />
            </LinkButton>
          </div>
          {latest.length > 0 ? (
            <div className="grid gap-3">
              {latest.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Briefcase className="size-5" />}
              title={jobsRes.error ? "Openings are temporarily unavailable" : "The first roles are on their way"}
              description={
                jobsRes.error
                  ? "We couldn't load openings right now. Please refresh in a moment."
                  : "Employers are setting up their company profiles. Create your profile now so you're ready to apply the moment roles go live."
              }
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <LinkButton href="/register" variant="dark">
                    Create your profile
                  </LinkButton>
                  <LinkButton href="/register?role=employer" variant="outline">
                    <Plus className="size-4" /> Post a job
                  </LinkButton>
                </div>
              }
            />
          )}
        </Container>
      </section>

      {/* Employers */}
      <section id="employers" className="scroll-mt-24 pt-24 sm:pt-32">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="eyebrow text-brand">For employers</p>
              <h2 className="display-lg mt-3">Build the team that builds the Kingdom.</h2>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-body">
                Everything you need to go from open role to signed offer, designed around how hiring actually works in Saudi Arabia.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <LinkButton href="/register?role=employer" size="lg">
                  Start hiring <ArrowRight className="size-4 rtl:rotate-180" />
                </LinkButton>
                <LinkButton href="/login?callbackUrl=/dashboard/jobs/new" variant="outline" size="lg">
                  Post a job
                </LinkButton>
              </div>
            </div>
            <ol className="grid gap-4">
              {employerSteps.map((s, i) => (
                <li key={s.title} className="rounded-[var(--radius-card)] border border-line p-7 sm:p-8">
                  <span className="font-mono text-sm text-brand">0{i + 1}</span>
                  <h3 className="mt-4 text-xl font-semibold tracking-[-0.02em]">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-body">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* Candidates */}
      <section id="how-it-works" className="scroll-mt-24 pt-24 sm:pt-32">
        <Container>
          <div className="rounded-[var(--radius-panel)] bg-surface px-6 py-14 sm:px-12 sm:py-16">
            <div className="max-w-2xl">
              <p className="eyebrow text-brand">For candidates</p>
              <h2 className="display-lg mt-3">Find work that moves you forward.</h2>
            </div>
            <ol className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {candidateSteps.map((s, i) => (
                <li key={s.title} className="border-t border-line-strong pt-6">
                  <span className="font-mono text-sm text-muted">0{i + 1}</span>
                  <h3 className="mt-3 text-lg font-semibold tracking-[-0.015em]">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-body">{s.body}</p>
                </li>
              ))}
            </ol>
            <div className="mt-12 flex flex-wrap gap-3">
              <LinkButton href="/register" variant="dark" size="lg">
                Sign up for free <ArrowRight className="size-4 rtl:rotate-180" />
              </LinkButton>
              <LinkButton href="/jobs" variant="outline" size="lg">
                Browse jobs
              </LinkButton>
            </div>
          </div>
        </Container>
      </section>

      {/* Categories */}
      <section className="pt-24 sm:pt-32" aria-labelledby="cat-heading">
        <Container>
          <h2 id="cat-heading" className="display-md">
            Explore by category
          </h2>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {CATEGORIES.map((c) => (
              <li key={c}>
                <Link
                  href={`/jobs?category=${encodeURIComponent(c)}`}
                  className="group flex items-center justify-between rounded-2xl border border-line px-5 py-4 text-[15px] font-medium transition-colors hover:border-ink"
                >
                  {c}
                  <ArrowRight className="size-4 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-ink rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 pt-24 sm:pt-32">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <h2 className="display-lg">Common questions.</h2>
          <div className="divide-y divide-line border-y border-line">
            {faqs.map((f) => (
              <details key={f.q} className="group py-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-medium tracking-[-0.01em]">
                  {f.q}
                  <Plus className="size-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-45" aria-hidden />
                </summary>
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-body">{f.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      {/* Closing CTA */}
      <section className="pt-24 sm:pt-32">
        <Container>
          <div className="rounded-[var(--radius-panel)] bg-ink px-6 py-16 text-center text-white sm:px-12 sm:py-20">
            <h2 className="display-lg">What&apos;s your next move?</h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-white/70">Join as a candidate or start hiring today. It takes less than two minutes.</p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/register" className="inline-flex h-[52px] items-center justify-center gap-2 rounded-full bg-white px-6 font-semibold text-ink transition-colors hover:bg-brand-soft">
                Sign up to find a job <ArrowRight className="size-4 rtl:rotate-180" />
              </Link>
              <Link
                href="/register?role=employer"
                className="inline-flex h-[52px] items-center justify-center rounded-full border border-white/40 px-6 font-semibold text-white transition-colors hover:border-white hover:bg-white/5"
              >
                Start hiring
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

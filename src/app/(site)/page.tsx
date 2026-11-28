import Link from "next/link";
import { ArrowRight, Briefcase, Plus } from "lucide-react";
import { SearchBar } from "@/components/jobs/search-bar";
import { JobCard } from "@/components/jobs/job-card";
import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import { RotatingWords } from "@/components/motion/rotating-words";
import { SpotlightLink } from "@/components/motion/spotlight-link";
import { LinkButton } from "@/components/ui/button";
import { Avatar, Container, EmptyState } from "@/components/ui/misc";
import { CATEGORIES } from "@/lib/constants";
import { getLatestJobs, getPlatformStats, listCompanies } from "@/lib/data";
import { timeAgo } from "@/lib/utils";

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
  {
    title: "Create one profile",
    body: "Your headline, experience, skills and visa status in one place, reused for every application.",
  },
  {
    title: "Search real openings",
    body: "Filter by city, job type, level and remote work. Salaries are shown whenever employers publish them.",
  },
  {
    title: "Apply directly",
    body: "Send your application straight to the hiring company with an optional note. No middlemen.",
  },
  {
    title: "Track every step",
    body: "See exactly where each application stands, from applied to offer, and withdraw any time.",
  },
];

const faqs = [
  {
    q: "Do I need an account to apply?",
    a: "No. Send your CV once, or apply to any job with a short form. Our team contacts you when there's a match. A free account lets you track your applications yourself.",
  },
  {
    q: "How do companies hire through SaudiRecruit?",
    a: "Send us a hiring request with the roles you need, or attach a job description. Our recruiters announce the roles, screen candidates and send you a shortlist. You can also create an employer account and post jobs yourself.",
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
  const [statsRes, jobsRes, companiesRes] = await Promise.all([
    getPlatformStats(),
    getLatestJobs(6),
    listCompanies(),
  ]);
  const stats = statsRes.data;
  const latest = jobsRes.data ?? [];
  const showStats = !!stats && stats.jobs + stats.companies > 0;
  const companies = companiesRes.data ?? [];
  const headline = ["Where", "Saudi", "talent", "meets"];
  const chips = latest.slice(0, 3);
  const chipPos = [
    "start-[2.5%] top-[50%] rotate-[-3deg]",
    "end-[2.5%] top-[45%] rotate-[2deg]",
    "end-[5%] top-[70%] rotate-[-1deg]",
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="aurora" aria-hidden />
        {chips.map((j, i) => (
          <Link
            key={j.id}
            href={`/jobs/${j.slug}`}
            style={{ "--d": `${700 + i * 180}ms` } as React.CSSProperties}
            className={`float-chip border-line absolute z-10 hidden w-[230px] items-center gap-2.5 rounded-2xl border bg-white/90 py-2 ps-2 pe-3.5 text-start shadow-[var(--shadow-pop)] backdrop-blur transition-shadow hover:shadow-lg min-[1360px]:flex ${chipPos[i]}`}
          >
            <Avatar name={j.companyName} src={j.companyLogo} size={32} square />
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold">
                {j.title}
              </span>
              <span className="text-muted flex items-center gap-1.5 text-xs">
                <span
                  className="pulse-dot bg-brand text-brand size-1.5 rounded-full"
                  aria-hidden
                />
                <span className="truncate">
                  {j.companyName} ·{" "}
                  {timeAgo(
                    new Date(j.publishedAt ?? j.createdAt)
                  ).toLowerCase()}
                </span>
              </span>
            </span>
          </Link>
        ))}
        <Container className="relative pt-16 pb-20 text-center sm:pt-24 sm:pb-24">
          <p className="animate-fade-up border-line text-body mx-auto inline-flex items-center gap-2 rounded-full border bg-white px-3.5 py-1.5 text-sm shadow-[var(--shadow-card)]">
            <span
              className="pulse-dot bg-brand text-brand size-1.5 rounded-full"
              aria-hidden
            />
            Hiring across the Kingdom
            <span className="hidden sm:inline">
              , in Riyadh, Jeddah, Dammam and beyond
            </span>
          </p>
          <h1 className="display-xl mx-auto mt-8 max-w-5xl">
            <span className="sr-only">
              Where Saudi talent meets ambitious employers.
            </span>
            <span aria-hidden>
              {headline.map((w, i) => (
                <span key={w} className="word-mask">
                  <span
                    style={{ "--d": `${80 + i * 70}ms` } as React.CSSProperties}
                  >
                    {w}
                  </span>
                  {i < headline.length - 1 ? "\u00a0" : ""}
                </span>
              ))}
              <br />
              <span className="word-mask">
                <span style={{ "--d": "400ms" } as React.CSSProperties}>
                  <RotatingWords
                    className="text-brand font-medium italic"
                    words={[
                      "ambitious employers.",
                      "fast-growing teams.",
                      "Vision 2030 projects.",
                      "its next opportunity.",
                    ]}
                  />
                </span>
              </span>
            </span>
          </h1>
          <p className="animate-fade-up text-body mx-auto mt-6 max-w-[640px] text-lg leading-relaxed [animation-delay:520ms] sm:text-xl sm:leading-[30px]">
            Search real openings and apply directly to hiring teams, or post
            roles and manage every applicant in one clean pipeline.
          </p>
          <div className="animate-fade-up mx-auto mt-10 max-w-3xl text-start [animation-delay:620ms]">
            <SearchBar />
          </div>
          <div className="animate-fade-up mt-5 flex flex-wrap justify-center gap-2 text-sm [animation-delay:720ms]">
            <span className="text-muted">Popular:</span>
            {["Engineering", "Healthcare", "Finance", "Technology"].map((c) => (
              <Link
                key={c}
                href={`/jobs?category=${encodeURIComponent(c)}`}
                className="border-line text-ink-soft hover:border-ink hover:text-ink rounded-full border bg-white px-3 py-0.5 transition-colors"
              >
                {c}
              </Link>
            ))}
          </div>

          {showStats && (
            <dl className="animate-fade-up divide-line border-line mx-auto mt-14 grid max-w-2xl grid-cols-3 divide-x rounded-2xl border bg-white/80 py-5 backdrop-blur [animation-delay:820ms] rtl:divide-x-reverse">
              {[
                { label: "Open roles", value: stats.jobs },
                { label: "Companies", value: stats.companies },
                { label: "Candidates", value: stats.candidates },
              ].map((s) => (
                <div key={s.label} className="px-3">
                  <dt className="text-muted text-xs sm:text-sm">{s.label}</dt>
                  <dd className="mt-1 text-2xl font-medium tracking-[-0.03em] sm:text-3xl">
                    <CountUp value={s.value} />
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </Container>
      </section>

      {/* Dual audience */}
      <section aria-label="Choose your path">
        <Container className="grid gap-5 md:grid-cols-2">
          <SpotlightLink
            href="/jobs"
            glow="rgba(127,209,173,0.16)"
            className="bg-ink relative flex min-h-[380px] flex-col overflow-hidden rounded-[var(--radius-panel)] p-8 text-white transition-transform duration-500 ease-out hover:-translate-y-1 sm:p-10"
          >
            <p className="eyebrow text-[#7fd1ad]">For candidates</p>
            <h2 className="display-md mt-4">
              Find your{" "}
              <span className="text-[#7fd1ad] italic">next role.</span>
            </h2>
            <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-white/70">
              Apply directly to companies hiring across Saudi Arabia, with
              salaries and visa requirements stated up front.
            </p>
            <span className="text-ink mt-8 inline-flex h-12 w-fit items-center gap-2 rounded-full bg-white px-6 font-semibold transition-colors group-hover:bg-[#e8f3ee]">
              Browse jobs <ArrowRight className="nudge size-4 rtl:rotate-180" />
            </span>
            <div
              aria-hidden
              className="pointer-events-none absolute -end-6 -bottom-8 hidden w-[58%] rotate-[-4deg] rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition-transform duration-700 ease-out group-hover:-translate-y-3 group-hover:rotate-[-2deg] lg:block"
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="mb-2 flex items-center gap-3 rounded-xl bg-white/[0.06] p-3 last:mb-0"
                >
                  <span className="size-8 rounded-lg bg-white/15" />
                  <span className="flex-1 space-y-1.5">
                    <span className="block h-2 w-3/4 rounded bg-white/30" />
                    <span className="block h-2 w-1/2 rounded bg-white/15" />
                  </span>
                  <span className="h-6 w-12 rounded-full bg-[#7fd1ad]/30" />
                </div>
              ))}
            </div>
          </SpotlightLink>

          <SpotlightLink
            href="/hire"
            glow="rgba(255,255,255,0.75)"
            className="border-brand/15 bg-brand-soft relative flex min-h-[380px] flex-col overflow-hidden rounded-[var(--radius-panel)] border p-8 transition-transform duration-500 ease-out hover:-translate-y-1 sm:p-10"
          >
            <p className="eyebrow text-brand">For employers</p>
            <h2 className="display-md mt-4">
              Find your <span className="text-brand italic">next hire.</span>
            </h2>
            <p className="text-body mt-3 max-w-sm text-[15px] leading-relaxed">
              Tell us who you need. Our recruiters announce your roles, screen
              candidates and send you a shortlist.
            </p>
            <span className="bg-brand group-hover:bg-brand-hover mt-8 inline-flex h-12 w-fit items-center gap-2 rounded-full px-6 font-semibold text-white transition-colors">
              Start hiring{" "}
              <ArrowRight className="nudge size-4 rtl:rotate-180" />
            </span>
            <div
              aria-hidden
              className="border-brand/15 pointer-events-none absolute -end-6 -bottom-8 hidden w-[58%] rotate-[3deg] rounded-2xl border bg-white p-4 shadow-[var(--shadow-pop)] transition-transform duration-700 ease-out group-hover:-translate-y-3 group-hover:rotate-[1deg] lg:block"
            >
              <div className="mb-3 flex gap-1.5">
                {["Applied", "Shortlisted", "Interview"].map((s, i) => (
                  <span
                    key={s}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${i === 1 ? "bg-ink text-white" : "bg-surface-2 text-muted"}`}
                  >
                    {s}
                  </span>
                ))}
              </div>
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="border-line mb-2 flex items-center gap-3 rounded-xl border p-3 last:mb-0"
                >
                  <span className="bg-surface-2 size-8 rounded-full" />
                  <span className="flex-1 space-y-1.5">
                    <span className="bg-line-strong block h-2 w-2/3 rounded" />
                    <span className="bg-line block h-2 w-1/2 rounded" />
                  </span>
                </div>
              ))}
            </div>
          </SpotlightLink>
        </Container>
      </section>

      {/* Companies marquee */}
      {companies.length >= 4 && (
        <section className="pt-20 sm:pt-24" aria-labelledby="hiring-heading">
          <Container>
            <Reveal>
              <p id="hiring-heading" className="text-muted text-center text-sm">
                Teams hiring on SaudiRecruit right now
              </p>
            </Reveal>
          </Container>
          <div
            className="marquee mt-8"
            style={
              {
                "--speed": `${Math.max(30, companies.length * 5)}s`,
              } as React.CSSProperties
            }
          >
            {[0, 1].map((copy) => (
              <ul
                key={copy}
                className="marquee__track"
                aria-hidden={copy === 1}
              >
                {companies.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/companies/${c.slug}`}
                      tabIndex={copy === 1 ? -1 : undefined}
                      className="text-subtle hover:text-ink flex items-center gap-3 text-xl font-medium tracking-[-0.02em] whitespace-nowrap grayscale transition-[color,filter] hover:grayscale-0"
                    >
                      <Avatar name={c.name} src={c.logoUrl} size={36} square />
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </section>
      )}

      {/* Latest roles */}
      <section className="pt-24 sm:pt-32" aria-labelledby="latest-heading">
        <Container>
          <Reveal className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow text-brand inline-flex items-center gap-2">
                <span
                  className="pulse-dot bg-brand size-1.5 rounded-full"
                  aria-hidden
                />{" "}
                Live on SaudiRecruit
              </p>
              <h2 id="latest-heading" className="display-lg mt-3">
                Latest openings
              </h2>
            </div>
            <LinkButton href="/jobs" variant="outline" className="group">
              View all jobs{" "}
              <ArrowRight className="nudge size-4 rtl:rotate-180" />
            </LinkButton>
          </Reveal>
          {latest.length > 0 ? (
            <div className="grid gap-3">
              {latest.map((job, i) => (
                <Reveal key={job.id} delay={i * 70}>
                  <JobCard job={job} />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Briefcase className="size-5" />}
              title={
                jobsRes.error
                  ? "Openings are temporarily unavailable"
                  : "The first roles are on their way"
              }
              description={
                jobsRes.error
                  ? "We couldn't load openings right now. Please refresh in a moment."
                  : "Employers are setting up their company profiles. Send your CV now and our recruiters will contact you the moment a matching role opens."
              }
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <LinkButton href="/send-cv" variant="dark">
                    Send your CV
                  </LinkButton>
                  <LinkButton href="/hire" variant="outline">
                    <Plus className="size-4" /> Hire talent
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
            <Reveal className="lg:sticky lg:top-28 lg:self-start">
              <p className="eyebrow text-brand">For employers</p>
              <h2 className="display-lg mt-3">
                Build the team that builds the Kingdom.
              </h2>
              <p className="text-body mt-5 max-w-md text-lg leading-relaxed">
                Everything you need to go from open role to signed offer,
                designed around how hiring actually works in Saudi Arabia.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <LinkButton href="/hire" size="lg">
                  Send a hiring request{" "}
                  <ArrowRight className="size-4 rtl:rotate-180" />
                </LinkButton>
                <LinkButton
                  href="/register?role=employer"
                  variant="outline"
                  size="lg"
                >
                  Post jobs yourself
                </LinkButton>
              </div>
            </Reveal>
            <ol className="grid gap-4">
              {employerSteps.map((s, i) => (
                <Reveal
                  as="li"
                  key={s.title}
                  delay={i * 90}
                  className="group border-line hover:border-line-strong rounded-[var(--radius-card)] border p-7 transition-[border-color,box-shadow] duration-300 hover:shadow-[var(--shadow-card)] sm:p-8"
                >
                  <span className="bg-brand-soft text-brand group-hover:bg-brand inline-flex size-9 items-center justify-center rounded-full font-mono text-sm transition-colors duration-300 group-hover:text-white">
                    0{i + 1}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold tracking-[-0.02em]">
                    {s.title}
                  </h3>
                  <p className="text-body mt-2 text-[15px] leading-relaxed">
                    {s.body}
                  </p>
                </Reveal>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      {/* Candidates */}
      <section id="how-it-works" className="scroll-mt-24 pt-24 sm:pt-32">
        <Container>
          <Reveal className="bg-surface rounded-[var(--radius-panel)] px-6 py-14 sm:px-12 sm:py-16">
            <div className="max-w-2xl">
              <p className="eyebrow text-brand">For candidates</p>
              <h2 className="display-lg mt-3">
                Find work that moves you forward.
              </h2>
            </div>
            <ol className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {candidateSteps.map((s, i) => (
                <Reveal
                  as="li"
                  key={s.title}
                  delay={150 + i * 90}
                  className="group border-line-strong relative border-t pt-6"
                >
                  <span
                    aria-hidden
                    className="bg-ink absolute start-0 -top-px h-px w-0 transition-[width] duration-700 ease-out group-hover:w-full"
                  />
                  <span className="text-muted font-mono text-sm">0{i + 1}</span>
                  <h3 className="mt-3 text-lg font-semibold tracking-[-0.015em]">
                    {s.title}
                  </h3>
                  <p className="text-body mt-2 text-[15px] leading-relaxed">
                    {s.body}
                  </p>
                </Reveal>
              ))}
            </ol>
            <div className="mt-12 flex flex-wrap gap-3">
              <LinkButton href="/send-cv" variant="dark" size="lg">
                Send your CV <ArrowRight className="size-4 rtl:rotate-180" />
              </LinkButton>
              <LinkButton href="/jobs" variant="outline" size="lg">
                Browse jobs
              </LinkButton>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* Categories */}
      <section className="pt-24 sm:pt-32" aria-labelledby="cat-heading">
        <Container>
          <Reveal>
            <h2 id="cat-heading" className="display-md">
              Explore by category
            </h2>
          </Reveal>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {CATEGORIES.map((c, i) => (
              <Reveal as="li" key={c} delay={(i % 4) * 60}>
                <Link
                  href={`/jobs?category=${encodeURIComponent(c)}`}
                  className="group border-line hover:border-ink hover:bg-surface flex items-center justify-between rounded-2xl border px-5 py-4 text-[15px] font-medium transition-[border-color,background-color] duration-300"
                >
                  {c}
                  <ArrowRight className="nudge text-subtle group-hover:text-ink size-4 rtl:rotate-180" />
                </Link>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 pt-24 sm:pt-32">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <Reveal>
            <h2 className="display-lg">Common questions.</h2>
          </Reveal>
          <Reveal
            delay={100}
            className="divide-line border-line divide-y border-y"
          >
            {faqs.map((f) => (
              <details
                key={f.q}
                className="faq group py-5 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-medium tracking-[-0.01em]">
                  {f.q}
                  <Plus
                    className="text-muted size-5 shrink-0 transition-transform duration-200 group-open:rotate-45"
                    aria-hidden
                  />
                </summary>
                <p className="text-body mt-3 max-w-2xl text-[15px] leading-relaxed">
                  {f.a}
                </p>
              </details>
            ))}
          </Reveal>
        </Container>
      </section>

      {/* Closing CTA */}
      <section className="pt-24 sm:pt-32">
        <Container>
          <Reveal className="bg-ink relative overflow-hidden rounded-[var(--radius-panel)] px-6 py-16 text-center text-white sm:px-12 sm:py-20">
            <div className="aurora opacity-80 mix-blend-screen" aria-hidden />
            <div className="relative">
              <h2 className="display-lg">What&apos;s your next move?</h2>
              <p className="mx-auto mt-4 max-w-lg text-lg text-white/70">
                Send your CV or tell us who you need. No account needed, it
                takes two minutes.
              </p>
              <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/send-cv"
                  className="text-ink hover:bg-brand-soft inline-flex h-[52px] items-center justify-center gap-2 rounded-full bg-white px-6 font-semibold transition-colors"
                >
                  Send your CV <ArrowRight className="size-4 rtl:rotate-180" />
                </Link>
                <Link
                  href="/hire"
                  className="inline-flex h-[52px] items-center justify-center rounded-full border border-white/40 px-6 font-semibold text-white transition-colors hover:border-white hover:bg-white/5"
                >
                  Hire talent
                </Link>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}

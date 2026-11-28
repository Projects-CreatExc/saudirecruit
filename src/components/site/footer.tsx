import Link from "next/link";
import { CATEGORIES, SAUDI_CITIES } from "@/lib/constants";
import { Container, Logo } from "@/components/ui/misc";

const columns = [
  {
    title: "For candidates",
    links: [
      { href: "/jobs", label: "Browse jobs" },
      { href: "/companies", label: "Browse companies" },
      { href: "/register", label: "Create a profile" },
      { href: "/applications", label: "Track applications" },
    ],
  },
  {
    title: "For employers",
    links: [
      { href: "/register?role=employer", label: "Start hiring" },
      { href: "/dashboard/jobs/new", label: "Post a job" },
      { href: "/dashboard/applicants", label: "Review applicants" },
      { href: "/dashboard/company", label: "Company profile" },
    ],
  },
  {
    title: "Platform",
    links: [
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#faq", label: "FAQ" },
      { href: "/login", label: "Log in" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer mt-24 border-t border-line bg-white">
      <Container className="grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-[15px] leading-relaxed text-body">
            The hiring platform built for Saudi Arabia. Apply directly to employers, or hire the people who will build what&apos;s next.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold">{col.title}</h3>
            <ul className="mt-4 space-y-3">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-[15px] text-body transition-colors hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <div className="border-t border-line bg-surface">
        <Container className="grid gap-8 py-10 sm:grid-cols-2">
          <div>
            <h3 className="eyebrow text-muted">Jobs by city</h3>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              {SAUDI_CITIES.slice(0, 8).map((c) => (
                <li key={c}>
                  <Link href={`/jobs?city=${encodeURIComponent(c)}`} className="text-sm text-body hover:text-ink">
                    Jobs in {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="eyebrow text-muted">Jobs by category</h3>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              {CATEGORIES.slice(0, 8).map((c) => (
                <li key={c}>
                  <Link href={`/jobs?category=${encodeURIComponent(c)}`} className="text-sm text-body hover:text-ink">
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Container>
        <Container className="flex flex-col gap-2 border-t border-line py-6 text-sm text-muted sm:flex-row sm:justify-between">
          <p>© {year} SaudiRecruit. All rights reserved.</p>
          <p>Made for the Kingdom of Saudi Arabia</p>
        </Container>
      </div>
    </footer>
  );
}

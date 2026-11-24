import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-navy text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 lg:px-12">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gold" />
          <span className="text-xl font-bold tracking-tight">
            {siteConfig.name}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-cream/80 transition-colors hover:text-cream"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-navy transition-colors hover:bg-gold-light"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col items-center px-6 pb-24 pt-20 text-center lg:px-12 lg:pt-32">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-4 py-1.5 text-sm text-gold">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          Premier Talent Platform for Saudi Arabia
        </div>

        <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
          Connecting{" "}
          <span className="text-gold">World-Class Talent</span>
          <br />
          with Saudi Ambition
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-cream/60">
          The premium recruitment platform built for Saudi Arabia&apos;s
          Vision 2030. Find exceptional professionals, streamline hiring,
          and build the workforce of tomorrow.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/register?role=job_seeker"
            className="rounded-lg bg-gold px-8 py-3.5 text-base font-semibold text-navy transition-all hover:bg-gold-light hover:shadow-lg hover:shadow-gold/20"
          >
            Find Opportunities
          </Link>
          <Link
            href="/register?role=employer"
            className="rounded-lg border border-cream/20 px-8 py-3.5 text-base font-semibold text-cream transition-all hover:border-cream/40 hover:bg-white/5"
          >
            Post a Job
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-16">
          {[
            { value: "10K+", label: "Active Jobs" },
            { value: "50K+", label: "Professionals" },
            { value: "2K+", label: "Companies" },
            { value: "95%", label: "Satisfaction" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-gold">{stat.value}</div>
              <div className="mt-1 text-sm text-cream/50">{stat.label}</div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-cream/10 px-6 py-8 text-center text-sm text-cream/40 lg:px-12">
        &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </footer>
    </div>
  );
}

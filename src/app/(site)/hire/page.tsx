import type { Metadata } from "next";
import Link from "next/link";
import { CompanyRequestForm } from "@/components/requests/company-form";
import { WhatsAppButton } from "@/components/requests/whatsapp";
import { Container } from "@/components/ui/misc";
import { getSettings, whatsappLink } from "@/lib/agency";

export const metadata: Metadata = {
  title: "Hire with SaudiRecruit",
  description: "Tell us who you need. Our recruiters shortlist candidates and announce your roles. No account needed.",
};

const steps = [
  { t: "Tell us who you need", d: "List the roles, how many people and your budget, or attach a job description." },
  { t: "We announce and shortlist", d: "We publish your roles on SaudiRecruit and match candidates from our talent pool." },
  { t: "You interview and hire", d: "We send you a shortlist with CVs and arrange interviews." },
];

export default async function HirePage() {
  const s = await getSettings();
  const wa = whatsappLink(s.whatsapp, "Hello SaudiRecruit, we'd like to hire through you.");

  return (
    <>
      <section className="hero-wash border-b border-line">
        <Container className="py-12 sm:py-16">
          <p className="eyebrow text-brand">For employers</p>
          <h1 className="display-lg mt-3 max-w-2xl">Tell us who you need. We&apos;ll handle the rest.</h1>
          <p className="mt-4 max-w-xl text-lg text-body">From one specialist to a full project team, our recruiters find, screen and shortlist candidates for you.</p>
        </Container>
      </section>
      <Container className="grid gap-10 py-10 lg:grid-cols-[1fr_340px] lg:gap-14">
        <CompanyRequestForm />
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <ol className="space-y-5">
            {steps.map((x, i) => (
              <li key={x.t} className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft font-mono text-sm text-brand">{i + 1}</span>
                <div>
                  <p className="font-semibold">{x.t}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-body">{x.d}</p>
                </div>
              </li>
            ))}
          </ol>
          {wa && (
            <div className="rounded-[var(--radius-card)] border border-line p-5">
              <p className="text-sm text-body">Need staff urgently? Message our team directly.</p>
              <WhatsAppButton href={wa} className="mt-4 w-full" />
            </div>
          )}
          <p className="text-sm text-muted">
            Prefer to post jobs yourself?{" "}
            <Link href="/register?role=employer" className="font-medium text-ink underline underline-offset-4">
              Create an employer account
            </Link>
          </p>
        </aside>
      </Container>
    </>
  );
}

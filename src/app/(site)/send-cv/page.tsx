import type { Metadata } from "next";
import Link from "next/link";
import { CandidateRequestForm } from "@/components/requests/candidate-form";
import { WhatsAppButton } from "@/components/requests/whatsapp";
import { Container } from "@/components/ui/misc";
import { getSettings, whatsappLink } from "@/lib/agency";

export const metadata: Metadata = {
  title: "Send your CV",
  description: "Send us your CV and our recruiters will match you with jobs across Saudi Arabia. No account needed.",
};

const steps = [
  { t: "Send your CV", d: "Fill in a few details and attach your CV. No account or password needed." },
  { t: "We review it", d: "A recruiter reads your CV and adds you to our talent pool with the right skills and tags." },
  { t: "We call you", d: "When a matching role opens, we contact you on your phone or WhatsApp." },
];

export default async function SendCvPage() {
  const s = await getSettings();
  const wa = whatsappLink(s.whatsapp, "Hello SaudiRecruit, I'd like to send my CV.");

  return (
    <>
      <section className="hero-wash border-b border-line">
        <Container className="py-12 sm:py-16">
          <p className="eyebrow text-brand">For job seekers</p>
          <h1 className="display-lg mt-3 max-w-2xl">Send your CV. We&apos;ll find the match.</h1>
          <p className="mt-4 max-w-xl text-lg text-body">Our recruiters place people in roles across the Kingdom. Tell us about yourself once and we&apos;ll do the searching.</p>
        </Container>
      </section>
      <Container className="grid gap-10 py-10 lg:grid-cols-[1fr_340px] lg:gap-14">
        <CandidateRequestForm />
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
              <p className="text-sm text-body">Prefer to talk? Send us your CV on WhatsApp.</p>
              <WhatsAppButton href={wa} className="mt-4 w-full" />
            </div>
          )}
          <p className="text-sm text-muted">
            Want to track applications yourself?{" "}
            <Link href="/register" className="font-medium text-ink underline underline-offset-4">
              Create a free account
            </Link>
          </p>
        </aside>
      </Container>
    </>
  );
}

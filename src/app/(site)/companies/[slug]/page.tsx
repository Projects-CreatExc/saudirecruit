import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, Briefcase, Calendar, Globe, MapPin, Users } from "lucide-react";
import { JobCard } from "@/components/jobs/job-card";
import { Alert } from "@/components/ui/field";
import { Avatar, Card, Container, EmptyState } from "@/components/ui/misc";
import { getCompanyBySlug } from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const res = await getCompanyBySlug(slug);
  if (!res.data) return { title: "Company not found" };
  return { title: `${res.data.company.name} jobs`, description: res.data.company.description?.slice(0, 160) };
}

export default async function CompanyPage({ params }: Props) {
  const { slug } = await params;
  const res = await getCompanyBySlug(slug);
  if (res.error) {
    return (
      <Container className="py-16">
        <Alert>{res.error}</Alert>
      </Container>
    );
  }
  if (!res.data) notFound();
  const { company, openJobs } = res.data;

  const facts = [
    company.city && { icon: MapPin, label: company.city },
    company.employeeCount && { icon: Users, label: `${company.employeeCount.toLocaleString()} employees` },
    company.foundedYear && { icon: Calendar, label: `Founded ${company.foundedYear}` },
  ].filter(Boolean) as { icon: typeof MapPin; label: string }[];

  return (
    <>
      <section className="hero-wash border-b border-line">
        <Container className="py-10 sm:py-14">
          <Link href="/companies" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
            <ArrowLeft className="size-4 rtl:rotate-180" /> All companies
          </Link>
          <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar name={company.name} src={company.logoUrl} size={72} square />
            <div>
              <h1 className="display-md flex items-center gap-2">
                {company.name}
                {company.isVerified && <BadgeCheck className="size-6 text-brand" aria-label="Verified company" />}
              </h1>
              <p className="mt-1 text-body">{company.industry ?? "Hiring in Saudi Arabia"}</p>
            </div>
          </div>
        </Container>
      </section>

      <Container className="grid gap-10 py-10 lg:grid-cols-[1fr_320px] lg:gap-14">
        <div>
          <h2 className="text-lg font-semibold tracking-[-0.015em]">
            Open roles <span className="font-normal text-muted">({openJobs.length})</span>
          </h2>
          <div className="mt-5 grid gap-3">
            {openJobs.length > 0 ? (
              openJobs.map((job) => <JobCard key={job.id} job={job} showCompany={false} />)
            ) : (
              <EmptyState icon={<Briefcase className="size-5" />} title="No open roles right now" description="Check back soon, new roles are posted regularly." />
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="p-6">
            <h2 className="text-base font-semibold">About</h2>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-body">{company.description || "This company hasn't added a description yet."}</p>
            {(facts.length > 0 || company.website) && (
              <ul className="mt-5 space-y-2.5 border-t border-line pt-5 text-sm text-body">
                {facts.map((f) => (
                  <li key={f.label} className="flex items-center gap-2">
                    <f.icon className="size-4 text-subtle" /> {f.label}
                  </li>
                ))}
                {company.website && (
                  <li className="flex items-center gap-2">
                    <Globe className="size-4 text-subtle" />
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="truncate hover:text-ink hover:underline">
                      {company.website.replace(/^https?:\/\//, "")}
                    </a>
                  </li>
                )}
              </ul>
            )}
          </Card>
        </aside>
      </Container>
    </>
  );
}

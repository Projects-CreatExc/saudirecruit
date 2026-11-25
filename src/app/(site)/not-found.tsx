import { LinkButton } from "@/components/ui/button";

/** 404 inside the public site: the header and footer are already on the page. */
export default function SiteNotFound() {
  return (
    <div className="hero-wash flex min-h-[60vh] flex-col items-center justify-center px-5 py-20 text-center">
      <p className="eyebrow text-brand">404</p>
      <h1 className="display-lg mt-3">We couldn&apos;t find that page.</h1>
      <p className="mt-4 max-w-md text-body">The link may be broken, or the role may have been filled or removed.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <LinkButton href="/jobs" variant="dark">
          Browse jobs
        </LinkButton>
        <LinkButton href="/" variant="outline">
          Go home
        </LinkButton>
      </div>
    </div>
  );
}

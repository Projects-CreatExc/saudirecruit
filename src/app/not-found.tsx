import { LinkButton } from "@/components/ui/button";
import { Logo } from "@/components/ui/misc";

export default function NotFound() {
  return (
    <div className="hero-wash flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <Logo />
      <p className="eyebrow mt-12 text-brand">404</p>
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

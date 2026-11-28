import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import { LinkButton } from "@/components/ui/button";
import { Container, Logo } from "@/components/ui/misc";
import { InstallButton } from "@/components/pwa/install";
import { accountNav } from "@/lib/navigation";
import { AppBack } from "./app-back";
import { MobileMenu } from "./mobile-menu";
import { UserMenu } from "./user-menu";

export const NAV_LINKS = [
  { href: "/jobs", label: "Jobs" },
  { href: "/companies", label: "Companies" },
  { href: "/hire", label: "Hire talent" },
  { href: "/send-cv", label: "Send your CV" },
];

export async function SiteHeader() {
  const user = await getSessionUser();

  return (
    <header className="site-header sticky top-0 z-40 border-b border-line/70 bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
      <Container className="flex h-[72px] items-center justify-between gap-6">
        <div className="flex min-w-0 items-center">
          <AppBack />
          <Logo />
        </div>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <InstallButton />
          {user ? (
            <>
              <LinkButton href="/dashboard" variant="ghost" size="sm">
                Dashboard
              </LinkButton>
              <UserMenu name={user.name ?? user.email ?? "Account"} email={user.email ?? ""} />
            </>
          ) : (
            <>
              <LinkButton href="/login" variant="ghost" size="sm">
                Log in
              </LinkButton>
              <LinkButton href="/register" variant="dark" size="sm">
                Sign up
              </LinkButton>
            </>
          )}
        </div>

        <MobileMenu links={NAV_LINKS} account={user ? accountNav(user.role) : null} name={user?.name ?? null} />
      </Container>
    </header>
  );
}

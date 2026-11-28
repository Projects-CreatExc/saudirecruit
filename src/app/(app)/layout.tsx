import { SideNav } from "@/components/app/side-nav";
import { TabBar } from "@/components/site/tab-bar";
import { SiteHeader } from "@/components/site/header";
import { Container } from "@/components/ui/misc";
import { requireUser } from "@/lib/auth/session";
import { ROLE_LABELS } from "@/lib/constants";
import { accountNav } from "@/lib/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  const items = accountNav(user.role);

  return (
    <div className="pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
      <SiteHeader />
      <Container className="grid gap-6 py-6 lg:grid-cols-[220px_1fr] lg:gap-12 lg:py-10">
        <aside className="hidden md:block lg:sticky lg:top-24 lg:self-start">
          <div className="mb-4 hidden px-3.5 lg:block">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="text-xs text-muted">{ROLE_LABELS[user.role]}</p>
          </div>
          <SideNav items={items} />
        </aside>
        <main id="main" className="min-w-0 pb-16">
          {children}
        </main>
      </Container>
      <TabBar />
    </div>
  );
}

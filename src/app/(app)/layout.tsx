import { SideNav, type NavItem } from "@/components/app/side-nav";
import { SiteHeader } from "@/components/site/header";
import { Container } from "@/components/ui/misc";
import { requireUser } from "@/lib/auth/session";
import { ROLE_LABELS, isAdminRole, isEmployerRole } from "@/lib/constants";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  const items: NavItem[] = isEmployerRole(user.role)
    ? [
        { href: "/dashboard", label: "Overview", icon: "LayoutDashboard" },
        { href: "/dashboard/jobs", label: "Jobs", icon: "Briefcase" },
        { href: "/dashboard/applicants", label: "Applicants", icon: "Users" },
        { href: "/dashboard/company", label: "Company", icon: "Building2" },
        { href: "/settings", label: "Settings", icon: "Settings" },
      ]
    : isAdminRole(user.role)
      ? [
          { href: "/dashboard", label: "Overview", icon: "LayoutDashboard" },
          { href: "/dashboard/admin/users", label: "Users", icon: "Users" },
          { href: "/dashboard/admin/companies", label: "Companies", icon: "Building2" },
          { href: "/dashboard/admin/jobs", label: "Jobs", icon: "Briefcase" },
          { href: "/dashboard/admin/applications", label: "Applications", icon: "FileText" },
          { href: "/settings", label: "Settings", icon: "Settings" },
        ]
      : [
          { href: "/dashboard", label: "Overview", icon: "LayoutDashboard" },
          { href: "/jobs", label: "Find jobs", icon: "Search" },
          { href: "/applications", label: "Applications", icon: "FileText" },
          { href: "/settings", label: "Profile & settings", icon: "Settings" },
        ];

  return (
    <>
      <SiteHeader />
      <Container className="grid gap-6 py-6 lg:grid-cols-[220px_1fr] lg:gap-12 lg:py-10">
        <aside className="lg:sticky lg:top-24 lg:self-start">
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
    </>
  );
}

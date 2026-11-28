import type { UserRole } from "@/types";
import { isAdminRole, isEmployerRole } from "@/lib/constants";

export type IconName =
  | "Home"
  | "LayoutDashboard"
  | "Briefcase"
  | "Building2"
  | "FileText"
  | "Search"
  | "Settings"
  | "Users"
  | "UserRound"
  | "LogIn"
  | "Inbox"
  | "Contact"
  | "SlidersHorizontal";

export type NavItem = { href: string; label: string; icon: IconName };

/** Full list for the desktop sidebar and the mobile menu. */
export function accountNav(role: UserRole): NavItem[] {
  if (isEmployerRole(role))
    return [
      { href: "/dashboard", label: "Overview", icon: "LayoutDashboard" },
      { href: "/dashboard/jobs", label: "Jobs", icon: "Briefcase" },
      { href: "/dashboard/applicants", label: "Applicants", icon: "Users" },
      { href: "/dashboard/company", label: "Company", icon: "Building2" },
      { href: "/settings", label: "Settings", icon: "Settings" },
    ];
  if (isAdminRole(role))
    return [
      { href: "/dashboard", label: "Overview", icon: "LayoutDashboard" },
      { href: "/dashboard/admin/requests", label: "Requests", icon: "Inbox" },
      { href: "/dashboard/admin/candidates", label: "Talent pool", icon: "Contact" },
      { href: "/dashboard/admin/companies", label: "Companies", icon: "Building2" },
      { href: "/dashboard/admin/jobs", label: "Jobs", icon: "Briefcase" },
      { href: "/dashboard/admin/applications", label: "Applications", icon: "FileText" },
      { href: "/dashboard/admin/users", label: "Users", icon: "Users" },
      { href: "/dashboard/admin/settings", label: "Site settings", icon: "SlidersHorizontal" },
      { href: "/settings", label: "My account", icon: "Settings" },
    ];
  return [
    { href: "/dashboard", label: "Overview", icon: "LayoutDashboard" },
    { href: "/jobs", label: "Find jobs", icon: "Search" },
    { href: "/applications", label: "Applications", icon: "FileText" },
    { href: "/settings", label: "Profile & settings", icon: "Settings" },
  ];
}

/** The four most important destinations, shown in the phone's bottom tab bar. */
export function tabNav(role: UserRole | null): NavItem[] {
  if (!role)
    return [
      { href: "/", label: "Home", icon: "Home" },
      { href: "/jobs", label: "Jobs", icon: "Search" },
      { href: "/send-cv", label: "Send CV", icon: "FileText" },
      { href: "/hire", label: "Hire", icon: "Briefcase" },
    ];
  if (isEmployerRole(role))
    return [
      { href: "/dashboard", label: "Home", icon: "Home" },
      { href: "/dashboard/jobs", label: "Jobs", icon: "Briefcase" },
      { href: "/dashboard/applicants", label: "Applicants", icon: "Users" },
      { href: "/dashboard/company", label: "Company", icon: "Building2" },
    ];
  if (isAdminRole(role))
    return [
      { href: "/dashboard", label: "Home", icon: "Home" },
      { href: "/dashboard/admin/requests", label: "Requests", icon: "Inbox" },
      { href: "/dashboard/admin/candidates", label: "Talent", icon: "Contact" },
      { href: "/dashboard/admin/jobs", label: "Jobs", icon: "Briefcase" },
    ];
  return [
    { href: "/dashboard", label: "Home", icon: "Home" },
    { href: "/jobs", label: "Jobs", icon: "Search" },
    { href: "/applications", label: "Applied", icon: "FileText" },
    { href: "/settings", label: "Profile", icon: "UserRound" },
  ];
}

/** Root-level and dashboard index pages are "home" for their tab and must match exactly. */
const EXACT = new Set(["/", "/dashboard"]);
export function isActivePath(pathname: string, href: string) {
  return EXACT.has(href) ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

/** Pages that are a tab's own root: no back button needed there. */
export function isTabRoot(pathname: string) {
  return ["/", "/dashboard", "/jobs", "/companies", "/applications", "/settings", "/login", "/register", "/send-cv", "/hire"].includes(pathname) ||
    /^\/dashboard\/(jobs|applicants|company|admin\/(users|companies|jobs|applications|requests|candidates|settings))$/.test(pathname);
}

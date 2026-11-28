import {
  Briefcase,
  Contact,
  Inbox,
  SlidersHorizontal,
  Building2,
  FileText,
  Home,
  LayoutDashboard,
  LogIn,
  Search,
  Settings,
  UserRound,
  Users,
  type LucideProps,
} from "lucide-react";
import type { IconName } from "@/lib/navigation";

const ICONS = { Home, LayoutDashboard, Briefcase, Building2, FileText, Search, Settings, Users, UserRound, LogIn, Inbox, Contact, SlidersHorizontal };

export function NavIcon({ name, ...props }: { name: IconName } & LucideProps) {
  const Icon = ICONS[name];
  return <Icon aria-hidden {...props} />;
}

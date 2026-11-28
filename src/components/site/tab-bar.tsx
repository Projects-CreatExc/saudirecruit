import { BottomNav } from "@/components/app/bottom-nav";
import { getSessionUser } from "@/lib/auth/session";
import { tabNav } from "@/lib/navigation";

/** Picks the right four tabs for the visitor (guest, candidate, employer or admin). */
export async function TabBar() {
  const user = await getSessionUser();
  return <BottomNav items={tabNav(user?.role ?? null)} />;
}

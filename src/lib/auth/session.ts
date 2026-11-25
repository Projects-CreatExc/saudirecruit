import { cache } from "react";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

/**
 * Current session user or null. Also re-checks the account in the database once
 * per request, so a deactivated or deleted user loses access immediately and a
 * role change by an admin takes effect without logging out.
 */
export const getSessionUser = cache(async () => {
  try {
    const session = await auth();
    if (!session?.user?.id) return null;
    const [row] = await db
      .select({ isActive: users.isActive, deletedAt: users.deletedAt, role: users.role })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);
    if (!row || !row.isActive || row.deletedAt) return null;
    return { ...session.user, role: row.role };
  } catch {
    return null;
  }
});

export async function requireUser(callbackUrl = "/dashboard") {
  const user = await getSessionUser();
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  return user;
}

export async function requireAdmin(callbackUrl = "/dashboard") {
  const user = await requireUser(callbackUrl);
  if (user.role !== "super_admin" && user.role !== "admin") redirect("/dashboard");
  return user;
}

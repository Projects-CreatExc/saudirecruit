"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { isAdminRole } from "@/lib/constants";
import { db } from "@/lib/db";
import { companies, users } from "@/lib/db/schema";

async function requireAdminAction() {
  const user = await getSessionUser();
  if (!user || !isAdminRole(user.role)) redirect("/dashboard");
  return user;
}

/** Deactivated users can't log in. Admins can't lock themselves out or touch super admins. */
export async function adminSetUserActiveAction(formData: FormData) {
  const admin = await requireAdminAction();
  const userId = String(formData.get("userId") ?? "");
  const active = formData.get("active") === "true";
  if (!userId || userId === admin.id) return;

  const [target] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1);
  if (!target) return;
  if (target.role === "super_admin" && admin.role !== "super_admin") return;

  await db.update(users).set({ isActive: active, updatedAt: new Date() }).where(eq(users.id, userId));
  revalidatePath("/dashboard/admin", "layout");
}

export async function adminSetCompanyVerifiedAction(formData: FormData) {
  await requireAdminAction();
  const companyId = String(formData.get("companyId") ?? "");
  const verified = formData.get("verified") === "true";
  if (!companyId) return;
  await db.update(companies).set({ isVerified: verified, updatedAt: new Date() }).where(eq(companies.id, companyId));
  revalidatePath("/dashboard/admin", "layout");
  revalidatePath("/companies");
}

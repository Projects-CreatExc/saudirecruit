import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** Current session user or null. Safe to call when auth isn't configured. */
export async function getSessionUser() {
  try {
    const session = await auth();
    return session?.user?.id ? session.user : null;
  } catch {
    return null;
  }
}

export async function requireUser(callbackUrl = "/dashboard") {
  const user = await getSessionUser();
  if (!user) redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  return user;
}

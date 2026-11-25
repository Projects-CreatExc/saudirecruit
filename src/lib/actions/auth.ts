"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/lib/auth";
import { db } from "@/lib/db";
import { jobSeekerProfiles, users } from "@/lib/db/schema";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

export type FormState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

function flatten(issues: { path: PropertyKey[]; message: string }[]) {
  const out: Record<string, string> = {};
  for (const i of issues) {
    const key = String(i.path[0] ?? "form");
    if (!out[key]) out[key] = i.message;
  }
  return out;
}

/** Only allow same-site relative redirects. */
function safeCallback(raw: FormDataEntryValue | null) {
  const v = typeof raw === "string" ? raw : "";
  return v.startsWith("/") && !v.startsWith("//") ? v : "/dashboard";
}

export async function loginAction(_: FormState, formData: FormData): Promise<FormState> {
  const values = { email: String(formData.get("email") ?? "").trim() };
  const parsed = loginSchema.safeParse({ email: values.email, password: formData.get("password") });
  if (!parsed.success) return { fieldErrors: flatten(parsed.error.issues), values };

  try {
    await signIn("credentials", {
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      redirect: false,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "That email and password don't match an active account.", values };
    }
    console.error("[login]", err);
    return { error: "Something went wrong signing you in. Please try again.", values };
  }

  try {
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.email, parsed.data.email.toLowerCase()));
  } catch {
    /* non-critical */
  }
  redirect(safeCallback(formData.get("callbackUrl")));
}

export async function registerAction(_: FormState, formData: FormData): Promise<FormState> {
  const raw = {
    firstName: String(formData.get("firstName") ?? "").trim(),
    lastName: String(formData.get("lastName") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    role: String(formData.get("role") ?? "job_seeker"),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };
  const values = { firstName: raw.firstName, lastName: raw.lastName, email: raw.email, role: raw.role };
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: flatten(parsed.error.issues), values };

  const email = parsed.data.email.toLowerCase();
  try {
    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing) {
      return { fieldErrors: { email: "An account with this email already exists." }, values };
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const [created] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        role: parsed.data.role,
      })
      .returning({ id: users.id });

    if (parsed.data.role === "job_seeker") {
      await db.insert(jobSeekerProfiles).values({ userId: created.id }).onConflictDoNothing();
    }
  } catch (err) {
    console.error("[register]", err);
    return { error: "We couldn't create your account right now. Please try again.", values };
  }

  try {
    await signIn("credentials", { email, password: parsed.data.password, redirect: false });
  } catch {
    redirect("/login?registered=1");
  }
  redirect(parsed.data.role === "employer" ? "/dashboard/company" : "/dashboard");
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

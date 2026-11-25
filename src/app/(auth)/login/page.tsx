import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Alert } from "@/components/ui/field";

export const metadata: Metadata = { title: "Log in" };

type SP = Record<string, string | string[] | undefined>;

export default async function LoginPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const callbackUrl = typeof sp.callbackUrl === "string" ? sp.callbackUrl : undefined;
  const registered = sp.registered === "1";
  const authError = typeof sp.error === "string";

  return (
    <>
      <h1 className="display-md">Welcome back</h1>
      <p className="mt-2 text-[15px] text-body">Log in to continue to SaudiRecruit.</p>
      <div className="mt-8 space-y-4">
        {registered && <Alert tone="success">Your account is ready. Log in to continue.</Alert>}
        {authError && !registered && <Alert>That email and password don&apos;t match an active account.</Alert>}
        <LoginForm callbackUrl={callbackUrl} />
      </div>
      <p className="mt-8 text-center text-sm text-body">
        New to SaudiRecruit?{" "}
        <Link href="/register" className="font-semibold text-ink underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </>
  );
}

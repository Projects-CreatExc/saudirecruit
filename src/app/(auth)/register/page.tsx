import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Create your account" };

type SP = Record<string, string | string[] | undefined>;

export default async function RegisterPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const role = sp.role === "employer" ? "employer" : "job_seeker";

  return (
    <>
      <h1 className="display-md">Create your account</h1>
      <p className="mt-2 text-[15px] text-body">Free for candidates and employers. Takes about a minute.</p>
      <div className="mt-8">
        <RegisterForm defaultRole={role} />
      </div>
      <p className="mt-8 text-center text-sm text-body">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-ink underline underline-offset-4">
          Log in
        </Link>
      </p>
    </>
  );
}

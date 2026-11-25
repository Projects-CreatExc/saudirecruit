import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

export const metadata: Metadata = { title: "Reset your password" };

/**
 * Self-serve reset needs a token table and email template (not in the schema yet).
 * Until then this page gives users a real path instead of a 404 or a fake form.
 */
export default function ForgotPasswordPage() {
  return (
    <>
      <span className="flex size-12 items-center justify-center rounded-full bg-surface-2">
        <Mail className="size-5" />
      </span>
      <h1 className="display-md mt-6">Reset your password</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-body">
        Self-service password reset is coming soon. In the meantime, email our support team from the address on your account and we&apos;ll
        help you regain access.
      </p>
      <a
        href="mailto:support@saudirecruit.com?subject=Password%20reset%20request"
        className="mt-8 inline-flex h-[52px] w-full items-center justify-center rounded-full bg-ink px-6 font-semibold text-white transition-colors hover:bg-ink-soft"
      >
        Email support
      </a>
      <Link href="/login" className="mt-6 flex items-center justify-center gap-1.5 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4 rtl:rotate-180" /> Back to log in
      </Link>
    </>
  );
}

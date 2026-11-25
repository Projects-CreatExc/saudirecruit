import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { getSessionUser } from "@/lib/auth/session";
import { Logo } from "@/components/ui/misc";

const points = [
  "Apply directly to hiring companies",
  "Salaries and visa requirements shown up front",
  "Track every application in one place",
  "Post roles and manage applicants for free",
];

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (await getSessionUser()) redirect("/dashboard");
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_minmax(420px,0.85fr)]">
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <Logo />
        <main id="main" className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-[420px] animate-fade-up">{children}</div>
        </main>
        <p className="text-xs text-muted">© {new Date().getFullYear()} SaudiRecruit</p>
      </div>
      <aside className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-end">
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(60% 50% at 80% 10%, rgba(127,209,173,0.18), transparent 70%), radial-gradient(50% 40% at 10% 90%, rgba(184,145,47,0.18), transparent 70%)",
          }}
        />
        <div className="relative">
          <p className="eyebrow text-[#7fd1ad]">SaudiRecruit</p>
          <h2 className="display-lg mt-4 max-w-md">Where Saudi talent meets ambitious employers.</h2>
          <ul className="mt-10 space-y-4">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-3 text-white/80">
                <span className="flex size-6 items-center justify-center rounded-full bg-white/10">
                  <Check className="size-3.5" />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}

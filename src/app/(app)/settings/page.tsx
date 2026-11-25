import type { Metadata } from "next";
import { PasswordForm, ProfileForm } from "@/components/app/settings-forms";
import { Alert } from "@/components/ui/field";
import { PageHeader } from "@/components/ui/misc";
import { requireUser } from "@/lib/auth/session";
import { isSeekerRole, parseSkills } from "@/lib/constants";
import { getAccount } from "@/lib/data";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser("/settings");
  const res = await getAccount(user.id);
  if (res.error) return <Alert>{res.error}</Alert>;
  if (!res.data) return <Alert>We couldn&apos;t find your account.</Alert>;
  const { user: u, profile: p } = res.data;
  const seeker = isSeekerRole(u.role);

  const initial = {
    firstName: u.firstName,
    lastName: u.lastName,
    phone: u.phone ?? "",
    headline: p?.headline ?? "",
    summary: p?.summary ?? "",
    currentCity: p?.currentCity ?? "",
    currentJobTitle: p?.currentJobTitle ?? "",
    desiredJobTitle: p?.desiredJobTitle ?? "",
    totalExperienceYears: p?.totalExperienceYears?.toString() ?? "",
    experienceLevel: p?.experienceLevel ?? "",
    visaStatus: p?.visaStatus ?? "not_specified",
    skills: parseSkills(p?.skills).join(", "),
    isOpenToWork: p?.isOpenToWork ?? true,
    isProfilePublic: p?.isProfilePublic ?? true,
  };

  return (
    <>
      <PageHeader title={seeker ? "Profile & settings" : "Settings"} description="Manage your account and how you appear to others." />
      <div className="space-y-6">
        <ProfileForm initial={initial} email={u.email} isSeeker={seeker} />
        <PasswordForm />
      </div>
    </>
  );
}

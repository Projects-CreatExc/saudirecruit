import type { Metadata } from "next";
import { SiteSettingsForm } from "@/components/app/site-settings-form";
import { PageHeader } from "@/components/ui/misc";
import { getSettings } from "@/lib/agency";
import { requireAdmin } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Site settings · Admin" };

export default async function SiteSettingsPage() {
  await requireAdmin("/dashboard/admin/settings");
  const s = await getSettings();
  return (
    <>
      <PageHeader title="Site settings" description="Contact details used across the public website." />
      <SiteSettingsForm initial={s} />
    </>
  );
}

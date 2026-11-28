import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { InstallBanner } from "@/components/pwa/install";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <InstallBanner />
    </>
  );
}

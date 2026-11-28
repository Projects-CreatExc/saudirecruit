import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { InstallBanner } from "@/components/pwa/install";
import { TabBar } from "@/components/site/tab-bar";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <InstallBanner />
      <TabBar />
    </div>
  );
}

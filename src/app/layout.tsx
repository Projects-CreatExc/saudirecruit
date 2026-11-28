import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import Script from "next/script";
import { PwaRegister } from "@/components/pwa/register";
import { siteConfig } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Jobs and hiring in Saudi Arabia`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ["recruitment", "jobs", "Saudi Arabia", "talent management", "hiring", "careers", "توظيف", "وظائف", "السعودية"],
  applicationName: siteConfig.name,
  appleWebApp: { capable: true, title: siteConfig.name, statusBarStyle: "default" },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: `${siteConfig.name} | Jobs and hiring in Saudi Arabia`,
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/**
 * Captures the browser's install event as early as possible (it can fire before
 * React hydrates), so the "Install app" buttons can use it later.
 */
const INSTALL_CAPTURE = `window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__srInstall=e;window.dispatchEvent(new Event('sr-install'))});window.addEventListener('appinstalled',function(){window.__srInstall=null;window.__srInstalled=true;window.dispatchEvent(new Event('sr-install'))});`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className="min-h-screen bg-white text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Script id="sr-install-capture" strategy="beforeInteractive">
          {INSTALL_CAPTURE}
        </Script>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
        <PwaRegister />
      </body>
    </html>
  );
}

import type { MetadataRoute } from "next";

/** Web App Manifest: makes SaudiRecruit installable as an app on phones and laptops. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "SaudiRecruit",
    short_name: "SaudiRecruit",
    description: "Find jobs and hire talent in Saudi Arabia. Apply directly to employers and track every application.",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    lang: "en",
    dir: "ltr",
    categories: ["business", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    screenshots: [
      { src: "/screenshots/mobile-home.png", sizes: "780x1688", type: "image/png", form_factor: "narrow", label: "Search jobs across Saudi Arabia" },
      { src: "/screenshots/mobile-jobs.png", sizes: "780x1688", type: "image/png", form_factor: "narrow", label: "Filter roles by city, type and level" },
      { src: "/screenshots/desktop-home.png", sizes: "1440x900", type: "image/png", form_factor: "wide", label: "Where Saudi talent meets ambitious employers" },
    ],
    shortcuts: [
      { name: "Find jobs", url: "/jobs", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Dashboard", url: "/dashboard", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}

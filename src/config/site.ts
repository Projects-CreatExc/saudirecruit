export const siteConfig = {
  name: "SaudiRecruit",
  nameAr: "سعودي ريكروت",
  description:
    "Premium recruitment and talent management platform for Saudi Arabia",
  descriptionAr:
    "منصة متميزة للتوظيف وإدارة المواهب في المملكة العربية السعودية",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  locale: {
    default: "en" as const,
    supported: ["en", "ar"] as const,
  },
  colors: {
    deepNavy: "#0F1B2D",
    warmGold: "#C9A84C",
    offWhite: "#F8F7F4",
    charcoal: "#1A1A2E",
  },
} as const;

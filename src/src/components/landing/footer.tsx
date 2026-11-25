"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";

const footerLinks = {
  Platform: [
    { label: "Find Jobs", href: "/jobs" },
    { label: "Post a Job", href: "/register?role=employer" },
    { label: "AI Matching", href: "#features" },
    { label: "Pricing", href: "/pricing" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  Resources: [
    { label: "Help Center", href: "/help" },
    { label: "API Docs", href: "/docs" },
    { label: "Saudization Guide", href: "/guides/saudization" },
    { label: "Market Reports", href: "/reports" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Cookie Policy", href: "/cookies" },
    { label: "GDPR", href: "/gdpr" },
  ],
};

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.04] bg-navy-dark">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        {/* Top section */}
        <div className="grid gap-12 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-9 w-9">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-gold to-gold-dark" />
                <div className="absolute inset-[2px] rounded-[6px] bg-navy-dark flex items-center justify-center">
                  <span className="text-gold font-bold text-sm">SR</span>
                </div>
              </div>
              <span className="text-lg font-bold text-white">
                {siteConfig.name}
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/30">
              The premier recruitment platform for Saudi Arabia&apos;s
              Vision 2030. Connecting global talent with the Kingdom&apos;s
              most ambitious projects.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="mb-4 text-sm font-semibold text-white/50 uppercase tracking-wider">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/25 transition-colors hover:text-gold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="mt-16 border-t border-white/[0.04] pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-xs text-white/20">
              &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
              reserved. Built for the Kingdom.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-xs text-white/15">
                🇸🇦 Made for Saudi Arabia
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

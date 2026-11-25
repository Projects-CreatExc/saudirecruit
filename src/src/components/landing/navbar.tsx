"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronRight } from "lucide-react";
import { siteConfig } from "@/config/site";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Industries", href: "#industries" },
  { label: "Testimonials", href: "#testimonials" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "glass py-3 shadow-lg shadow-black/10"
            : "bg-transparent py-5"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-9 w-9">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-gold to-gold-dark" />
              <div className="absolute inset-[2px] rounded-[6px] bg-navy flex items-center justify-center">
                <span className="text-gold font-bold text-sm">SR</span>
              </div>
            </div>
            <span className="text-lg font-bold tracking-tight text-white group-hover:text-gold transition-colors">
              {siteConfig.name}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-white/60 transition-colors hover:text-white relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="btn-premium rounded-lg bg-gradient-to-r from-gold to-gold-dark px-5 py-2.5 text-sm font-semibold text-navy"
            >
              Get Started
              <ChevronRight className="ml-1 inline h-4 w-4" />
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-white p-2"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-navy/98 backdrop-blur-xl pt-24 px-6 lg:hidden"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setMobileOpen(false)}
                  className="text-2xl font-semibold text-white/80 hover:text-gold transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}
              <div className="mt-8 flex flex-col gap-3">
                <Link
                  href="/login"
                  className="rounded-lg border border-white/10 px-6 py-3 text-center font-medium text-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-gradient-to-r from-gold to-gold-dark px-6 py-3 text-center font-semibold text-navy"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

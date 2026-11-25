"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, Building2, User } from "lucide-react";

export function CTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-navy to-navy-dark" />
      <div className="absolute inset-0 grid-pattern opacity-30" />

      {/* Gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-gold/5 blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-gold/3 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
            Ready to Transform
            <br />
            <span className="gradient-text">Your Hiring?</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/35">
            Join 2,500+ organizations already using SaudiRecruit to build
            world-class teams. Start for free, upgrade when you&apos;re ready.
          </p>

          {/* CTA Cards */}
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {/* Employer CTA */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link
                href="/register?role=employer"
                className="card-hover group block rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/10 to-gold/5 p-8 text-left transition-all hover:border-gold/40"
              >
                <div className="mb-4 inline-flex rounded-xl bg-gold/20 p-3">
                  <Building2 className="h-6 w-6 text-gold" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">
                  For Employers
                </h3>
                <p className="mb-6 text-sm text-white/40">
                  Post jobs, access AI-matched candidates, and manage your
                  entire hiring pipeline in one place.
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-gold group-hover:gap-3 transition-all">
                  Start Hiring
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </motion.div>

            {/* Job Seeker CTA */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link
                href="/register?role=job_seeker"
                className="card-hover group block rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 text-left transition-all hover:border-white/[0.12]"
              >
                <div className="mb-4 inline-flex rounded-xl bg-white/10 p-3">
                  <User className="h-6 w-6 text-white/70" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-white">
                  For Professionals
                </h3>
                <p className="mb-6 text-sm text-white/40">
                  Create your profile, get matched with premium roles, and
                  take the next step in your career journey.
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 group-hover:text-white group-hover:gap-3 transition-all">
                  Find Opportunities
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

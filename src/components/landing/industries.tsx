"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Building2,
  Cpu,
  Stethoscope,
  GraduationCap,
  HardHat,
  Plane,
} from "lucide-react";

const industries = [
  {
    icon: Building2,
    name: "Oil & Energy",
    roles: "12,000+ roles",
    companies: "ARAMCO, SABIC, ACWA Power",
  },
  {
    icon: Cpu,
    name: "Technology",
    roles: "8,500+ roles",
    companies: "STC, Elm, Lucid Motors",
  },
  {
    icon: HardHat,
    name: "Construction",
    roles: "15,000+ roles",
    companies: "NEOM, Red Sea Global, Roshn",
  },
  {
    icon: Stethoscope,
    name: "Healthcare",
    roles: "6,200+ roles",
    companies: "MOH, KFSH&RC, Johns Hopkins",
  },
  {
    icon: GraduationCap,
    name: "Education",
    roles: "4,100+ roles",
    companies: "KAUST, KAU, Misk Foundation",
  },
  {
    icon: Plane,
    name: "Tourism & Entertainment",
    roles: "9,800+ roles",
    companies: "Qiddiya, MDL Beast, AlUla",
  },
];

export function Industries() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="industries" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy-mid to-navy" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-gold/80">
            Industries
          </span>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
            Powering Recruitment Across
            <br />
            <span className="gradient-text">Every Sector</span>
          </h2>
        </motion.div>

        {/* Industry Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry, i) => {
            const Icon = industry.icon;
            return (
              <IndustryCard key={industry.name} industry={industry} Icon={Icon} index={i} />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function IndustryCard({
  industry,
  Icon,
  index,
}: {
  industry: (typeof industries)[number];
  Icon: typeof Building2;
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="card-hover group relative flex items-center gap-5 rounded-xl border border-white/[0.04] bg-white/[0.015] p-6 backdrop-blur-sm"
    >
      <div className="flex-shrink-0 rounded-lg bg-gold/10 p-3 group-hover:bg-gold/20 transition-colors">
        <Icon className="h-6 w-6 text-gold" />
      </div>
      <div>
        <h3 className="font-bold text-white group-hover:text-gold transition-colors">
          {industry.name}
        </h3>
        <p className="text-sm text-gold/60">{industry.roles}</p>
        <p className="mt-1 text-xs text-white/25">{industry.companies}</p>
      </div>
    </motion.div>
  );
}

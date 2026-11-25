"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  UserPlus,
  Search,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create Your Profile",
    description:
      "Build a comprehensive profile with AI-assisted resume parsing. Employers set up company pages with culture insights and growth trajectories.",
  },
  {
    number: "02",
    icon: Search,
    title: "Smart Discovery",
    description:
      "Our AI engine surfaces the perfect matches. Candidates discover curated roles; employers find pre-vetted talent ranked by compatibility.",
  },
  {
    number: "03",
    icon: MessageSquare,
    title: "Engage & Evaluate",
    description:
      "Conduct structured interviews, skill assessments, and cultural fit evaluations. All within our integrated collaboration suite.",
  },
  {
    number: "04",
    icon: CheckCircle2,
    title: "Hire with Confidence",
    description:
      "Extend offers, manage onboarding, and track 90-day success metrics. Full compliance documentation handled automatically.",
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="relative py-32 overflow-hidden">
      {/* Subtle grid */}
      <div className="absolute inset-0 grid-pattern opacity-50" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-gold/80">
            How It Works
          </span>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
            From Profile to Placement
            <br />
            <span className="gradient-text">in Four Steps</span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold/20 via-gold/10 to-transparent hidden lg:block" />

          <div className="space-y-16 lg:space-y-24">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isEven = i % 2 === 0;

              return (
                <StepItem
                  key={step.number}
                  step={step}
                  Icon={Icon}
                  isEven={isEven}
                  index={i}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepItem({
  step,
  Icon,
  isEven,
  index,
}: {
  step: (typeof steps)[number];
  Icon: typeof UserPlus;
  isEven: boolean;
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: isEven ? -60 : 60 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col lg:flex-row items-center gap-8 lg:gap-16 ${
        isEven ? "" : "lg:flex-row-reverse"
      }`}
    >
      {/* Content */}
      <div
        className={`flex-1 ${isEven ? "lg:text-right" : "lg:text-left"} text-center`}
      >
        <span className="text-5xl font-black text-white/[0.03] block mb-2 lg:text-7xl">
          {step.number}
        </span>
        <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
        <p className="text-white/40 leading-relaxed max-w-md mx-auto lg:mx-0">
          {step.description}
        </p>
      </div>

      {/* Center node */}
      <div className="relative flex-shrink-0">
        <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center glow-gold-sm">
          <Icon className="h-8 w-8 text-gold" />
        </div>
        {/* Pulse ring */}
        <div className="absolute inset-0 rounded-2xl border border-gold/10 animate-ping opacity-20" />
      </div>

      {/* Spacer for alignment */}
      <div className="flex-1 hidden lg:block" />
    </motion.div>
  );
}

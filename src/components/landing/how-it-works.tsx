"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { UserPlus, Search, MessageSquare, CheckCircle } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: UserPlus,
    title: "Create Your Profile",
    description: "Build a comprehensive profile with AI-assisted resume parsing. Employers set up company pages with culture insights and growth trajectories.",
  },
  {
    num: "02",
    icon: Search,
    title: "Smart Discovery",
    description: "Our AI engine matches candidates to roles based on skills, experience, cultural fit, and career aspirations. No more manual searching.",
  },
  {
    num: "03",
    icon: MessageSquare,
    title: "Engage & Evaluate",
    description: "Conduct structured interviews, share scorecards with your team, and collaborate on candidate assessments in real-time.",
  },
  {
    num: "04",
    icon: CheckCircle,
    title: "Hire with Confidence",
    description: "Extend offers, manage onboarding, and track new hire success with integrated analytics and compliance tools.",
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="relative py-32 overflow-hidden" style={{ background: "#080C18" }}>
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none opacity-30" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block text-sm font-semibold uppercase tracking-[0.25em] mb-4" style={{ color: "#D4AF37" }}>How It Works</span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-white">From Profile to Placement</span>
            <br />
            <span style={{ background: "linear-gradient(135deg, #D4AF37, #E8C954)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>in Four Steps</span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="relative max-w-4xl mx-auto">
          {/* Center line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px hidden lg:block" style={{ background: "linear-gradient(to bottom, transparent, rgba(212,175,55,0.2), rgba(212,175,55,0.2), transparent)" }} />

          <div className="space-y-16 lg:space-y-24">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isLeft = i % 2 === 0;

              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className={`relative flex flex-col lg:flex-row items-center gap-8 ${isLeft ? "lg:flex-row" : "lg:flex-row-reverse"}`}
                >
                  {/* Content */}
                  <div className={`flex-1 ${isLeft ? "lg:text-right" : "lg:text-left"}`}>
                    <span className="text-7xl font-bold leading-none" style={{ color: "rgba(212,175,55,0.08)", fontFamily: "'Playfair Display', serif" }}>{step.num}</span>
                    <h3 className="text-2xl font-bold text-white mt-2 mb-3">{step.title}</h3>
                    <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{step.description}</p>
                  </div>

                  {/* Center icon */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)", boxShadow: "0 0 30px rgba(212,175,55,0.1)" }}>
                      <Icon className="w-7 h-7 text-[#D4AF37]" />
                    </div>
                    {/* Pulse ring */}
                    <div className="absolute inset-0 rounded-2xl animate-ping" style={{ border: "1px solid rgba(212,175,55,0.1)", animationDuration: "3s" }} />
                  </div>

                  {/* Spacer for other side */}
                  <div className="flex-1 hidden lg:block" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

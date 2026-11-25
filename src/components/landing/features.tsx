"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Brain, Shield, Globe, Zap, BarChart3, Users } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Matching",
    description: "Our proprietary algorithm analyzes 200+ data points to match candidates with positions, achieving 97% placement accuracy.",
    gradient: "linear-gradient(135deg, #8B5CF6, #6366F1)",
    glow: "rgba(139,92,246,0.15)",
  },
  {
    icon: Shield,
    title: "Saudization Compliance",
    description: "Built-in Nitaqat tracking and compliance tools ensure your workforce meets all Saudi nationalization requirements.",
    gradient: "linear-gradient(135deg, #10B981, #059669)",
    glow: "rgba(16,185,129,0.15)",
  },
  {
    icon: Globe,
    title: "Global Talent Network",
    description: "Access verified professionals from 50+ countries, pre-screened for Saudi work permits and cultural alignment.",
    gradient: "linear-gradient(135deg, #3B82F6, #2563EB)",
    glow: "rgba(59,130,246,0.15)",
  },
  {
    icon: Zap,
    title: "Instant Shortlisting",
    description: "Reduce time-to-hire by 70%. Our platform auto-shortlists candidates within minutes, not weeks.",
    gradient: "linear-gradient(135deg, #F59E0B, #D97706)",
    glow: "rgba(245,158,11,0.15)",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Real-time dashboards with hiring funnels, diversity metrics, cost-per-hire, and predictive workforce planning.",
    gradient: "linear-gradient(135deg, #EF4444, #DC2626)",
    glow: "rgba(239,68,68,0.15)",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Shared candidate pipelines, structured interviews, scorecards, and integrated feedback loops for your hiring team.",
    gradient: "linear-gradient(135deg, #D4AF37, #B8941F)",
    glow: "rgba(212,175,55,0.15)",
  },
];

export function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="relative py-32 overflow-hidden" style={{ background: "#0A0F1C" }}>
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none opacity-50" style={{ background: "radial-gradient(ellipse, rgba(212,175,55,0.06), transparent 70%)" }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block text-sm font-semibold uppercase tracking-[0.25em] mb-4" style={{ color: "#D4AF37" }}>
            Platform Features
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-white">Enterprise Tools for </span>
            <span style={{ background: "linear-gradient(135deg, #D4AF37, #E8C954)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Modern Hiring
            </span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.45)" }}>
            Purpose-built for the Saudi market with enterprise-grade tools that transform how organizations attract, evaluate, and retain world-class professionals.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative p-8 rounded-2xl transition-all duration-500 hover:-translate-y-2 cursor-default"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  e.currentTarget.style.borderColor = "rgba(212,175,55,0.15)";
                  e.currentTarget.style.boxShadow = `0 20px 60px ${feature.glow}, 0 0 0 1px rgba(212,175,55,0.08)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(circle at top right, ${feature.glow}, transparent 70%)` }} />

                {/* Icon */}
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-all duration-500" style={{ background: feature.gradient, boxShadow: `0 8px 24px ${feature.glow}` }}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

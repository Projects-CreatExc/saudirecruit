"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Brain,
  Shield,
  Globe,
  Zap,
  BarChart3,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Matching",
    description:
      "Our proprietary algorithm analyzes 200+ data points to match candidates with positions, achieving 97% placement accuracy.",
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-400",
  },
  {
    icon: Shield,
    title: "Saudization Compliance",
    description:
      "Built-in Nitaqat tracking and compliance tools ensure your workforce meets all Saudi nationalization requirements.",
    gradient: "from-emerald-500/20 to-green-500/20",
    iconColor: "text-emerald-400",
  },
  {
    icon: Globe,
    title: "Global Talent Network",
    description:
      "Access verified professionals from 50+ countries, pre-screened for Saudi work permits and cultural alignment.",
    gradient: "from-purple-500/20 to-violet-500/20",
    iconColor: "text-purple-400",
  },
  {
    icon: Zap,
    title: "Instant Shortlisting",
    description:
      "Reduce time-to-hire by 70%. Our platform auto-shortlists candidates within minutes, not weeks.",
    gradient: "from-gold/20 to-yellow-500/20",
    iconColor: "text-gold",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Real-time dashboards with hiring funnels, diversity metrics, cost-per-hire, and predictive workforce planning.",
    gradient: "from-rose-500/20 to-pink-500/20",
    iconColor: "text-rose-400",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Shared candidate pipelines, structured interviews, scorecards, and integrated feedback loops for your hiring team.",
    gradient: "from-orange-500/20 to-amber-500/20",
    iconColor: "text-orange-400",
  },
];

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[number];
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="card-hover group relative rounded-2xl border border-white/[0.04] bg-white/[0.02] p-8 backdrop-blur-sm"
    >
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-br from-gold/5 to-transparent" />

      <div className="relative z-10">
        {/* Icon */}
        <div
          className={`mb-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} p-3`}
        >
          <Icon className={`h-6 w-6 ${feature.iconColor}`} />
        </div>

        {/* Content */}
        <h3 className="mb-3 text-lg font-bold text-white group-hover:text-gold transition-colors">
          {feature.title}
        </h3>
        <p className="text-sm leading-relaxed text-white/40">
          {feature.description}
        </p>
      </div>

      {/* Corner accent */}
      <div className="absolute top-0 right-0 h-20 w-20 rounded-bl-[80px] bg-gradient-to-bl from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}

export function Features() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 radial-glow-gold" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-gold/80">
            Platform Features
          </span>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
            Everything You Need to
            <br />
            <span className="gradient-text">Hire Exceptional Talent</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/35">
            Purpose-built for the Saudi market with enterprise-grade tools
            that transform how organizations attract, evaluate, and retain
            world-class professionals.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

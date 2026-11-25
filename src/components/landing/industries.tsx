"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Building2, Cpu, Droplets, HardHat, Plane, HeartPulse } from "lucide-react";

const industries = [
  { icon: Droplets, name: "Oil & Gas", desc: "ARAMCO, SABIC, and energy sector placements across upstream, midstream, and downstream operations.", color: "#3B82F6" },
  { icon: HardHat, name: "Construction & Infrastructure", desc: "NEOM, Red Sea Global, and mega-project staffing for Saudi Vision 2030 developments.", color: "#F59E0B" },
  { icon: Cpu, name: "Technology & Digital", desc: "STC, stc pay, and tech ecosystem roles driving Saudi Arabia's digital transformation.", color: "#8B5CF6" },
  { icon: HeartPulse, name: "Healthcare", desc: "Hospital groups, clinics, and medical research centers staffing specialized professionals.", color: "#EF4444" },
  { icon: Plane, name: "Tourism & Hospitality", desc: "Hotels, resorts, and entertainment venues supporting the Kingdom's tourism vision.", color: "#10B981" },
  { icon: Building2, name: "Financial Services", desc: "Banks, fintech, and investment firms building world-class financial teams.", color: "#D4AF37" },
];

export function Industries() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="industries" className="relative py-32 overflow-hidden" style={{ background: "linear-gradient(180deg, #0A0F1C 0%, #0D1328 50%, #0A0F1C 100%)" }}>
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none" style={{ background: "radial-gradient(circle, rgba(212,175,55,0.03) 0%, transparent 70%)" }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block text-sm font-semibold uppercase tracking-[0.25em] mb-4" style={{ color: "#D4AF37" }}>Industries We Serve</span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-white">Powering Talent Across</span>
            <br />
            <span style={{ background: "linear-gradient(135deg, #D4AF37, #E8C954)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Key Sectors</span>
          </h2>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative p-8 rounded-2xl cursor-pointer transition-all duration-500"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  backdropFilter: "blur(10px)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.background = `rgba(255,255,255,0.04)`;
                  el.style.borderColor = `${item.color}33`;
                  el.style.boxShadow = `0 0 40px ${item.color}15`;
                  el.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.background = "rgba(255,255,255,0.02)";
                  el.style.borderColor = "rgba(255,255,255,0.06)";
                  el.style.boxShadow = "none";
                  el.style.transform = "translateY(0)";
                }}
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5" style={{ background: `${item.color}15`, border: `1px solid ${item.color}25` }}>
                  <Icon className="w-7 h-7" style={{ color: item.color }} />
                </div>

                <h3 className="text-xl font-bold text-white mb-3">{item.name}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{item.desc}</p>

                {/* Bottom accent */}
                <div className="absolute bottom-0 left-8 right-8 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: `linear-gradient(90deg, transparent, ${item.color}40, transparent)` }} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

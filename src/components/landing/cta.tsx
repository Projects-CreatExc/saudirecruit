"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-32 overflow-hidden" style={{ background: "linear-gradient(180deg, #0A0F1C 0%, #0D1328 100%)" }}>
      {/* Glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] pointer-events-none" style={{ background: "radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)" }} />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] pointer-events-none" style={{ background: "radial-gradient(circle, rgba(212,175,55,0.03) 0%, transparent 70%)" }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-8" style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.15)" }}>
            <Sparkles className="w-4 h-4" style={{ color: "#D4AF37" }} />
            <span className="text-sm font-medium" style={{ color: "#D4AF37" }}>Start Hiring Smarter Today</span>
          </div>

          {/* Heading */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-white">Ready to Transform</span>
            <br />
            <span style={{ background: "linear-gradient(135deg, #D4AF37, #E8C954)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Your Recruitment?</span>
          </h2>

          <p className="text-lg mb-12 max-w-2xl mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
            Join thousands of companies already using SaudiRecruit to find, evaluate, and hire the best talent for Saudi Arabia&apos;s most ambitious projects.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.a
              href="/register"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #D4AF37, #E8C954)",
                color: "#0A0F1C",
                boxShadow: "0 4px 30px rgba(212,175,55,0.25)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 50px rgba(212,175,55,0.4)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 30px rgba(212,175,55,0.25)"; }}
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </motion.a>

            <motion.a
              href="#features"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold transition-all duration-300"
              style={{
                background: "transparent",
                color: "white",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(212,175,55,0.3)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.background = "transparent"; }}
            >
              Schedule a Demo
            </motion.a>
          </div>

          {/* Trust note */}
          <p className="mt-8 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
            No credit card required &middot; Free 14-day trial &middot; Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    name: "Ahmed Al-Rashid",
    role: "VP of Human Resources",
    company: "ARAMCO",
    quote: "SaudiRecruit transformed our hiring pipeline. We reduced time-to-hire by 60% while maintaining the highest quality standards for specialized engineering roles.",
    rating: 5,
  },
  {
    name: "Sarah Mitchell",
    role: "Chief People Officer",
    company: "NEOM",
    quote: "The AI matching technology is remarkable. We found candidates with exact skill sets for our most challenging mega-project roles within days, not months.",
    rating: 5,
  },
  {
    name: "Dr. Khalid bin Saeed",
    role: "Director of Talent Acquisition",
    company: "STC",
    quote: "Saudization compliance tracking alone saved us hundreds of hours. The platform understands the unique regulatory landscape of Saudi Arabia perfectly.",
    rating: 5,
  },
];

export function Testimonials() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [active, setActive] = useState(0);

  const next = () => setActive((a) => (a + 1) % testimonials.length);
  const prev = () => setActive((a) => (a - 1 + testimonials.length) % testimonials.length);

  return (
    <section className="relative py-32 overflow-hidden" style={{ background: "#080C18" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block text-sm font-semibold uppercase tracking-[0.25em] mb-4" style={{ color: "#D4AF37" }}>Testimonials</span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-white">Trusted by Industry</span>
            <br />
            <span style={{ background: "linear-gradient(135deg, #D4AF37, #E8C954)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Leaders</span>
          </h2>
        </motion.div>

        {/* Testimonial Cards */}
        <div className="relative max-w-4xl mx-auto">
          <div className="relative overflow-hidden">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={{
                  opacity: i === active ? 1 : 0,
                  x: i === active ? 0 : i > active ? 100 : -100,
                  position: i === active ? "relative" as const : "absolute" as const,
                }}
                transition={{ duration: 0.5 }}
                className="w-full"
                style={{
                  top: i === active ? undefined : 0,
                  left: i === active ? undefined : 0,
                  pointerEvents: i === active ? "auto" : "none",
                }}
              >
                <div
                  className="p-10 md:p-14 rounded-3xl text-center"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  {/* Quote icon */}
                  <div className="flex justify-center mb-8">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)" }}>
                      <Quote className="w-6 h-6" style={{ color: "#D4AF37" }} />
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex justify-center gap-1 mb-8">
                    {Array.from({ length: t.rating }).map((_, s) => (
                      <Star key={s} className="w-5 h-5 fill-current" style={{ color: "#D4AF37" }} />
                    ))}
                  </div>

                  {/* Quote text */}
                  <p className="text-lg md:text-xl leading-relaxed mb-10" style={{ color: "rgba(255,255,255,0.7)", fontStyle: "italic" }}>
                    &ldquo;{t.quote}&rdquo;
                  </p>

                  {/* Author */}
                  <div>
                    <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center text-lg font-bold" style={{ background: "linear-gradient(135deg, #D4AF37, #E8C954)", color: "#0A0F1C" }}>
                      {t.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <h4 className="text-white font-bold text-lg">{t.name}</h4>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>{t.role}</p>
                    <p className="text-sm font-semibold" style={{ color: "#D4AF37" }}>{t.company}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-center items-center gap-6 mt-10">
            <button
              onClick={prev}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(212,175,55,0.3)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>

            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                  style={{
                    background: i === active ? "#D4AF37" : "rgba(255,255,255,0.15)",
                    transform: i === active ? "scale(1.3)" : "scale(1)",
                  }}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(212,175,55,0.3)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

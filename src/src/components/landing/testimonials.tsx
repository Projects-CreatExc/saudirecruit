"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Ahmed Al-Rashid",
    role: "VP of Human Resources",
    company: "Saudi Petrochemicals Corp.",
    text: "SaudiRecruit transformed our hiring pipeline. We reduced our time-to-fill from 45 days to just 12 days, while improving candidate quality significantly. The Saudization compliance tools alone saved us hundreds of hours.",
    rating: 5,
    avatar: "AR",
  },
  {
    name: "Sarah Chen",
    role: "Senior Software Engineer",
    company: "Relocated from Singapore",
    text: "The platform made my transition to Saudi Arabia seamless. From visa guidance to cultural preparation, everything was handled professionally. I found my dream role at a NEOM tech startup within two weeks.",
    rating: 5,
    avatar: "SC",
  },
  {
    name: "Mohammed Al-Zahrani",
    role: "Talent Acquisition Director",
    company: "Royal Commission for AlUla",
    text: "We needed to hire 200+ specialists for a mega project within 6 months. SaudiRecruit's AI matching and global talent pool made what seemed impossible entirely achievable. Outstanding platform.",
    rating: 5,
    avatar: "MZ",
  },
  {
    name: "Dr. Fatima Al-Saud",
    role: "Chief Medical Officer",
    company: "King Faisal Specialist Hospital",
    text: "Finding qualified healthcare professionals for Saudi Arabia was always challenging. This platform's verification system and specialized medical talent pool changed everything for our recruitment team.",
    rating: 5,
    avatar: "FS",
  },
];

export function Testimonials() {
  const [active, setActive] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const next = () => setActive((a) => (a + 1) % testimonials.length);
  const prev = () =>
    setActive((a) => (a - 1 + testimonials.length) % testimonials.length);

  return (
    <section id="testimonials" className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 radial-glow-gold" />

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
            Testimonials
          </span>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
            Trusted by <span className="gradient-text">Industry Leaders</span>
          </h2>
        </motion.div>

        {/* Testimonial Card */}
        <div className="mx-auto max-w-4xl">
          <motion.div
            key={active}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-10 md:p-14"
          >
            {/* Quote icon */}
            <Quote className="absolute top-8 right-8 h-12 w-12 text-gold/10" />

            {/* Stars */}
            <div className="flex gap-1 mb-6">
              {Array.from({ length: testimonials[active].rating }).map((_, i) => (
                <Star
                  key={i}
                  className="h-5 w-5 fill-gold text-gold"
                />
              ))}
            </div>

            {/* Text */}
            <p className="text-xl leading-relaxed text-white/70 md:text-2xl md:leading-relaxed font-light">
              &ldquo;{testimonials[active].text}&rdquo;
            </p>

            {/* Author */}
            <div className="mt-10 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-dark text-navy font-bold text-lg">
                {testimonials[active].avatar}
              </div>
              <div>
                <div className="font-bold text-white">
                  {testimonials[active].name}
                </div>
                <div className="text-sm text-white/40">
                  {testimonials[active].role}
                </div>
                <div className="text-sm text-gold/60">
                  {testimonials[active].company}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={prev}
              className="rounded-full border border-white/10 p-3 text-white/40 transition-all hover:border-gold/30 hover:text-gold"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === active
                      ? "w-8 bg-gold"
                      : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="rounded-full border border-white/10 p-3 text-white/40 transition-all hover:border-gold/30 hover:text-gold"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";

function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      gold: boolean;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create particles
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
        gold: Math.random() > 0.7,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.gold
          ? `rgba(212, 175, 55, ${p.opacity})`
          : `rgba(255, 255, 255, ${p.opacity * 0.5})`;
        ctx.fill();
      });

      // Draw connections
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach((b) => {
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(212, 175, 55, ${0.03 * (1 - dist / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
    />
  );
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-navy" />
      <div className="absolute inset-0 grid-pattern" />
      <div className="absolute inset-0 radial-glow-top" />

      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-gold/5 blur-[120px] animate-float" />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full bg-gold/3 blur-[100px] animate-float" style={{ animationDelay: "3s" }} />

      {/* Particles */}
      <FloatingParticles />

      {/* Decorative lines */}
      <div className="absolute left-[20%] top-0 w-px h-full overflow-hidden opacity-10">
        <div className="w-full h-32 bg-gradient-to-b from-transparent via-gold to-transparent animate-line" />
      </div>
      <div className="absolute right-[30%] top-0 w-px h-full overflow-hidden opacity-5">
        <div className="w-full h-48 bg-gradient-to-b from-transparent via-white to-transparent animate-line" style={{ animationDelay: "4s" }} />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-32 pb-20 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 backdrop-blur-sm px-5 py-2 mb-8"
        >
          <Sparkles className="h-4 w-4 text-gold" />
          <span className="text-sm font-medium text-gold">
            Saudi Vision 2030 Certified Platform
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mx-auto max-w-5xl text-5xl font-extrabold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl xl:text-8xl"
        >
          <span className="gradient-text-white">Connecting</span>
          <br />
          <span className="gradient-text text-glow-gold">World-Class Talent</span>
          <br />
          <span className="gradient-text-white">with Saudi Ambition</span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mx-auto mt-8 max-w-2xl text-lg text-white/40 leading-relaxed md:text-xl"
        >
          The premier recruitment platform engineered for the Kingdom&apos;s
          most ambitious organizations. AI-powered matching, seamless hiring,
          and world-class talent acquisition.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Link
            href="/register?role=employer"
            className="btn-premium group flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold-dark px-8 py-4 text-base font-bold text-navy shadow-lg shadow-gold/20"
          >
            Start Hiring Today
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/register?role=job_seeker"
            className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm px-8 py-4 text-base font-semibold text-white transition-all hover:border-white/20 hover:bg-white/10"
          >
            <Play className="h-4 w-4 text-gold" />
            Find Your Next Role
          </Link>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="mt-24 grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-0 md:divide-x md:divide-white/10"
        >
          {[
            { value: "10,000+", label: "Active Positions" },
            { value: "50,000+", label: "Global Professionals" },
            { value: "2,500+", label: "Partner Companies" },
            { value: "97%", label: "Placement Rate" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.3 + i * 0.1 }}
              className="px-4 md:px-8"
            >
              <div className="text-3xl font-bold gradient-text lg:text-4xl">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-white/30">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trusted By */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.6 }}
          className="mt-24"
        >
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/20 mb-8">
            Trusted by leading organizations across the Kingdom
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {["ARAMCO", "NEOM", "STC", "SABIC", "Saudi Telecom", "Red Sea Global"].map(
              (company) => (
                <span
                  key={company}
                  className="text-sm font-semibold tracking-wider text-white/15 hover:text-white/30 transition-colors cursor-default"
                >
                  {company}
                </span>
              )
            )}
          </div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-navy to-transparent" />
    </section>
  );
}

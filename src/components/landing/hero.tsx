"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play, Sparkles } from "lucide-react";

function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${p.opacity})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - p.x;
          const dy = particles[j].y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(212, 175, 55, ${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />;
}

export function Hero() {
  const stats = [
    { value: "10,000+", label: "Active Positions" },
    { value: "50,000+", label: "Global Professionals" },
    { value: "2,500+", label: "Partner Companies" },
    { value: "97%", label: "Placement Rate" },
  ];

  const trustedBy = ["ARAMCO", "NEOM", "STC", "SABIC", "Red Sea Global", "ACWA Power"];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 bg-[#0A0F1C]" />
      <FloatingParticles />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full opacity-60 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, rgba(212,175,55,0.12), transparent 70%)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-40 blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.08), transparent 70%)" }} />

      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-40" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

      {/* Animated lines */}
      <div className="absolute left-[10%] top-0 w-px h-full overflow-hidden pointer-events-none">
        <motion.div className="w-full h-32" style={{ background: "linear-gradient(to bottom, transparent, rgba(212,175,55,0.2), transparent)" }} animate={{ y: ["-100%", "100vh"] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} />
      </div>
      <div className="absolute right-[15%] top-0 w-px h-full overflow-hidden pointer-events-none">
        <motion.div className="w-full h-32" style={{ background: "linear-gradient(to bottom, transparent, rgba(212,175,55,0.1), transparent)" }} animate={{ y: ["-100%", "100vh"] }} transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: 3 }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-8" style={{ border: "1px solid rgba(212,175,55,0.2)", background: "rgba(212,175,55,0.05)", backdropFilter: "blur(12px)" }}>
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-sm font-medium text-[#D4AF37] tracking-wide">Premium Talent Platform for Saudi Arabia</span>
        </motion.div>

        {/* Heading */}
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }} className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1.1] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
          <span className="block text-white" style={{ textShadow: "0 0 60px rgba(255,255,255,0.08)" }}>Connecting</span>
          <span className="block" style={{ background: "linear-gradient(135deg, #D4AF37, #E8C954, #D4AF37)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", textShadow: "none", filter: "drop-shadow(0 0 40px rgba(212,175,55,0.3))" }}>World-Class Talent</span>
          <span className="block text-white/90">with Saudi Ambition</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10 font-light" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Inter', sans-serif" }}>
          The premium recruitment platform built for Saudi Arabia&apos;s Vision 2030. Find exceptional professionals, streamline hiring, and build the workforce of tomorrow.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.45 }} className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <a href="/register" className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5" style={{ background: "linear-gradient(135deg, #D4AF37, #B8941F)", color: "#0A0F1C", boxShadow: "0 4px 20px rgba(212,175,55,0.3)" }}>
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.15), transparent)" }} />
            <span className="relative">Find Opportunities</span>
            <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a href="/register" className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-white font-medium transition-all duration-300 hover:-translate-y-0.5" style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", backdropFilter: "blur(12px)" }}>
            <Play className="w-5 h-5 text-[#D4AF37]" />
            Post a Job
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.6 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto mb-16">
          {stats.map((stat, i) => (
            <div key={i} className="group relative p-6 rounded-2xl transition-all duration-500 hover:-translate-y-1" style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.08), transparent)" }} />
              <div className="relative">
                <div className="text-3xl sm:text-4xl font-bold mb-1" style={{ background: "linear-gradient(135deg, #D4AF37, #E8C954)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{stat.value}</div>
                <div className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Trusted by */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.8 }}>
          <p className="text-xs uppercase font-medium mb-6" style={{ letterSpacing: "0.3em", color: "rgba(255,255,255,0.2)" }}>Trusted by industry leaders</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12">
            {trustedBy.map((company) => (
              <span key={company} className="text-sm md:text-base font-semibold tracking-wider transition-colors duration-300" style={{ color: "rgba(255,255,255,0.15)" }}>{company}</span>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{ background: "linear-gradient(to top, #0A0F1C, transparent)" }} />
    </section>
  );
}

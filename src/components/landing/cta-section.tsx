"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export function CTASection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated background beams
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      // Draw subtle animated beams
      for (let i = 0; i < 5; i++) {
        const x = w * 0.3 + Math.sin(time * 0.3 + i * 1.2) * w * 0.3;
        const y = h * 0.5 + Math.cos(time * 0.2 + i * 0.8) * h * 0.3;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 200);
        gradient.addColorStop(0, `rgba(16, 185, 129, ${0.03 + i * 0.005})`);
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 200, 0, Math.PI * 2);
        ctx.fill();
      }

      // Thin lines
      ctx.strokeStyle = "rgba(63, 63, 70, 0.15)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 3; i++) {
        const startX = 0;
        const startY = h * 0.3 + i * h * 0.2;
        const cp1x = w * 0.3 + Math.sin(time * 0.5 + i) * 50;
        const cp1y = startY + Math.cos(time * 0.3 + i) * 40;
        const cp2x = w * 0.7 + Math.cos(time * 0.4 + i) * 50;
        const cp2y = startY - Math.sin(time * 0.3 + i) * 40;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, w, startY + 20);
        ctx.stroke();
      }

      time += 0.01;
      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
      setEmail("");
    }
  };

  return (
    <section className="relative overflow-hidden border-t border-zinc-800/60 bg-zinc-950">
      {/* Animated canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ opacity: 0.6 }}
      />

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-24 text-center md:py-32">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl md:text-5xl"
        >
          Get the best jobs in your inbox.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          viewport={{ once: true }}
          className="mx-auto mt-4 max-w-md text-sm text-zinc-400 sm:text-base"
        >
          We&apos;ll send you a weekly digest of high-paying engineering roles
          that match your profile. No noise, just signal.
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          onSubmit={handleSubmit}
          className="mx-auto mt-8 flex max-w-md gap-3"
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@awesomecompany.com"
            className="h-12 flex-1 rounded-lg border border-zinc-700/60 bg-zinc-900/80 px-4 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600"
            required
          />
          <button
            type="submit"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-zinc-50 px-5 py-3 text-sm font-semibold text-zinc-900 transition-all hover:bg-white active:scale-95"
          >
            {submitted ? "Subscribed! ✓" : "Subscribe"}
            {!submitted && <Zap className="h-3.5 w-3.5" />}
          </button>
        </motion.form>
      </div>
    </section>
  );
}

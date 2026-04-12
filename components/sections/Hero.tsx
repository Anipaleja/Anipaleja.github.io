"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { personal } from "@/lib/content";

export function Hero() {
  const [wordIndex, setWordIndex] = useState(0);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 400], [0, 55]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setWordIndex((value) => (value + 1) % personal.rotatingWords.length);
    }, 1700);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section id="hero" className="section-shell relative min-h-[72vh] pt-4 sm:pt-8 md:min-h-[88vh] md:pt-20">
      <motion.div style={{ y }} className="relative border-4 border-[var(--line)] bg-[var(--surface)] p-5 shadow-[10px_10px_0_0_#111111] sm:p-6 md:p-10">
        <p className="eyebrow stagger-in" style={{ animationDelay: "100ms" }}>
          {personal.location}
        </p>
        <h1 className="display-xl mt-4 text-[var(--text)]">
          <span className="stagger-in block" style={{ animationDelay: "220ms" }}>
            Anish
          </span>
          <span className="stagger-in -ml-1 block italic" style={{ animationDelay: "320ms" }}>
            Paleja
          </span>
        </h1>
        <p
          className="stagger-in mt-6 max-w-2xl border-l-4 border-[var(--line)] pl-4 text-lg text-[var(--text)] sm:mt-8 sm:text-xl md:text-2xl"
          style={{ animationDelay: "430ms" }}
        >
          {personal.tagline}
        </p>
        <p
          className="stagger-in mt-3 max-w-xl text-sm text-[var(--muted)] sm:text-base"
          style={{ animationDelay: "520ms" }}
        >
          {personal.subTagline}
        </p>

        <div
          className="stagger-in mt-6 inline-flex items-center gap-3 text-xs text-[var(--accent)] sm:mt-8 sm:gap-4 sm:text-sm"
          style={{ animationDelay: "620ms" }}
        >
          <span className="eyebrow text-[var(--accent)]">I am</span>
          <motion.span
            key={personal.rotatingWords[wordIndex]}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="font-semibold"
          >
            {personal.rotatingWords[wordIndex]}
          </motion.span>
        </div>
      </motion.div>
    </section>
  );
}

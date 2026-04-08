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
    <section id="hero" className="section-shell relative min-h-[88vh] pt-14 md:pt-20">
      <motion.div style={{ y }} className="relative border-4 border-[var(--line)] bg-[var(--surface)] p-6 shadow-[10px_10px_0_0_#111111] md:p-10">
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
          className="stagger-in mt-8 max-w-2xl border-l-4 border-[var(--line)] pl-4 text-xl text-[var(--text)] md:text-2xl"
          style={{ animationDelay: "430ms" }}
        >
          {personal.tagline}
        </p>
        <p
          className="stagger-in mt-3 max-w-xl text-base text-[var(--muted)]"
          style={{ animationDelay: "520ms" }}
        >
          {personal.subTagline}
        </p>

        <div
          className="stagger-in mt-8 inline-flex items-center gap-4 text-sm text-[var(--accent)]"
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

      <div className="absolute bottom-8 left-0 flex items-center gap-3 border-2 border-[var(--line)] bg-[#f7f7f2] px-3 py-1 text-xs font-semibold uppercase text-[var(--text)]">
        <span className="h-1 w-10 bg-[var(--line)]" />
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
        >
          scroll
        </motion.span>
      </div>
    </section>
  );
}

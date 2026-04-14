"use client";

import { useState } from "react";
import { contactClosing, personal, socialLinks } from "@/lib/content";

export function Contact() {
  const [joke, setJoke] = useState("Click below to load a random programming joke.");
  const [isLoadingJoke, setIsLoadingJoke] = useState(false);

  const loadJoke = async () => {
    setIsLoadingJoke(true);

    try {
      const response = await fetch("https://official-joke-api.appspot.com/jokes/programming/random", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Could not load joke");
      }

      const payload = (await response.json()) as Array<{ setup?: string; punchline?: string }>;
      const entry = payload[0];

      if (!entry?.setup || !entry?.punchline) {
        throw new Error("Invalid joke payload");
      }

      setJoke(`${entry.setup} ${entry.punchline}`);
    } catch {
      setJoke("The joke API is taking a break. Try again in a moment.");
    } finally {
      setIsLoadingJoke(false);
    }
  };

  return (
    <section id="contact" className="section-shell py-14 md:py-20">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
        <div className="grain-surface p-6 sm:p-8 md:p-10">
          <p className="eyebrow">Contact</p>
          <h2 className="mt-2 text-3xl italic sm:text-4xl md:text-5xl">Let&apos;s build something worth building.</h2>
          <p className="mt-5 text-[var(--text)]">{contactClosing}</p>
          <div className="mt-8 space-y-3">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 border-2 border-[var(--line)] bg-[#f7f7f2] px-3 py-2 text-[var(--text)] transition hover:translate-x-[-2px] hover:translate-y-[-2px]"
              >
                <span className="h-2 w-2 bg-[var(--accent)]" />
                <span className="text-sm">{link.label}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="self-start pb-3 lg:self-end">
          <div className="mb-6 hidden border-2 border-[var(--line)] bg-[#f7f7f2] p-3 shadow-[4px_4px_0_0_#111111] md:block">
            <p className="eyebrow">Mini Flappy</p>
            <div className="mx-auto mt-3 aspect-[9/16] w-full max-w-[360px] overflow-hidden border-2 border-[var(--line)] bg-white">
              <iframe
                src="/flappy-bird/index.html"
                title="Mini Flappy Game"
                className="h-full w-full"
                loading="lazy"
              />
            </div>
          </div>

          <p className="eyebrow">Book a quick call</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {personal.name} - {personal.location}
          </p>
          <p className="mt-6 text-[var(--text)]">
            Skip the form and book time directly on my calendar. We can chat about ideas,
            projects, or anything you are building.
          </p>

          <a
            href="https://cal.com/anish-paleja/quick-call"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-block w-full border-[3px] border-[var(--line)] bg-[var(--accent)] px-6 py-3 text-center text-sm font-semibold uppercase text-[#f7f7f2] shadow-[4px_4px_0_0_#111111] transition hover:translate-x-[-2px] hover:translate-y-[-2px] sm:w-auto"
          >
            Contact / Book Call -&gt;
          </a>

          <div className="mt-8 border-2 border-[var(--line)] bg-[#f7f7f2] p-4 shadow-[4px_4px_0_0_#111111]">
            <p className="mt-2 text-sm font-semibold text-[var(--text)]">Random Dev Joke</p>
            <p className="mt-3 text-sm text-[var(--text)]">{joke}</p>
            <button
              type="button"
              onClick={() => {
                void loadJoke();
              }}
              disabled={isLoadingJoke}
              className="mt-4 border-2 border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold uppercase text-[var(--text)] transition hover:translate-x-[-2px] hover:translate-y-[-2px] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoadingJoke ? "Loading..." : "Load another joke"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

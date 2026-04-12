"use client";

import { FormEvent, useMemo, useState } from "react";
import { contactClosing, personal, socialLinks } from "@/lib/content";

const FALLBACK_CONTACT_ENDPOINT =
  "https://qhfjgwjyddmqobiyjirt.supabase.co/functions/v1/contact";

export function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  const contactEndpoint = useMemo(() => {
    const explicit = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT?.trim();
    if (explicit) {
      return explicit;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    if (!supabaseUrl) {
      return FALLBACK_CONTACT_ENDPOINT;
    }

    try {
      const origin = new URL(supabaseUrl).origin;
      return `${origin}/functions/v1/contact`;
    } catch {
      return FALLBACK_CONTACT_ENDPOINT;
    }
  }, []);

  const canSubmit = useMemo(() => {
    return Boolean(name.trim() && email.trim() && message.trim()) && status !== "sending";
  }, [email, message, name, status]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sending");
    setFeedback("");

    try {
      const response = await fetch(contactEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          message,
          website,
        }),
      });

      const data = (await response.json()) as { error?: string; details?: string };

      if (!response.ok) {
        setStatus("error");
        const detailText = data.details ? ` (${data.details})` : "";
        setFeedback((data.error ?? "Could not send your message. Please try again.") + detailText);
        return;
      }

      setStatus("success");
      setFeedback("Message sent. I will get back to you soon.");
      setName("");
      setEmail("");
      setMessage("");
      setWebsite("");
    } catch {
      setStatus("error");
      setFeedback("Could not send your message. Please try again.");
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

        <form className="self-start pb-3 lg:self-end" onSubmit={onSubmit}>
          <p className="eyebrow">Say Hello</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {personal.name} - {personal.location}
          </p>
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            className="hidden"
            aria-hidden="true"
          />
          <div className="mt-8 space-y-7">
            <label className="block">
              <span className="text-sm font-semibold text-[var(--text)]">Name</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                maxLength={120}
                className="mt-1 w-full border-b-4 border-[var(--line)] bg-transparent px-1 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)]"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-[var(--text)]">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                maxLength={200}
                className="mt-1 w-full border-b-4 border-[var(--line)] bg-transparent px-1 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)]"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-[var(--text)]">Message</span>
              <textarea
                rows={4}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                required
                minLength={8}
                maxLength={5000}
                className="mt-1 w-full resize-none border-b-4 border-[var(--line)] bg-transparent px-1 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)]"
              />
            </label>
            {feedback ? (
              <p
                className={`text-sm ${
                  status === "success" ? "text-[var(--accent)]" : "text-[#a11d1d]"
                }`}
                role="status"
              >
                {feedback}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full border-[3px] border-[var(--line)] bg-[var(--accent)] px-6 py-2 text-sm font-semibold uppercase text-[#f7f7f2] shadow-[4px_4px_0_0_#111111] transition hover:translate-x-[-2px] hover:translate-y-[-2px] sm:w-auto"
            >
              {status === "sending" ? "Sending..." : "Send note ->"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { personal } from "@/lib/content";

function formatTorontoTime(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function SiteFooter() {
  const [time, setTime] = useState("--:--");

  useEffect(() => {
    setTime(formatTorontoTime(new Date()));
    const timer = window.setInterval(() => {
      setTime(formatTorontoTime(new Date()));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return (
    <footer className="section-shell mt-10 pb-8">
      <div className="border-4 border-[var(--line)] bg-[var(--surface-alt)] px-4 py-3 shadow-[6px_6px_0_0_#111111]">
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm font-semibold text-[#f7f7f2]">
          <p>
            © 2026 {personal.name} • All services nominal • {time}
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/anipaleja"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="transition hover:opacity-80"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
                <path d="M12 0a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.41-4.04-1.41-.55-1.38-1.34-1.75-1.34-1.75-1.09-.76.08-.75.08-.75 1.2.09 1.84 1.23 1.84 1.23 1.08 1.84 2.82 1.31 3.5 1 .11-.79.42-1.31.76-1.62-2.67-.3-5.47-1.33-5.47-5.92 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.51 11.51 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.65 1.65.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.6-2.8 5.61-5.48 5.91.43.37.82 1.09.82 2.2v3.26c0 .32.22.7.83.58A12 12 0 0 0 12 0Z" />
              </svg>
            </Link>
            <Link
              href="https://linkedin.com/in/anish-paleja"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="transition hover:opacity-80"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
                <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.15 1.45-2.15 2.95v5.66H9.33V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.56V9h3.56v11.45ZM22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.97 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0Z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

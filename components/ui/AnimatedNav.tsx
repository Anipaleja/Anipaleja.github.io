"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#working-on", label: "Working On" },
  { href: "/blog", label: "Blog" },
  { href: "#contact", label: "Contact" },
];

export function AnimatedNav() {
  const pathname = usePathname();

  const getHref = (href: string) => {
    if (!href.startsWith("#")) {
      return href;
    }

    return pathname === "/" ? href : `/${href}`;
  };

  return (
    <header className="sticky top-0 z-50 pt-2 sm:pt-4">
      <nav className="section-shell flex flex-col gap-3 border-4 border-[var(--line)] bg-[var(--surface-alt)] px-3 py-3 shadow-[6px_6px_0_0_#111111] sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-4">
        <Link
          href="/"
          className="w-fit border-2 border-[var(--line)] bg-[#f7f7f2] px-3 py-1 font-serif text-base tracking-wide text-[var(--text)] transition hover:translate-x-[-2px] hover:translate-y-[-2px] sm:text-lg"
        >
          AP
        </Link>
        <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs sm:items-center sm:justify-end sm:gap-5 sm:text-sm md:gap-8">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link href={getHref(item.href)} className="nav-link font-semibold uppercase tracking-wide text-[var(--text)]">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

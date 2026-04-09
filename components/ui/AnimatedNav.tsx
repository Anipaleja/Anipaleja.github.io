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
    <header className="sticky top-0 z-50 pt-4">
      <nav className="section-shell flex items-center justify-between border-4 border-[var(--line)] bg-[var(--surface-alt)] px-4 py-4 shadow-[6px_6px_0_0_#111111]">
        <Link
          href="/"
          className="border-2 border-[var(--line)] bg-[#f7f7f2] px-3 py-1 font-serif text-lg tracking-wide text-[var(--text)] transition hover:translate-x-[-2px] hover:translate-y-[-2px]"
        >
          AP
        </Link>
        <ul className="flex items-center gap-5 md:gap-8">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link href={getHref(item.href)} className="nav-link text-sm font-semibold uppercase tracking-wide text-[var(--text)]">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

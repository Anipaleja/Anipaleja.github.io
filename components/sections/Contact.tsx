import { contactClosing, personal, socialLinks } from "@/lib/content";

export function Contact() {
  return (
    <section id="contact" className="section-shell py-20">
      <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="grain-surface p-8 md:p-10">
          <p className="eyebrow">Contact</p>
          <h2 className="mt-2 text-5xl italic">Let&apos;s build something worth building.</h2>
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

        <form className="self-end pb-3">
          <p className="eyebrow">Say Hello</p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {personal.name} - {personal.location}
          </p>
          <div className="mt-8 space-y-7">
            <label className="block">
              <span className="text-sm font-semibold text-[var(--text)]">Name</span>
              <input
                type="text"
                className="mt-1 w-full border-b-4 border-[var(--line)] bg-transparent px-1 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)]"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-[var(--text)]">Email</span>
              <input
                type="email"
                className="mt-1 w-full border-b-4 border-[var(--line)] bg-transparent px-1 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)]"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-[var(--text)]">Message</span>
              <textarea
                rows={4}
                className="mt-1 w-full resize-none border-b-4 border-[var(--line)] bg-transparent px-1 py-3 text-[var(--text)] outline-none focus:border-[var(--accent)]"
              />
            </label>
            <button
              type="submit"
              className="border-[3px] border-[var(--line)] bg-[var(--accent)] px-6 py-2 text-sm font-semibold uppercase text-[#f7f7f2] shadow-[4px_4px_0_0_#111111] transition hover:translate-x-[-2px] hover:translate-y-[-2px]"
            >
              Send note -&gt;
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

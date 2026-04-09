export function DinoGame() {
  return (
    <section id="dino-game" className="section-shell py-10 md:py-14">
      <div className="warm-card p-5 md:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
          Chromium Runner
        </p>
        <div className="mt-3 overflow-hidden rounded border-2 border-[var(--line)] bg-[#f7f7f2]">
          <iframe
            src="/trex/index.html"
            title="T-Rex game"
            className="h-[190px] w-full md:h-[210px]"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}


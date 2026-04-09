type SectionDividerProps = {
  flip?: boolean;
};

export function SectionDivider({ flip = false }: SectionDividerProps) {
  return (
    <div className={`pointer-events-none my-8 flex w-full items-center gap-4 ${flip ? "rotate-180" : ""}`}>
      <span className="h-px flex-1 bg-[var(--line)] opacity-20" />
      <span className="relative h-3 w-3 shrink-0 rotate-45 border border-[var(--line)] bg-[var(--accent)] shadow-[2px_2px_0_rgba(17,17,17,0.85)]" />
      <span className="h-px flex-1 bg-[var(--line)] opacity-20" />
    </div>
  );
}

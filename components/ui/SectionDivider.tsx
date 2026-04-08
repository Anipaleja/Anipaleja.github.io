"use client";

type SectionDividerProps = {
  flip?: boolean;
};

export function SectionDivider({ flip = false }: SectionDividerProps) {
  return (
    <div className="pointer-events-none my-8 w-full overflow-hidden">
      <svg
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`h-16 w-full md:h-24 ${flip ? "rotate-180" : ""}`}
        aria-hidden
      >
        <path
          d="M0 92 L90 42 L180 92 L270 42 L360 92 L450 42 L540 92 L630 42 L720 92 L810 42 L900 92 L990 42 L1080 92 L1170 42 L1260 92 L1350 42 L1440 92"
          fill="none"
          stroke="var(--line)"
          strokeWidth="8"
          strokeOpacity="0.18"
        />
        <path
          d="M0 90 L90 40 L180 90 L270 40 L360 90 L450 40 L540 90 L630 40 L720 90 L810 40 L900 90 L990 40 L1080 90 L1170 40 L1260 90 L1350 40 L1440 90 L1440 160 L0 160 Z"
          fill="var(--line)"
        />
        <path
          d="M0 90 L90 40 L180 90 L270 40 L360 90 L450 40 L540 90 L630 40 L720 90 L810 40 L900 90 L990 40 L1080 90 L1170 40 L1260 90 L1350 40 L1440 90"
          fill="none"
          stroke="var(--bg)"
          strokeWidth="2"
          strokeOpacity="0.35"
        />
      </svg>
    </div>
  );
}

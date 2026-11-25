// Decorative SVG for the 404 page: a PCB trace that routes toward the
// center but stops at an open gap — the same "live via" language as
// CircuitBackground, only here the signal never completes.
export function CircuitBreakIllustration({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 360 88"
      className={className ?? "h-24 w-full sm:h-28"}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Base traces — steel reads clearly on both light and dark surfaces */}
      <g
        fill="none"
        stroke="var(--color-steel-accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      >
        <path d="M0 44 H64 V22 H124" />
        <path d="M0 44 H64 V66 H124" />
        <path d="M236 44 H300 V22 H360" />
        <path d="M236 44 H300 V66 H360" />
      </g>

      {/* Live trace up to the break */}
      <g
        fill="none"
        stroke="var(--color-pishnam-gold-500)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.9"
      >
        <path d="M0 44 H64" />
      </g>
      <circle
        cx="64"
        cy="44"
        r="4.5"
        fill="var(--color-pishnam-gold-500)"
        className="motion-safe:animate-circuit-pulse"
      />

      {/* Open gap — dangling ends */}
      <g
        fill="none"
        stroke="var(--color-steel-accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.75"
      >
        <path d="M132 22 H152" strokeDasharray="4 6" />
        <path d="M132 66 H152" strokeDasharray="4 6" />
        <path d="M208 22 H228 V44" strokeDasharray="4 6" />
        <path d="M208 66 H228 V44" strokeDasharray="4 6" />
      </g>

      {/* Dead via on the far side of the break */}
      <circle
        cx="236"
        cy="44"
        r="4"
        fill="var(--color-border)"
        stroke="var(--color-steel-accent)"
        strokeWidth="1.5"
      />

      {/* IC footprint in the gap — unpowered */}
      <g
        stroke="var(--color-steel-accent)"
        strokeWidth="1.5"
        fill="var(--color-bg-surface-alt)"
        opacity="0.9"
      >
        <rect x="156" y="32" width="28" height="24" rx="2" />
        <path d="M156 38 H150" />
        <path d="M156 44 H150" />
        <path d="M156 50 H150" />
        <path d="M184 38 H190" />
        <path d="M184 44 H190" />
        <path d="M184 50 H190" />
      </g>

      {/* Break markers — small X at the gap to read as "disconnected" */}
      <g
        stroke="var(--color-pishnam-gold-500)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.65"
      >
        <path d="M168 38 L176 50" />
        <path d="M176 38 L168 50" />
      </g>
    </svg>
  );
}

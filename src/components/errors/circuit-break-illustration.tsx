// Decorative SVG for the 404 page: a PCB trace that routes toward the
// center but stops at an open gap — the same "live via" language as
// CircuitBackground, only here the signal never completes.
export function CircuitBreakIllustration() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 360 72"
      className="text-border mx-auto h-16 w-full max-w-sm sm:h-18 sm:max-w-md"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Incoming trace — powered up to the break */}
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M0 36 H72 V20 H132" />
        <path d="M0 36 H72 V52 H132" />
      </g>
      <g fill="none" stroke="var(--color-pishnam-gold-500)" strokeWidth="1.5" strokeLinecap="round">
        <path d="M0 36 H72" opacity="0.45" />
      </g>
      <circle
        cx="72"
        cy="36"
        r="3.5"
        fill="var(--color-pishnam-gold-500)"
        className="motion-safe:animate-circuit-pulse"
      />

      {/* Open gap — trace ends hang in the air */}
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
      >
        <path d="M148 20 H168" strokeDasharray="3 5" />
        <path d="M148 52 H168" strokeDasharray="3 5" />
        <path d="M192 20 H212 V36 H228" strokeDasharray="3 5" />
        <path d="M192 52 H212 V36" strokeDasharray="3 5" />
      </g>

      {/* Outgoing trace — never receives the signal */}
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      >
        <path d="M228 36 H300 V20 H360" />
        <path d="M228 36 H300 V52 H360" />
      </g>
      <circle cx="228" cy="36" r="3" fill="currentColor" opacity="0.4" />

      {/* IC footprint in the gap — present but unpowered */}
      <g stroke="currentColor" strokeWidth="1.25" fill="none" opacity="0.35">
        <rect x="168" y="26" width="24" height="20" rx="1.5" />
        <path d="M168 31 H164" />
        <path d="M168 36 H164" />
        <path d="M168 41 H164" />
        <path d="M192 31 H196" />
        <path d="M192 36 H196" />
        <path d="M192 41 H196" />
      </g>
    </svg>
  );
}

// Full-site ambient background: a faint PCB-trace pattern that nods to
// Pishnam's robotics/electronics subject matter without competing with
// content. Pure CSS/SVG, no client JS -- colors are read from the
// design-system tokens in globals.css (docs/03-design-system.md), so the
// pattern follows light/dark mode automatically.
//
// Adapted from the IUST Robotics site's CircuitBackground: same trace/via/
// IC geometry, recolored to the Pishnam palette -- neutral `--color-border`
// for the board traces and `--color-pishnam-gold-500` for the single "live"
// trace and its pulse, in place of the original's generic border/accent
// tokens.
export function CircuitBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <svg
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="pishnam-circuit-tile"
            width="220"
            height="220"
            patternUnits="userSpaceOnUse"
            patternTransform="translate(-20 -20)"
          >
            {/* Base traces -- right-angle runs typical of PCB routing */}
            <g
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            >
              <path d="M0 36 H58 V90 H150 V150 H220" />
              <path d="M20 220 V166 H96 V70 H176 V0" />
              <path d="M0 190 H36 V132 H86" />
              <path d="M140 0 V28 H190 V64 H220" />
              <path d="M0 100 H24" />
              <path d="M196 120 H220" />
            </g>

            {/* Vias / solder pads at trace joints and endpoints */}
            <g fill="var(--color-border)">
              <circle cx="58" cy="36" r="3" />
              <circle cx="58" cy="90" r="3" />
              <circle cx="150" cy="90" r="3" />
              <circle cx="150" cy="150" r="3" />
              <circle cx="20" cy="166" r="3" />
              <circle cx="96" cy="166" r="3" />
              <circle cx="96" cy="70" r="3" />
              <circle cx="176" cy="70" r="3" />
              <circle cx="36" cy="190" r="2.5" />
              <circle cx="36" cy="132" r="2.5" />
              <circle cx="190" cy="28" r="2.5" />
              <circle cx="190" cy="64" r="2.5" />
            </g>

            {/* IC footprint -- small chip outline with pin ticks, a nod to
                the board's components rather than only its wiring */}
            <g stroke="var(--color-border)" strokeWidth="1.25" fill="none">
              <rect x="112" y="104" width="34" height="34" rx="2" />
              {[112, 120, 128, 136].map((x) => (
                <path key={`t-${x}`} d={`M${x} 104 V98`} />
              ))}
              {[112, 120, 128, 136].map((x) => (
                <path key={`b-${x}`} d={`M${x} 138 V144`} />
              ))}
              {[110, 118, 126, 134].map((y) => (
                <path key={`l-${y}`} d={`M112 ${y} H106`} />
              ))}
              {[110, 118, 126, 134].map((y) => (
                <path key={`r-${y}`} d={`M146 ${y} H152`} />
              ))}
            </g>

            {/* One "live" trace picked out in Pishnam gold, with a slow
                pulse on its via -- the board is powered, not inert */}
            <g
              fill="none"
              stroke="var(--color-pishnam-gold-500)"
              strokeWidth="1.25"
              strokeLinecap="round"
            >
              <path d="M0 100 H24 V60 H58" opacity="0.35" />
            </g>
            <circle
              cx="24"
              cy="100"
              r="3"
              fill="var(--color-pishnam-gold-500)"
              className="animate-circuit-pulse"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pishnam-circuit-tile)" opacity="0.45" />
      </svg>
      {/* Soft vignette so the pattern recedes toward the page edges rather
          than reading as a uniform tile */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--color-bg-page)_85%)] opacity-70" />
    </div>
  );
}

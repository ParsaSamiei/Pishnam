import Image from "next/image";
import { TiltCard } from "@/components/motion/tilt-card";
import { HeroCarousel, type HeroCarouselSlide } from "./hero-carousel";

interface HeroShowcaseProps {
  /**
   * Photos from the `HeroSlide` table, in carousel order, with alt text already
   * resolved for the active locale. Managed at /admin/hero-slides.
   *
   * Empty is an expected state, not an error: docs/03-design-system.md asks for
   * photography on anything competition- or student-facing, and this is the most
   * valuable slot on the site for it, but the hero has to look finished before
   * anyone has uploaded anything -- so zero slides renders the line-art board
   * below.
   */
  slides: HeroCarouselSlide[];
}

/**
 * Keep in sync with `SIZES` in hero-carousel.tsx, which sizes the same box on
 * the multi-photo path.
 */
const SIZES = "(min-width: 1024px) 46vw, 100vw";

/**
 * The hero's visual half: the photos (or the placeholder board) inside a panel
 * dressed as a piece of hardware -- gold corner brackets, an offset backing
 * frame, a bloom behind it. The band was previously copy on one side and empty
 * navy on the other; this is what occupies the other side.
 *
 * The panel chrome is written once and the media slot swapped beneath it, so
 * one photo, five photos, and none all sit in the same frame.
 *
 * Every offset here is logical (`start`/`end`, `border-s`, `rounded-ss`) so the
 * whole assembly mirrors with `dir` instead of needing an RTL variant.
 */
export function HeroShowcase({ slides }: HeroShowcaseProps) {
  const [first] = slides;

  return (
    <div className="relative">
      {/* Bloom. Sits outside the frame so the panel edge stays crisp while the
          navy around it lifts -- this is what keeps the band from reading flat
          once the dot field is behind a solid shape. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-10 bg-[radial-gradient(55%_55%_at_50%_45%,rgb(230_168_23/0.2),transparent_72%)]"
      />

      {/* Backing frame, offset toward the bottom inline-start corner. Two
          parallel edges read as depth far more cheaply than a drop shadow does
          on a dark background, where shadows have almost nothing to fall on. */}
      <div
        aria-hidden="true"
        className="border-pishnam-gold-500/25 pointer-events-none absolute -start-3 end-8 top-8 -bottom-3 rounded-2xl border"
      />

      {/* Tilt disabled on the carousel path: both it and Embla's drag track the
          same mouse-move, and the panel tipping in 3D while someone drags
          between slides reads as the two fighting each other. The hover lift
          (`whileHover`, not gated by `tilt`) still applies either way. */}
      <TiltCard className="relative" tilt={slides.length <= 1}>
        {/* Explicit navy, not a tint relative to whatever sits behind the
            panel: hero-section.tsx's background is theme-aware, and this
            panel deliberately isn't (`docs/03-design-system.md`'s hardware
            aesthetic holds regardless of the visitor's light/dark choice).
            A translucent white overlay would leave almost no visible panel
            on a light page, and PlaceholderBoard's off-white line-art below
            needs a dark floor to read against either way. */}
        <div className="bg-pishnam-navy-900 relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/12 shadow-[0_32px_64px_-32px_rgb(0_0_0/0.75)]">
          {slides.length > 1 ? (
            <HeroCarousel slides={slides} />
          ) : first ? (
            // One photo is not a carousel: dots and arrows that can only ever
            // point at the thing already on screen are noise. Nothing here
            // hydrates -- no controls, no scroll observer, no live region, and
            // nothing announced as a carousel. (The import above is static, so
            // the carousel's chunk still rides along with the page; making it
            // conditional would cost the multi-photo case a late-arriving
            // widget above the fold, which is the worse trade.)
            <Image
              src={first.image}
              alt={first.alt}
              fill
              // Above the fold and the largest element in the band, so this is
              // the LCP candidate: `priority` preloads it rather than letting
              // it queue behind the lazy-loading default.
              priority
              className="object-contain"
              sizes={SIZES}
            />
          ) : (
            <PlaceholderBoard />
          )}

          {/* Scrim toward the bottom edge, where the band's own gold seam trace
              runs underneath. Without it a bright photo bottom collides with
              the trace; with it the panel settles into the band.

              `pointer-events-none` matters on the carousel path: this covers
              the whole frame, and without it every swipe aimed at the track
              would land here instead. */}
          <div
            aria-hidden="true"
            className="from-pishnam-navy-900/70 pointer-events-none absolute inset-0 bg-linear-to-t to-transparent to-55%"
          />

          {/* Corner brackets -- the reticle/silkscreen motif, and the one place
              the gold touches the photo itself. */}
          <span
            aria-hidden="true"
            className="border-pishnam-gold-500/55 pointer-events-none absolute start-3 top-3 size-6 rounded-ss-md border-s-2 border-t-2"
          />
          <span
            aria-hidden="true"
            className="border-pishnam-gold-500/55 pointer-events-none absolute end-3 top-3 size-6 rounded-se-md border-e-2 border-t-2"
          />
          <span
            aria-hidden="true"
            className="border-pishnam-gold-500/55 pointer-events-none absolute start-3 bottom-3 size-6 rounded-es-md border-s-2 border-b-2"
          />
          <span
            aria-hidden="true"
            className="border-pishnam-gold-500/55 pointer-events-none absolute end-3 bottom-3 size-6 rounded-ee-md border-e-2 border-b-2"
          />
        </div>
      </TiltCard>
    </div>
  );
}

/**
 * Stand-in for the photo: the same PCB vocabulary as
 * components/layout/circuit-background.tsx, resolved into a single chip-robot
 * so the frame holds a subject rather than a texture. Purely decorative --
 * `aria-hidden`, no alt text, nothing here carries meaning a photo would.
 */
function PlaceholderBoard() {
  return (
    <div aria-hidden="true" className="absolute inset-0">
      <svg
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Board traces feeding the chip from all four edges */}
        <g
          fill="none"
          stroke="var(--color-pishnam-off-white)"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.14"
        >
          <path d="M0 54 H74 V104 H136" />
          <path d="M400 42 H322 V96 H264" />
          <path d="M0 246 H92 V196 H140" />
          <path d="M400 258 H310 V204 H262" />
          <path d="M40 300 V270 H74" />
          <path d="M360 0 V34 H326" />
          <path d="M0 150 H52" />
          <path d="M348 150 H400" />
        </g>
        <g fill="var(--color-pishnam-off-white)" opacity="0.18">
          <circle cx="74" cy="54" r="3" />
          <circle cx="74" cy="104" r="3" />
          <circle cx="322" cy="42" r="3" />
          <circle cx="322" cy="96" r="3" />
          <circle cx="92" cy="246" r="3" />
          <circle cx="92" cy="196" r="3" />
          <circle cx="310" cy="258" r="3" />
          <circle cx="310" cy="204" r="3" />
          <circle cx="52" cy="150" r="2.5" />
          <circle cx="348" cy="150" r="2.5" />
        </g>

        {/* The chip-robot: the logo's own conceit -- a head that is also an IC
            -- drawn in gold line-art. Pins on all four sides, antenna up. */}
        <g
          fill="none"
          stroke="var(--color-pishnam-gold-500)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.75"
        >
          <path d="M200 66 V44" />
          <rect x="140" y="96" width="120" height="108" rx="14" />
          {/* Side pins */}
          {[122, 150, 178].map((y) => (
            <path key={`pl-${y}`} d={`M140 ${y} H118`} />
          ))}
          {[122, 150, 178].map((y) => (
            <path key={`pr-${y}`} d={`M260 ${y} H282`} />
          ))}
          {[170, 200, 230].map((x) => (
            <path key={`pb-${x}`} d={`M${x} 204 V226`} />
          ))}
        </g>
        <circle cx="200" cy="38" r="7" fill="var(--color-pishnam-gold-500)" opacity="0.85" />

        {/* Eyes, and the mouth grille. Filled rather than stroked so the face
            reads at the small end of the responsive range too. */}
        <g fill="var(--color-pishnam-gold-500)">
          <rect x="164" y="126" width="22" height="22" rx="5" opacity="0.9" />
          <rect x="214" y="126" width="22" height="22" rx="5" opacity="0.9" />
          <g opacity="0.45">
            <rect x="168" y="170" width="64" height="6" rx="3" />
            <rect x="180" y="182" width="40" height="6" rx="3" />
          </g>
        </g>
      </svg>
    </div>
  );
}

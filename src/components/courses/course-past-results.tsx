import { Reveal } from "@/components/motion/reveal";

interface CoursePastResultsProps {
  text: string;
  eyebrow: string;
  title: string;
}

/** Quiet narrative block for optional past-years results text. */
export function CoursePastResults({ text, eyebrow, title }: CoursePastResultsProps) {
  if (!text.trim()) return null;

  return (
    <Reveal className="mt-10">
      <section
        className="from-pishnam-navy-900/[0.04] via-bg-surface to-pishnam-gold-500/[0.06] relative overflow-hidden rounded-2xl bg-gradient-to-br p-5 sm:p-6"
        aria-labelledby="course-past-results-heading"
      >
        <div
          className="bg-pishnam-gold-500/40 pointer-events-none absolute inset-y-4 start-0 w-1 rounded-full"
          aria-hidden="true"
        />
        <p className="text-pishnam-gold-600 ps-3 text-xs font-bold tracking-wide uppercase">
          {eyebrow}
        </p>
        <h2
          id="course-past-results-heading"
          className="text-text-primary mt-1 ps-3 text-lg font-bold"
        >
          {title}
        </h2>
        <p className="reading-copy text-text-secondary mt-3 ps-3 text-sm leading-relaxed whitespace-pre-line">
          {text}
        </p>
      </section>
    </Reveal>
  );
}

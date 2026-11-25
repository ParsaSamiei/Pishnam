import { Check } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

interface CourseLearningOutcomesProps {
  outcomes: string[];
  title: string;
}

/**
 * Signature section for the course page: a vertical "capability ledger" —
 * gold check ticks on a start-edge navy rule, not generic numbered cards.
 */
export function CourseLearningOutcomes({ outcomes, title }: CourseLearningOutcomesProps) {
  if (outcomes.length === 0) return null;

  return (
    <section className="mt-10" aria-labelledby="course-outcomes-heading">
      <Reveal from="start">
        <h2 id="course-outcomes-heading" className="text-text-primary text-lg font-bold">
          {title}
        </h2>
      </Reveal>

      <ol className="border-pishnam-navy-900/15 relative mt-5 space-y-0 border-s-2 ps-0">
        {outcomes.map((outcome, index) => (
          <Reveal key={`${index}-${outcome}`} delay={0.06 * index} as="li" className="relative">
            <div className="group flex gap-3 py-2.5 ps-5">
              <span
                className="bg-pishnam-gold-500 text-pishnam-navy-900 absolute start-0 top-1/2 flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-[0_0_0_3px_var(--color-bg-surface)] transition-transform duration-200 ease-out group-hover:scale-110 rtl:translate-x-1/2"
                aria-hidden="true"
              >
                <Check className="size-3.5 stroke-[2.5]" />
              </span>
              <p className="reading-copy text-text-primary text-sm leading-relaxed sm:text-[0.95rem]">
                {outcome}
              </p>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

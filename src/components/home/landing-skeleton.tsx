import { Skeleton } from "@/components/ui/skeleton";

/**
 * Above-the-fold loading shell for the homepage. Mirrors the hero + audience
 * entry layout so the page doesn't jump when content arrives.
 */
export function LandingSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>

      {/* Hero — copy column + showcase panel */}
      <section className="bg-bg-page relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-12">
            <div className="max-w-2xl lg:col-span-7 lg:max-w-none">
              <Skeleton className="h-7 w-36 rounded-full" />
              <Skeleton className="mt-5 h-10 w-[92%] sm:h-12" />
              <Skeleton className="mt-3 h-10 w-[70%] sm:h-12" />
              <Skeleton className="mt-5 h-4 w-full max-w-xl" />
              <Skeleton className="mt-2 h-4 w-[85%] max-w-lg" />
              <Skeleton className="mt-2 h-4 w-[60%] max-w-md" />
              <div className="mt-9 flex flex-wrap gap-3">
                <Skeleton className="h-12 w-36 rounded-md" />
                <Skeleton className="h-12 w-32 rounded-md" />
              </div>
            </div>

            <div className="w-full max-w-md lg:col-span-5 lg:max-w-none">
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -inset-10 bg-[radial-gradient(55%_55%_at_50%_45%,rgb(230_168_23/0.12),transparent_72%)]"
                />
                <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audience entry cards */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-56 sm:h-9" />
        <Skeleton className="mt-3 h-4 w-72 max-w-full" />

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="border-border bg-bg-surface flex flex-col gap-4 rounded-xl border p-6 shadow-sm"
            >
              <Skeleton className="size-10 rounded-lg" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="mt-auto h-4 w-24" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

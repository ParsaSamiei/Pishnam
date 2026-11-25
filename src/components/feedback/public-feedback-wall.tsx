import type { FeedbackVoteValue } from "@prisma/client";
import { formatDate } from "@/lib/format";
import type { AppLocale } from "@/lib/i18n/routing";
import { FeedbackVoteButtons, type FeedbackVoteLabels } from "./feedback-vote-buttons";

export interface PublicFeedbackItem {
  id: string;
  name: string | null;
  message: string;
  likeCount: number;
  dislikeCount: number;
  createdAt: Date;
  myVote: FeedbackVoteValue | null;
}

interface PublicFeedbackWallProps {
  locale: AppLocale;
  items: PublicFeedbackItem[];
  title: string;
  subtitle: string;
  empty: string;
  anonymousLabel: string;
  voteLabels: FeedbackVoteLabels;
}

export function PublicFeedbackWall({
  locale,
  items,
  title,
  subtitle,
  empty,
  anonymousLabel,
  voteLabels,
}: PublicFeedbackWallProps) {
  return (
    <section
      aria-labelledby="public-feedback-heading"
      className="mx-auto max-w-2xl min-w-0 px-4 pb-16 sm:px-6 lg:px-8"
    >
      <div className="mb-6">
        <h2
          id="public-feedback-heading"
          className="text-text-primary text-xl font-bold sm:text-2xl"
        >
          {title}
        </h2>
        <p className="text-text-secondary mt-1.5 text-sm leading-relaxed">{subtitle}</p>
      </div>

      {items.length === 0 ? (
        <p className="text-text-secondary border-border bg-bg-surface-alt rounded-xl border border-dashed px-5 py-10 text-center text-sm">
          {empty}
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {items.map((item) => {
            const displayName = item.name?.trim() || anonymousLabel;
            return (
              <li
                key={item.id}
                className="border-border bg-bg-surface rounded-xl border p-5 shadow-sm sm:p-6"
              >
                <article className="flex min-w-0 flex-col gap-4">
                  <header className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <h3 className="text-text-primary text-sm font-semibold">{displayName}</h3>
                    <time
                      dateTime={item.createdAt.toISOString()}
                      className="text-text-secondary text-xs"
                    >
                      {formatDate(item.createdAt, locale)}
                    </time>
                  </header>

                  <p className="text-text-primary text-sm leading-relaxed whitespace-pre-line">
                    {item.message}
                  </p>

                  <FeedbackVoteButtons
                    feedbackId={item.id}
                    initialLikeCount={item.likeCount}
                    initialDislikeCount={item.dislikeCount}
                    initialMyVote={item.myVote}
                    labels={voteLabels}
                    locale={locale}
                  />
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

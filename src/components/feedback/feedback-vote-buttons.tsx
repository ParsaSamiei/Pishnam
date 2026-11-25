"use client";

import { useState, useTransition } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import type { FeedbackVoteValue } from "@prisma/client";
import { voteFeedback } from "@/lib/actions/feedback-vote";
import { cn } from "@/lib/utils";

export interface FeedbackVoteLabels {
  like: string;
  dislike: string;
  likeCount: string;
  dislikeCount: string;
  error: string;
}

interface FeedbackVoteButtonsProps {
  feedbackId: string;
  initialLikeCount: number;
  initialDislikeCount: number;
  initialMyVote: FeedbackVoteValue | null;
  labels: FeedbackVoteLabels;
  locale: string;
}

export function FeedbackVoteButtons({
  feedbackId,
  initialLikeCount,
  initialDislikeCount,
  initialMyVote,
  labels,
  locale,
}: FeedbackVoteButtonsProps) {
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [dislikeCount, setDislikeCount] = useState(initialDislikeCount);
  const [myVote, setMyVote] = useState<FeedbackVoteValue | null>(initialMyVote);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const numberLocale = locale === "fa" ? "fa-IR" : "en-US";

  function handleVote(value: FeedbackVoteValue) {
    if (isPending || myVote === value) return;
    setError(null);

    startTransition(async () => {
      const result = await voteFeedback(feedbackId, value);
      if (result.status === "success") {
        setLikeCount(result.likeCount);
        setDislikeCount(result.dislikeCount);
        setMyVote(result.myVote);
      } else {
        setError(labels.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex flex-wrap items-center gap-2"
        role="group"
        aria-label={`${labels.like} / ${labels.dislike}`}
      >
        <button
          type="button"
          onClick={() => handleVote("like")}
          disabled={isPending}
          aria-pressed={myVote === "like"}
          aria-label={`${labels.like}, ${labels.likeCount}: ${likeCount}`}
          className={cn(
            "inline-flex min-h-11 min-w-11 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors duration-200",
            "focus-visible:ring-pishnam-gold-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
            "disabled:pointer-events-none disabled:opacity-60",
            myVote === "like"
              ? "border-pishnam-success/40 bg-pishnam-success/10 text-pishnam-success"
              : "border-border bg-bg-surface text-text-secondary hover:border-pishnam-success/35 hover:text-pishnam-success",
          )}
        >
          <ThumbsUp className="size-4 shrink-0" aria-hidden="true" />
          <span>{labels.like}</span>
          <span className="tabular-nums">{likeCount.toLocaleString(numberLocale)}</span>
        </button>

        <button
          type="button"
          onClick={() => handleVote("dislike")}
          disabled={isPending}
          aria-pressed={myVote === "dislike"}
          aria-label={`${labels.dislike}, ${labels.dislikeCount}: ${dislikeCount}`}
          className={cn(
            "inline-flex min-h-11 min-w-11 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors duration-200",
            "focus-visible:ring-pishnam-gold-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
            "disabled:pointer-events-none disabled:opacity-60",
            myVote === "dislike"
              ? "border-pishnam-danger/40 bg-pishnam-danger/10 text-pishnam-danger"
              : "border-border bg-bg-surface text-text-secondary hover:border-pishnam-danger/35 hover:text-pishnam-danger",
          )}
        >
          <ThumbsDown className="size-4 shrink-0" aria-hidden="true" />
          <span>{labels.dislike}</span>
          <span className="tabular-nums">{dislikeCount.toLocaleString(numberLocale)}</span>
        </button>
      </div>

      {error ? (
        <p role="alert" className="text-pishnam-danger text-xs">
          {error}
        </p>
      ) : null}
    </div>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import type { FeedbackVoteValue } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { resolveVoterKey } from "@/lib/feedback-voter";

const voteSchema = z.object({
  feedbackId: z.string().min(1),
  value: z.enum(["like", "dislike"]),
});

export type VoteFeedbackResult =
  | {
      status: "success";
      likeCount: number;
      dislikeCount: number;
      myVote: FeedbackVoteValue;
    }
  | { status: "error"; message: string };

function revalidatePublicFeedback() {
  revalidatePath("/feedback");
  revalidatePath("/en/feedback");
}

/**
 * Cast or switch a guest vote on an approved feedback message.
 * One vote per (feedback, IP-bound voter key); switching like↔dislike adjusts counts.
 */
export async function voteFeedback(
  feedbackId: string,
  value: "like" | "dislike",
): Promise<VoteFeedbackResult> {
  const parsed = voteSchema.safeParse({ feedbackId, value });
  if (!parsed.success) {
    return { status: "error", message: "invalid" };
  }

  const ip = getClientIp(await headers());
  // Cap flip-flopping; identity is IP-bound so cookie resets cannot mint new votes.
  const globalLimit = rateLimit(`feedback-vote:${ip}`, 30, 10 * 60 * 1000);
  const perMessageLimit = rateLimit(
    `feedback-vote:${ip}:${parsed.data.feedbackId}`,
    10,
    10 * 60 * 1000,
  );
  if (!globalLimit.success || !perMessageLimit.success) {
    return { status: "error", message: "rate_limit" };
  }

  let voterKey: string;
  try {
    voterKey = resolveVoterKey(ip);
  } catch {
    return { status: "error", message: "failed" };
  }
  const nextValue = parsed.data.value as FeedbackVoteValue;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const feedback = await tx.feedback.findUnique({
        where: { id: parsed.data.feedbackId },
        select: { id: true, approved: true, likeCount: true, dislikeCount: true },
      });

      if (!feedback || !feedback.approved) {
        return null;
      }

      const existing = await tx.feedbackVote.findUnique({
        where: {
          feedbackId_voterKey: {
            feedbackId: feedback.id,
            voterKey,
          },
        },
      });

      if (existing?.value === nextValue) {
        return {
          likeCount: feedback.likeCount,
          dislikeCount: feedback.dislikeCount,
          myVote: nextValue,
        };
      }

      let likeDelta = 0;
      let dislikeDelta = 0;

      if (!existing) {
        if (nextValue === "like") likeDelta = 1;
        else dislikeDelta = 1;

        await tx.feedbackVote.create({
          data: {
            feedbackId: feedback.id,
            voterKey,
            value: nextValue,
          },
        });
      } else {
        // Switch like ↔ dislike
        if (existing.value === "like" && nextValue === "dislike") {
          likeDelta = -1;
          dislikeDelta = 1;
        } else if (existing.value === "dislike" && nextValue === "like") {
          likeDelta = 1;
          dislikeDelta = -1;
        }

        await tx.feedbackVote.update({
          where: { id: existing.id },
          data: { value: nextValue },
        });
      }

      const updated = await tx.feedback.update({
        where: { id: feedback.id },
        data: {
          likeCount: { increment: likeDelta },
          dislikeCount: { increment: dislikeDelta },
        },
        select: { likeCount: true, dislikeCount: true },
      });

      return {
        likeCount: updated.likeCount,
        dislikeCount: updated.dislikeCount,
        myVote: nextValue,
      };
    });

    if (!result) {
      return { status: "error", message: "not_found" };
    }

    revalidatePublicFeedback();
    return { status: "success", ...result };
  } catch {
    return { status: "error", message: "failed" };
  }
}

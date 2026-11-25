-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "approved" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Feedback" ADD COLUMN     "likeCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Feedback" ADD COLUMN     "dislikeCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Feedback_approved_createdAt_idx" ON "Feedback"("approved", "createdAt");

-- CreateEnum
CREATE TYPE "FeedbackVoteValue" AS ENUM ('like', 'dislike');

-- CreateTable
CREATE TABLE "FeedbackVote" (
    "id" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "voterKey" TEXT NOT NULL,
    "value" "FeedbackVoteValue" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeedbackVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeedbackVote_feedbackId_idx" ON "FeedbackVote"("feedbackId");

-- CreateIndex
CREATE UNIQUE INDEX "FeedbackVote_feedbackId_voterKey_key" ON "FeedbackVote"("feedbackId", "voterKey");

-- AddForeignKey
ALTER TABLE "FeedbackVote" ADD CONSTRAINT "FeedbackVote_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "Feedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;

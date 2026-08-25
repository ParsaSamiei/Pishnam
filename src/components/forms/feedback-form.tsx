"use client";

import { useActionState, useEffect } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitFeedback, type SubmitFeedbackState } from "@/lib/actions/feedback";
import { track } from "@/lib/analytics";

interface FeedbackFormProps {
  nameLabel: string;
  nameHint: string;
  messageLabel: string;
  messageHint?: string;
  messagePlaceholder?: string;
  submitLabel: string;
  successTitle: string;
  successBody: string;
}

const initialState: SubmitFeedbackState = { status: "idle" };

export function FeedbackForm({
  nameLabel,
  nameHint,
  messageLabel,
  messageHint,
  messagePlaceholder,
  submitLabel,
  successTitle,
  successBody,
}: FeedbackFormProps) {
  const [state, formAction, isPending] = useActionState(submitFeedback, initialState);

  useEffect(() => {
    if (state.status === "success") {
      track("feedback_form_submit");
    }
  }, [state.status]);

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="border-pishnam-success/30 bg-pishnam-success/10 flex flex-col items-center gap-2 rounded-xl border p-8 text-center"
      >
        <CheckCircle2 className="text-pishnam-success size-8" aria-hidden="true" />
        <p className="text-text-primary font-bold">{successTitle}</p>
        <p className="text-text-secondary text-sm">{successBody}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="relative flex min-w-0 flex-col gap-4" noValidate>
      {/* Honeypot: zero-size clip in place — off-canvas left/start offsets expand page scroll. */}
      <div
        className="pointer-events-none absolute top-0 left-0 h-0 w-0 overflow-hidden opacity-0"
        aria-hidden="true"
      >
        <label htmlFor="feedback-website">Website</label>
        <input id="feedback-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex min-w-0 flex-col gap-1.5">
        <Label htmlFor="feedback-name">{nameLabel}</Label>
        <Input
          id="feedback-name"
          name="name"
          autoComplete="name"
          aria-describedby="feedback-name-hint"
          aria-invalid={Boolean(state.errors?.name)}
        />
        <p id="feedback-name-hint" className="text-text-secondary text-xs">
          {nameHint}
        </p>
        {state.errors?.name ? (
          <p className="text-pishnam-danger text-xs">{state.errors.name}</p>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-col gap-1.5">
        <Label htmlFor="feedback-message">{messageLabel}</Label>
        <Textarea
          id="feedback-message"
          name="message"
          required
          rows={6}
          placeholder={messagePlaceholder}
          aria-describedby={messageHint ? "feedback-message-hint" : undefined}
          aria-invalid={Boolean(state.errors?.message)}
        />
        {messageHint ? (
          <p id="feedback-message-hint" className="text-text-secondary text-xs">
            {messageHint}
          </p>
        ) : null}
        {state.errors?.message ? (
          <p className="text-pishnam-danger text-xs">{state.errors.message}</p>
        ) : null}
      </div>

      {state.status === "error" && state.message ? (
        <p role="alert" className="text-pishnam-danger text-sm font-medium">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={isPending} className="mt-2 cursor-pointer">
        {isPending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        {submitLabel}
      </Button>
    </form>
  );
}

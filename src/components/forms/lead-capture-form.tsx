"use client";

import { useActionState, useEffect } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { submitLead, type SubmitLeadState } from "@/lib/actions/lead";
import { track, type AnalyticsEvent } from "@/lib/analytics";
import type { LeadTypeValue } from "@/lib/validation/lead";

export interface LeadExtraField {
  /** Submitted as `metadata.<name>` and stored in Lead.metadata. */
  name: string;
  label: string;
  type?: "text" | "textarea" | "select";
  options?: { value: string; label: string }[];
  required?: boolean;
  defaultValue?: string;
}

interface LeadCaptureFormProps {
  leadType: LeadTypeValue;
  analyticsEvent: AnalyticsEvent;
  submitLabel: string;
  extraFields?: LeadExtraField[];
  successTitle: string;
  successBody?: string;
  messageLabel?: string;
  messagePlaceholder?: string;
}

const initialState: SubmitLeadState = { status: "idle" };

export function LeadCaptureForm({
  leadType,
  analyticsEvent,
  submitLabel,
  extraFields = [],
  successTitle,
  successBody,
  messageLabel = "توضیحات",
  messagePlaceholder,
}: LeadCaptureFormProps) {
  const [state, formAction, isPending] = useActionState(submitLead, initialState);

  useEffect(() => {
    if (state.status === "success") {
      track(analyticsEvent);
    }
  }, [state.status, analyticsEvent]);

  if (state.status === "success") {
    return (
      <div
        role="status"
        className="border-pishnam-success/30 bg-pishnam-success/10 flex flex-col items-center gap-2 rounded-xl border p-8 text-center"
      >
        <CheckCircle2 className="text-pishnam-success size-8" aria-hidden="true" />
        <p className="text-text-primary font-bold">{successTitle}</p>
        {successBody && <p className="text-text-secondary text-sm">{successBody}</p>}
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="type" value={leadType} />

      {/* Honeypot: invisible to sighted users and screen readers, removed
          from tab order. Real users never touch it; bots that blindly fill
          every input do. */}
      <div className="absolute start-[-9999px]" aria-hidden="true">
        <label htmlFor="lead-website">Website</label>
        <input id="lead-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lead-name">نام و نام خانوادگی *</Label>
        <Input id="lead-name" name="name" required aria-invalid={Boolean(state.errors?.name)} />
        {state.errors?.name && <p className="text-pishnam-danger text-xs">{state.errors.name}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lead-phone">شماره تماس</Label>
          <Input
            id="lead-phone"
            name="phone"
            type="tel"
            dir="ltr"
            aria-invalid={Boolean(state.errors?.phone)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lead-email">ایمیل</Label>
          <Input
            id="lead-email"
            name="email"
            type="email"
            dir="ltr"
            aria-invalid={Boolean(state.errors?.email)}
          />
        </div>
      </div>
      {state.errors?.phone && (
        <p className="text-pishnam-danger -mt-2 text-xs">{state.errors.phone}</p>
      )}

      {extraFields.map((field) => (
        <div key={field.name} className="flex flex-col gap-1.5">
          <Label htmlFor={`lead-extra-${field.name}`}>
            {field.label}
            {field.required && " *"}
          </Label>
          {field.type === "textarea" ? (
            <Textarea
              id={`lead-extra-${field.name}`}
              name={`metadata.${field.name}`}
              required={field.required}
              defaultValue={field.defaultValue}
              rows={3}
            />
          ) : field.type === "select" && field.options ? (
            <NativeSelect
              id={`lead-extra-${field.name}`}
              name={`metadata.${field.name}`}
              required={field.required}
              defaultValue={field.defaultValue}
            >
              {field.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </NativeSelect>
          ) : (
            <Input
              id={`lead-extra-${field.name}`}
              name={`metadata.${field.name}`}
              required={field.required}
              defaultValue={field.defaultValue}
            />
          )}
        </div>
      ))}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lead-message">{messageLabel}</Label>
        <Textarea id="lead-message" name="message" rows={4} placeholder={messagePlaceholder} />
      </div>

      {state.status === "error" && state.message && (
        <p role="alert" className="text-pishnam-danger text-sm font-medium">
          {state.message}
        </p>
      )}

      <Button type="submit" size="lg" disabled={isPending} className="mt-2">
        {isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
        {submitLabel}
      </Button>
    </form>
  );
}

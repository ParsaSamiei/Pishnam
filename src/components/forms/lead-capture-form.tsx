"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { submitLead, type SubmitLeadState } from "@/lib/actions/lead";
import { track, type AnalyticsEvent } from "@/lib/analytics";
import { usePreservedFormAction } from "@/lib/hooks/use-preserved-form-action";
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
  messageLabel,
  messagePlaceholder,
}: LeadCaptureFormProps) {
  const locale = useLocale();
  const isFa = locale === "fa";
  const phoneRequired = leadType === "ENROLL" || leadType === "CLASS_SEAT";
  const labels = {
    name: isFa ? "نام و نام خانوادگی" : "Full name",
    phone: isFa ? "شماره تماس" : "Phone number",
    email: isFa ? "ایمیل" : "Email",
    message: isFa ? "توضیحات (اختیاری)" : "Additional notes (optional)",
  };
  const resolvedMessageLabel = messageLabel ?? labels.message;

  const { state, formAction, isPending, formKey, field } = usePreservedFormAction(
    submitLead,
    initialState,
  );

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
    <form
      key={formKey}
      action={formAction}
      className="relative flex min-w-0 flex-col gap-4"
      noValidate
    >
      <input type="hidden" name="type" value={leadType} />
      <input type="hidden" name="locale" value={locale} />

      {/* Honeypot: zero-size clip in place — off-canvas left/start offsets expand page scroll. */}
      <div
        className="pointer-events-none absolute top-0 left-0 h-0 w-0 overflow-hidden opacity-0"
        aria-hidden="true"
      >
        <label htmlFor="lead-website">Website</label>
        <input id="lead-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lead-name">{labels.name} *</Label>
        <Input
          id="lead-name"
          name="name"
          required
          defaultValue={field("name")}
          aria-invalid={Boolean(state.errors?.name)}
        />
        {state.errors?.name && <p className="text-pishnam-danger text-xs">{state.errors.name}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lead-phone">
            {labels.phone}
            {phoneRequired && " *"}
          </Label>
          <Input
            id="lead-phone"
            name="phone"
            type="tel"
            dir="ltr"
            required={phoneRequired}
            defaultValue={field("phone")}
            aria-invalid={Boolean(state.errors?.phone)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lead-email">{labels.email}</Label>
          <Input
            id="lead-email"
            name="email"
            type="email"
            dir="ltr"
            defaultValue={field("email")}
            aria-invalid={Boolean(state.errors?.email)}
          />
        </div>
      </div>
      {state.errors?.phone && (
        <p className="text-pishnam-danger -mt-2 text-xs">{state.errors.phone}</p>
      )}

      {extraFields.map((extraField) => {
        const metadataName = `metadata.${extraField.name}`;
        return (
          <div key={extraField.name} className="flex flex-col gap-1.5">
            <Label htmlFor={`lead-extra-${extraField.name}`}>
              {extraField.label}
              {extraField.required && " *"}
            </Label>
            {extraField.type === "textarea" ? (
              <Textarea
                id={`lead-extra-${extraField.name}`}
                name={metadataName}
                required={extraField.required}
                defaultValue={field(metadataName, extraField.defaultValue)}
                rows={3}
              />
            ) : extraField.type === "select" && extraField.options ? (
              <NativeSelect
                id={`lead-extra-${extraField.name}`}
                name={metadataName}
                required={extraField.required}
                defaultValue={field(metadataName, extraField.defaultValue)}
              >
                {extraField.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </NativeSelect>
            ) : (
              <Input
                id={`lead-extra-${extraField.name}`}
                name={metadataName}
                required={extraField.required}
                defaultValue={field(metadataName, extraField.defaultValue)}
              />
            )}
          </div>
        );
      })}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lead-message">{resolvedMessageLabel}</Label>
        <Textarea
          id="lead-message"
          name="message"
          rows={4}
          placeholder={messagePlaceholder}
          defaultValue={field("message")}
        />
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

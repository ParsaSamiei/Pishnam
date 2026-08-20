"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { JobPostingFormState } from "@/app/admin/(dashboard)/jobs/actions";

interface JobPostingFormProps {
  action: (prevState: JobPostingFormState, formData: FormData) => Promise<JobPostingFormState>;
  defaultValues?: {
    titleFa: string;
    titleEn: string;
    descriptionFa: string;
    descriptionEn: string;
    active: boolean;
    expiresAt: Date | null;
  };
  submitLabel: string;
}

const initialState: JobPostingFormState = { status: "idle" };

function toDateInputValue(date: Date | null | undefined): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function JobPostingForm({ action, defaultValues, submitLabel }: JobPostingFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="titleFa">عنوان (فارسی) *</Label>
          <Input id="titleFa" name="titleFa" defaultValue={defaultValues?.titleFa} required />
          {state.errors?.titleFa && (
            <p className="text-pishnam-danger text-xs">{state.errors.titleFa}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="titleEn">Title (English) *</Label>
          <Input
            id="titleEn"
            name="titleEn"
            dir="ltr"
            defaultValue={defaultValues?.titleEn}
            required
          />
          {state.errors?.titleEn && (
            <p className="text-pishnam-danger text-xs">{state.errors.titleEn}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="descriptionFa">توضیحات (فارسی) *</Label>
        <Textarea
          id="descriptionFa"
          name="descriptionFa"
          rows={4}
          defaultValue={defaultValues?.descriptionFa}
          required
        />
        {state.errors?.descriptionFa && (
          <p className="text-pishnam-danger text-xs">{state.errors.descriptionFa}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="descriptionEn">Description (English) *</Label>
        <Textarea
          id="descriptionEn"
          name="descriptionEn"
          dir="ltr"
          rows={4}
          defaultValue={defaultValues?.descriptionEn}
          required
        />
        {state.errors?.descriptionEn && (
          <p className="text-pishnam-danger text-xs">{state.errors.descriptionEn}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="expiresAt">تاریخ انقضا (اختیاری)</Label>
          <Input
            id="expiresAt"
            name="expiresAt"
            type="date"
            dir="ltr"
            defaultValue={toDateInputValue(defaultValues?.expiresAt)}
          />
        </div>
        <label className="text-text-primary flex items-center gap-2 self-end pb-2.5 text-sm">
          <input
            type="checkbox"
            name="active"
            defaultChecked={defaultValues?.active ?? true}
            className="border-border accent-pishnam-gold-500 size-4 rounded"
          />
          فعال (نمایش در صفحه فرصت‌های شغلی)
        </label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

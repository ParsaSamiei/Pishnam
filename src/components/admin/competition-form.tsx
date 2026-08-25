"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CompetitionFormState } from "@/app/admin/(dashboard)/competitions/actions";

interface CompetitionFormProps {
  action: (prevState: CompetitionFormState, formData: FormData) => Promise<CompetitionFormState>;
  defaultValues?: {
    slug: string;
    titleFa: string;
    titleEn: string;
    year: number | null;
    order: number;
    active: boolean;
  };
  submitLabel: string;
}

const initialState: CompetitionFormState = { status: "idle" };

export function CompetitionForm({ action, defaultValues, submitLabel }: CompetitionFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="slug">نامک (slug) *</Label>
        <Input
          id="slug"
          name="slug"
          dir="ltr"
          placeholder="robocup"
          defaultValue={defaultValues?.slug}
          required
          aria-invalid={Boolean(state.errors?.slug)}
        />
        {state.errors?.slug && <p className="text-pishnam-danger text-xs">{state.errors.slug}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="titleFa">عنوان (فارسی) *</Label>
          <Input
            id="titleFa"
            name="titleFa"
            defaultValue={defaultValues?.titleFa}
            required
            aria-invalid={Boolean(state.errors?.titleFa)}
          />
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
            aria-invalid={Boolean(state.errors?.titleEn)}
          />
          {state.errors?.titleEn && (
            <p className="text-pishnam-danger text-xs">{state.errors.titleEn}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="year">سال (اختیاری)</Label>
          <Input
            id="year"
            name="year"
            type="number"
            min={1990}
            max={2100}
            dir="ltr"
            placeholder="2025"
            defaultValue={defaultValues?.year ?? ""}
            aria-invalid={Boolean(state.errors?.year)}
          />
          {state.errors?.year && <p className="text-pishnam-danger text-xs">{state.errors.year}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="order">ترتیب نمایش</Label>
          <Input
            id="order"
            name="order"
            type="number"
            min={0}
            defaultValue={defaultValues?.order ?? 0}
          />
        </div>
      </div>

      <label className="text-text-primary flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="active"
          defaultChecked={defaultValues?.active ?? true}
          className="border-border accent-pishnam-gold-500 size-4 rounded"
        />
        نمایش در مرکز دانلود
      </label>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

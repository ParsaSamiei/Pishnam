"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import type { AchievementFormState } from "@/app/admin/(dashboard)/achievements/actions";

interface AchievementFormProps {
  action: (prevState: AchievementFormState, formData: FormData) => Promise<AchievementFormState>;
  defaultValues?: {
    titleFa: string;
    titleEn: string;
    competition: string;
    year: number;
    result: string;
    photo: string;
    featured: boolean;
  };
  submitLabel: string;
}

const initialState: AchievementFormState = { status: "idle" };

export function AchievementForm({ action, defaultValues, submitLabel }: AchievementFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <ImageUploadField
        name="photo"
        label="تصویر"
        field="achievement.photo"
        defaultValue={defaultValues?.photo}
        required
        error={state.errors?.photo}
      />

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
          <Label htmlFor="competition">نام مسابقه *</Label>
          <Input
            id="competition"
            name="competition"
            placeholder="RoboCup Iran Open"
            defaultValue={defaultValues?.competition}
            required
            aria-invalid={Boolean(state.errors?.competition)}
          />
          {state.errors?.competition && (
            <p className="text-pishnam-danger text-xs">{state.errors.competition}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="year">سال *</Label>
          <Input
            id="year"
            name="year"
            type="number"
            min={2000}
            max={2100}
            defaultValue={defaultValues?.year}
            required
            aria-invalid={Boolean(state.errors?.year)}
          />
          {state.errors?.year && <p className="text-pishnam-danger text-xs">{state.errors.year}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="result">نتیجه *</Label>
        <Input
          id="result"
          name="result"
          placeholder="مقام اول، لیگ Rescue Line"
          defaultValue={defaultValues?.result}
          required
          aria-invalid={Boolean(state.errors?.result)}
        />
        {state.errors?.result && (
          <p className="text-pishnam-danger text-xs">{state.errors.result}</p>
        )}
      </div>

      <label className="text-text-primary flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="featured"
          defaultChecked={defaultValues?.featured ?? false}
          className="border-border accent-pishnam-gold-500 size-4 rounded"
        />
        نمایش در صفحه اصلی (افتخارات ویژه)
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

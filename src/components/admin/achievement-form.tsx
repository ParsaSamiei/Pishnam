"use client";

import Link from "next/link";
import { usePreservedFormAction } from "@/lib/hooks/use-preserved-form-action";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { NativeSelect } from "@/components/ui/native-select";
import type { AchievementFormState } from "@/app/admin/(dashboard)/achievements/actions";

interface AchievementTagOption {
  id: string;
  nameFa: string;
  nameEn: string;
  active: boolean;
}

interface AchievementFormProps {
  action: (prevState: AchievementFormState, formData: FormData) => Promise<AchievementFormState>;
  tags: AchievementTagOption[];
  defaultValues?: {
    titleFa: string;
    titleEn: string;
    competition: string;
    year: number;
    result: string;
    photo: string;
    tagId: string;
    featured: boolean;
  };
  submitLabel: string;
}

const initialState: AchievementFormState = { status: "idle" };

export function AchievementForm({
  action,
  tags,
  defaultValues,
  submitLabel,
}: AchievementFormProps) {
  const { state, formAction, isPending, formKey, field, checked } = usePreservedFormAction(
    action,
    initialState,
  );

  const defaultTagId = field("tagId", defaultValues?.tagId ?? tags.find((tag) => tag.active)?.id);

  return (
    <form key={formKey} action={formAction} className="flex max-w-2xl flex-col gap-5">
      <ImageUploadField
        name="photo"
        label="تصویر"
        field="achievement.photo"
        defaultValue={field("photo", defaultValues?.photo)}
        required
        error={state.errors?.photo}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="titleFa">عنوان (فارسی) *</Label>
          <Input
            id="titleFa"
            name="titleFa"
            defaultValue={field("titleFa", defaultValues?.titleFa)}
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
            defaultValue={field("titleEn", defaultValues?.titleEn)}
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
            defaultValue={field("competition", defaultValues?.competition)}
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
            defaultValue={field("year", defaultValues?.year)}
            required
            aria-invalid={Boolean(state.errors?.year)}
          />
          {state.errors?.year && <p className="text-pishnam-danger text-xs">{state.errors.year}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="result">نتیجه *</Label>
          <Input
            id="result"
            name="result"
            placeholder="مقام اول، لیگ Rescue Line"
            defaultValue={field("result", defaultValues?.result)}
            required
            aria-invalid={Boolean(state.errors?.result)}
          />
          {state.errors?.result && (
            <p className="text-pishnam-danger text-xs">{state.errors.result}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tagId">برچسب *</Label>
          {tags.length === 0 ? (
            <p className="text-text-secondary text-sm">
              ابتدا حداقل یک برچسب در{" "}
              <Link href="/admin/achievement-tags/new" className="text-pishnam-gold-600 underline">
                برچسب افتخارات
              </Link>{" "}
              بسازید.
            </p>
          ) : (
            <NativeSelect
              id="tagId"
              name="tagId"
              defaultValue={defaultTagId}
              required
              aria-invalid={Boolean(state.errors?.tagId)}
            >
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.nameFa}
                  {!tag.active ? " (غیرفعال)" : ""}
                </option>
              ))}
            </NativeSelect>
          )}
          {state.errors?.tagId && (
            <p className="text-pishnam-danger text-xs">{state.errors.tagId}</p>
          )}
        </div>
      </div>

      <label className="text-text-primary flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="featured"
          defaultChecked={checked("featured", defaultValues?.featured ?? false)}
          className="border-border accent-pishnam-gold-500 size-4 rounded"
        />
        نمایش در صفحه اصلی (افتخارات ویژه)
      </label>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending || tags.length === 0}>
          {isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

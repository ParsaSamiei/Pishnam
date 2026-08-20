"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { TIERS, TIER_LABELS } from "@/lib/tier-labels";
import type { CourseFormState } from "@/app/admin/(dashboard)/courses/actions";

interface CourseFormProps {
  action: (prevState: CourseFormState, formData: FormData) => Promise<CourseFormState>;
  defaultValues?: {
    slug: string;
    tier: string;
    topicTags: string[];
    coverImage: string;
    order: number;
    active: boolean;
    titleFa: string;
    excerptFa: string;
    bodyFa: string;
    prerequisitesFa: string | null;
    titleEn: string;
    excerptEn: string;
    bodyEn: string;
    prerequisitesEn: string | null;
  };
  submitLabel: string;
}

const initialState: CourseFormState = { status: "idle" };

export function CourseForm({ action, defaultValues, submitLabel }: CourseFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-6">
      <ImageUploadField
        name="coverImage"
        label="تصویر شاخص"
        field="course.coverImage"
        defaultValue={defaultValues?.coverImage}
        required
        error={state.errors?.coverImage}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="slug">نامک (slug) *</Label>
          <Input
            id="slug"
            name="slug"
            dir="ltr"
            placeholder="rescue-line-basics"
            defaultValue={defaultValues?.slug}
            required
            aria-invalid={Boolean(state.errors?.slug)}
          />
          {state.errors?.slug && <p className="text-pishnam-danger text-xs">{state.errors.slug}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tier">مقطع تحصیلی *</Label>
          <NativeSelect
            id="tier"
            name="tier"
            defaultValue={defaultValues?.tier ?? TIERS[0]}
            required
          >
            {TIERS.map((tierValue) => (
              <option key={tierValue} value={tierValue}>
                {TIER_LABELS.fa[tierValue]}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="topicTags">برچسب‌های موضوعی (با کاما جدا کنید)</Label>
          <Input
            id="topicTags"
            name="topicTags"
            dir="ltr"
            placeholder="electronics, rescue-line"
            defaultValue={defaultValues?.topicTags.join(", ")}
          />
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
        نمایش عمومی این دوره
      </label>

      <div className="border-border border-t pt-6">
        <h2 className="text-pishnam-steel-600 mb-4 text-sm font-bold">نسخه فارسی</h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="titleFa">عنوان *</Label>
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
            <Label htmlFor="excerptFa">چکیده *</Label>
            <Textarea
              id="excerptFa"
              name="excerptFa"
              rows={2}
              defaultValue={defaultValues?.excerptFa}
              required
              aria-invalid={Boolean(state.errors?.excerptFa)}
            />
            {state.errors?.excerptFa && (
              <p className="text-pishnam-danger text-xs">{state.errors.excerptFa}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="richtext-bodyFa">متن کامل دوره *</Label>
            <RichTextEditor
              name="bodyFa"
              defaultValue={defaultValues?.bodyFa}
              error={state.errors?.bodyFa}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="prerequisitesFa">پیش‌نیازها</Label>
            <Textarea
              id="prerequisitesFa"
              name="prerequisitesFa"
              rows={2}
              defaultValue={defaultValues?.prerequisitesFa ?? ""}
            />
          </div>
        </div>
      </div>

      <div className="border-border border-t pt-6">
        <h2 className="text-pishnam-steel-600 mb-4 text-sm font-bold">English version</h2>
        <div className="flex flex-col gap-4" dir="ltr">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="titleEn">Title *</Label>
            <Input
              id="titleEn"
              name="titleEn"
              defaultValue={defaultValues?.titleEn}
              required
              aria-invalid={Boolean(state.errors?.titleEn)}
            />
            {state.errors?.titleEn && (
              <p className="text-pishnam-danger text-xs">{state.errors.titleEn}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="excerptEn">Excerpt *</Label>
            <Textarea
              id="excerptEn"
              name="excerptEn"
              rows={2}
              defaultValue={defaultValues?.excerptEn}
              required
              aria-invalid={Boolean(state.errors?.excerptEn)}
            />
            {state.errors?.excerptEn && (
              <p className="text-pishnam-danger text-xs">{state.errors.excerptEn}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="richtext-bodyEn">Full course body *</Label>
            <RichTextEditor
              name="bodyEn"
              defaultValue={defaultValues?.bodyEn}
              error={state.errors?.bodyEn}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="prerequisitesEn">Prerequisites</Label>
            <Textarea
              id="prerequisitesEn"
              name="prerequisitesEn"
              rows={2}
              defaultValue={defaultValues?.prerequisitesEn ?? ""}
            />
          </div>
        </div>
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

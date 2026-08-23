"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import type { SoftwareProductFormState } from "@/app/admin/(dashboard)/software/actions";

interface SoftwareProductFormProps {
  action: (
    prevState: SoftwareProductFormState,
    formData: FormData,
  ) => Promise<SoftwareProductFormState>;
  defaultValues?: {
    slug: string;
    image: string;
    titleFa: string;
    titleEn: string;
    descriptionFa: string | null;
    descriptionEn: string | null;
    order: number;
    active: boolean;
  };
  submitLabel: string;
}

const initialState: SoftwareProductFormState = { status: "idle" };

export function SoftwareProductForm({
  action,
  defaultValues,
  submitLabel,
}: SoftwareProductFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <ImageUploadField
        name="image"
        label="تصویر نرم‌افزار"
        field="softwareProduct.image"
        defaultValue={defaultValues?.image}
        required
        error={state.errors?.image}
      />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="slug">نامک (slug) *</Label>
        <Input
          id="slug"
          name="slug"
          dir="ltr"
          placeholder="mblock"
          defaultValue={defaultValues?.slug}
          required
          aria-invalid={Boolean(state.errors?.slug)}
        />
        {state.errors?.slug && <p className="text-pishnam-danger text-xs">{state.errors.slug}</p>}
        <p className="text-text-secondary text-xs">
          آدرس صفحه این نرم‌افزار: /downloads/software/{defaultValues?.slug || "..."}
        </p>
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
          <Label htmlFor="descriptionFa">توضیحات (فارسی)</Label>
          <Textarea
            id="descriptionFa"
            name="descriptionFa"
            rows={4}
            defaultValue={defaultValues?.descriptionFa ?? ""}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="descriptionEn">Description (English)</Label>
          <Textarea
            id="descriptionEn"
            name="descriptionEn"
            dir="ltr"
            rows={4}
            defaultValue={defaultValues?.descriptionEn ?? ""}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 sm:max-w-40">
        <Label htmlFor="order">ترتیب نمایش</Label>
        <Input
          id="order"
          name="order"
          type="number"
          min={0}
          defaultValue={defaultValues?.order ?? 0}
        />
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

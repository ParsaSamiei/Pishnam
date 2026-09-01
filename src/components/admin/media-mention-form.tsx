"use client";

import { usePreservedFormAction } from "@/lib/hooks/use-preserved-form-action";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import type { MediaMentionFormState } from "@/app/admin/(dashboard)/media-mentions/actions";

interface MediaMentionFormProps {
  action: (prevState: MediaMentionFormState, formData: FormData) => Promise<MediaMentionFormState>;
  defaultValues?: {
    outletNameFa: string;
    outletNameEn: string;
    headlineFa: string;
    headlineEn: string;
    url: string;
    logo: string;
    publishedAt: Date;
    order: number;
    active: boolean;
  };
  submitLabel: string;
}

const initialState: MediaMentionFormState = { status: "idle" };

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function MediaMentionForm({ action, defaultValues, submitLabel }: MediaMentionFormProps) {
  const { state, formAction, isPending, formKey, field, checked } = usePreservedFormAction(
    action,
    initialState,
  );

  return (
    <form key={formKey} action={formAction} className="flex max-w-2xl flex-col gap-5">
      <ImageUploadField
        name="logo"
        label="لوگوی رسانه"
        field="mediaMention.logo"
        defaultValue={field("logo", defaultValues?.logo)}
        required
        error={state.errors?.logo}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="outletNameFa">نام رسانه (فارسی) *</Label>
          <Input
            id="outletNameFa"
            name="outletNameFa"
            placeholder="ایسنا"
            defaultValue={field("outletNameFa", defaultValues?.outletNameFa)}
            required
            aria-invalid={Boolean(state.errors?.outletNameFa)}
          />
          {state.errors?.outletNameFa && (
            <p className="text-pishnam-danger text-xs">{state.errors.outletNameFa}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="outletNameEn">Outlet name (English) *</Label>
          <Input
            id="outletNameEn"
            name="outletNameEn"
            dir="ltr"
            placeholder="ISNA"
            defaultValue={field("outletNameEn", defaultValues?.outletNameEn)}
            required
            aria-invalid={Boolean(state.errors?.outletNameEn)}
          />
          {state.errors?.outletNameEn && (
            <p className="text-pishnam-danger text-xs">{state.errors.outletNameEn}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="headlineFa">عنوان خبر (فارسی) *</Label>
          <Input
            id="headlineFa"
            name="headlineFa"
            defaultValue={field("headlineFa", defaultValues?.headlineFa)}
            required
            aria-invalid={Boolean(state.errors?.headlineFa)}
          />
          {state.errors?.headlineFa && (
            <p className="text-pishnam-danger text-xs">{state.errors.headlineFa}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="headlineEn">Headline (English) *</Label>
          <Input
            id="headlineEn"
            name="headlineEn"
            dir="ltr"
            defaultValue={field("headlineEn", defaultValues?.headlineEn)}
            required
            aria-invalid={Boolean(state.errors?.headlineEn)}
          />
          {state.errors?.headlineEn && (
            <p className="text-pishnam-danger text-xs">{state.errors.headlineEn}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="url">لینک خبر *</Label>
        <Input
          id="url"
          name="url"
          type="url"
          dir="ltr"
          placeholder="https://..."
          defaultValue={field("url", defaultValues?.url)}
          required
          aria-invalid={Boolean(state.errors?.url)}
        />
        {state.errors?.url && <p className="text-pishnam-danger text-xs">{state.errors.url}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="publishedAt">تاریخ انتشار *</Label>
          <Input
            id="publishedAt"
            name="publishedAt"
            type="date"
            defaultValue={field(
              "publishedAt",
              defaultValues ? toDateInputValue(defaultValues.publishedAt) : "",
            )}
            required
            aria-invalid={Boolean(state.errors?.publishedAt)}
          />
          {state.errors?.publishedAt && (
            <p className="text-pishnam-danger text-xs">{state.errors.publishedAt}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="order">ترتیب نمایش</Label>
          <Input
            id="order"
            name="order"
            type="number"
            min={0}
            defaultValue={field("order", defaultValues?.order ?? 0)}
            aria-invalid={Boolean(state.errors?.order)}
          />
          {state.errors?.order && (
            <p className="text-pishnam-danger text-xs">{state.errors.order}</p>
          )}
        </div>
      </div>

      <label className="text-text-primary flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="active"
          defaultChecked={checked("active", defaultValues?.active ?? true)}
          className="border-border accent-pishnam-gold-500 size-4 rounded"
        />
        نمایش در سایت
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

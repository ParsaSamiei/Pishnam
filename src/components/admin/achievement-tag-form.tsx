"use client";

import { usePreservedFormAction } from "@/lib/hooks/use-preserved-form-action";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AchievementTagFormState } from "@/app/admin/(dashboard)/achievement-tags/actions";

interface AchievementTagFormProps {
  action: (
    prevState: AchievementTagFormState,
    formData: FormData,
  ) => Promise<AchievementTagFormState>;
  defaultValues?: {
    slug: string;
    nameFa: string;
    nameEn: string;
    order: number;
    active: boolean;
  };
  submitLabel: string;
}

const initialState: AchievementTagFormState = { status: "idle" };

export function AchievementTagForm({
  action,
  defaultValues,
  submitLabel,
}: AchievementTagFormProps) {
  const { state, formAction, isPending, formKey, field, checked } = usePreservedFormAction(
    action,
    initialState,
  );

  return (
    <form key={formKey} action={formAction} className="flex max-w-2xl flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="slug">نامک (slug) *</Label>
        <Input
          id="slug"
          name="slug"
          dir="ltr"
          placeholder="international"
          defaultValue={field("slug", defaultValues?.slug)}
          required
          aria-invalid={Boolean(state.errors?.slug)}
        />
        {state.errors?.slug && <p className="text-pishnam-danger text-xs">{state.errors.slug}</p>}
        <p className="text-text-secondary text-xs">
          برای فیلتر صفحه افتخارات استفاده می‌شود؛ مثلاً{" "}
          <span dir="ltr" className="font-mono">
            /about-us/achievements?tag=international
          </span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nameFa">نام (فارسی) *</Label>
          <Input
            id="nameFa"
            name="nameFa"
            placeholder="جهانی"
            defaultValue={field("nameFa", defaultValues?.nameFa)}
            required
            aria-invalid={Boolean(state.errors?.nameFa)}
          />
          {state.errors?.nameFa && (
            <p className="text-pishnam-danger text-xs">{state.errors.nameFa}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nameEn">Name (English) *</Label>
          <Input
            id="nameEn"
            name="nameEn"
            dir="ltr"
            placeholder="International"
            defaultValue={field("nameEn", defaultValues?.nameEn)}
            required
            aria-invalid={Boolean(state.errors?.nameEn)}
          />
          {state.errors?.nameEn && (
            <p className="text-pishnam-danger text-xs">{state.errors.nameEn}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 sm:max-w-40">
        <Label htmlFor="order">ترتیب نمایش</Label>
        <Input
          id="order"
          name="order"
          type="number"
          min={0}
          defaultValue={field("order", defaultValues?.order ?? 0)}
        />
      </div>

      <label className="text-text-primary flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="active"
          defaultChecked={checked("active", defaultValues?.active ?? true)}
          className="border-border accent-pishnam-gold-500 size-4 rounded"
        />
        نمایش در سایت عمومی
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

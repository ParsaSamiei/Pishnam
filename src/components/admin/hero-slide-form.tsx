"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import type { HeroSlideFormState } from "@/app/admin/(dashboard)/hero-slides/actions";

interface HeroSlideFormProps {
  action: (prevState: HeroSlideFormState, formData: FormData) => Promise<HeroSlideFormState>;
  defaultValues?: {
    image: string;
    altFa: string | null;
    altEn: string | null;
    order: number;
  };
  submitLabel: string;
}

const initialState: HeroSlideFormState = { status: "idle" };

export function HeroSlideForm({ action, defaultValues, submitLabel }: HeroSlideFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <div className="flex flex-col gap-2">
        <ImageUploadField
          name="image"
          label="تصویر"
          field="heroSlide.image"
          defaultValue={defaultValues?.image}
          required
          error={state.errors?.image}
        />
        <p className="text-text-secondary text-xs leading-relaxed">
          تصویر افقی با نسبت ۴:۳ یا عریض‌تر و حداقل ۱۲۰۰ پیکسل در ضلع بزرگ‌تر.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="altFa">متن جایگزین (فارسی)</Label>
          <Input
            id="altFa"
            name="altFa"
            placeholder="تیم رباتیک پیشنام در مسابقات"
            defaultValue={defaultValues?.altFa ?? ""}
            aria-invalid={Boolean(state.errors?.altFa)}
          />
          {state.errors?.altFa && (
            <p className="text-pishnam-danger text-xs">{state.errors.altFa}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="altEn">Alt text (English)</Label>
          <Input
            id="altEn"
            name="altEn"
            dir="ltr"
            placeholder="The Pishnam robotics team at a competition"
            defaultValue={defaultValues?.altEn ?? ""}
            aria-invalid={Boolean(state.errors?.altEn)}
          />
          {state.errors?.altEn && (
            <p className="text-pishnam-danger text-xs">{state.errors.altEn}</p>
          )}
        </div>
      </div>
      <p className="text-text-secondary -mt-2 text-xs leading-relaxed">
        توضیح تصویر برای صفحه‌خوان‌ها و زمانی که تصویر بارگذاری نمی‌شود. در صورت خالی بودن، متن
        پیش‌فرض سایت استفاده می‌شود.
      </p>

      <div className="flex max-w-xs flex-col gap-1.5">
        <Label htmlFor="order">ترتیب نمایش</Label>
        <Input
          id="order"
          name="order"
          type="number"
          min={0}
          defaultValue={defaultValues?.order ?? 0}
          aria-invalid={Boolean(state.errors?.order)}
        />
        {state.errors?.order ? (
          <p className="text-pishnam-danger text-xs">{state.errors.order}</p>
        ) : (
          <p className="text-text-secondary text-xs">
            اسلایدها از کوچک به بزرگ مرتب می‌شوند. کوچک‌ترین عدد ابتدا نمایش داده می‌شود.
          </p>
        )}
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

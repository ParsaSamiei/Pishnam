"use client";

import { usePreservedFormAction } from "@/lib/hooks/use-preserved-form-action";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import type { GalleryImageFormState } from "@/app/admin/(dashboard)/gallery/actions";

interface GalleryImageFormProps {
  action: (prevState: GalleryImageFormState, formData: FormData) => Promise<GalleryImageFormState>;
  defaultValues?: {
    image: string;
    altFa: string | null;
    altEn: string | null;
    captionFa: string | null;
    captionEn: string | null;
    order: number;
  };
  submitLabel: string;
}

const initialState: GalleryImageFormState = { status: "idle" };

export function GalleryImageForm({ action, defaultValues, submitLabel }: GalleryImageFormProps) {
  const { state, formAction, isPending, formKey, field } = usePreservedFormAction(
    action,
    initialState,
  );

  return (
    <form key={formKey} action={formAction} className="flex max-w-2xl flex-col gap-5">
      <div className="flex flex-col gap-2">
        <ImageUploadField
          name="image"
          label="تصویر"
          field="galleryImage.image"
          defaultValue={field("image", defaultValues?.image)}
          required
          error={state.errors?.image}
        />
        <p className="text-text-secondary text-xs leading-relaxed">
          تصویر افقی یا مربعی با حداقل ۱۲۰۰ پیکسل در ضلع بزرگ‌تر.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="altFa">متن جایگزین (فارسی)</Label>
          <Input
            id="altFa"
            name="altFa"
            placeholder="تیم رباتیک در کارگاه"
            defaultValue={field("altFa", defaultValues?.altFa ?? "")}
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
            placeholder="Robotics team at a workshop"
            defaultValue={field("altEn", defaultValues?.altEn ?? "")}
            aria-invalid={Boolean(state.errors?.altEn)}
          />
          {state.errors?.altEn && (
            <p className="text-pishnam-danger text-xs">{state.errors.altEn}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="captionFa">توضیح (فارسی)</Label>
          <Textarea
            id="captionFa"
            name="captionFa"
            rows={3}
            placeholder="توضیح اختیاری که زیر تصویر در گالری نمایش داده می‌شود."
            defaultValue={field("captionFa", defaultValues?.captionFa ?? "")}
            aria-invalid={Boolean(state.errors?.captionFa)}
          />
          {state.errors?.captionFa && (
            <p className="text-pishnam-danger text-xs">{state.errors.captionFa}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="captionEn">Caption (English)</Label>
          <Textarea
            id="captionEn"
            name="captionEn"
            dir="ltr"
            rows={3}
            placeholder="Optional caption shown below the photo in the gallery."
            defaultValue={field("captionEn", defaultValues?.captionEn ?? "")}
            aria-invalid={Boolean(state.errors?.captionEn)}
          />
          {state.errors?.captionEn && (
            <p className="text-pishnam-danger text-xs">{state.errors.captionEn}</p>
          )}
        </div>
      </div>

      <div className="flex max-w-xs flex-col gap-1.5">
        <Label htmlFor="order">ترتیب نمایش</Label>
        <Input
          id="order"
          name="order"
          type="number"
          min={0}
          defaultValue={field("order", defaultValues?.order ?? 0)}
          aria-invalid={Boolean(state.errors?.order)}
        />
        {state.errors?.order ? (
          <p className="text-pishnam-danger text-xs">{state.errors.order}</p>
        ) : (
          <p className="text-text-secondary text-xs">
            تصاویر از کوچک به بزرگ مرتب می‌شوند. کوچک‌ترین عدد ابتدا نمایش داده می‌شود.
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

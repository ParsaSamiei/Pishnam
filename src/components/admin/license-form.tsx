"use client";

import { usePreservedFormAction } from "@/lib/hooks/use-preserved-form-action";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import type { LicenseFormState } from "@/app/admin/(dashboard)/licenses/actions";

interface LicenseFormProps {
  action: (prevState: LicenseFormState, formData: FormData) => Promise<LicenseFormState>;
  defaultValues?: {
    titleFa: string;
    titleEn: string;
    issuerFa: string | null;
    issuerEn: string | null;
    year: number | null;
    image: string;
    descriptionFa: string | null;
    descriptionEn: string | null;
    order: number;
    active: boolean;
  };
  submitLabel: string;
}

const initialState: LicenseFormState = { status: "idle" };

export function LicenseForm({ action, defaultValues, submitLabel }: LicenseFormProps) {
  const { state, formAction, isPending, formKey, field, checked } = usePreservedFormAction(
    action,
    initialState,
  );

  return (
    <form key={formKey} action={formAction} className="flex max-w-2xl flex-col gap-5">
      <ImageUploadField
        name="image"
        label="تصویر مجوز"
        field="license.image"
        defaultValue={field("image", defaultValues?.image)}
        required
        error={state.errors?.image}
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
          <Label htmlFor="issuerFa">صادرکننده (فارسی)</Label>
          <Input
            id="issuerFa"
            name="issuerFa"
            placeholder="وزارت آموزش و پرورش"
            defaultValue={field("issuerFa", defaultValues?.issuerFa ?? "")}
            aria-invalid={Boolean(state.errors?.issuerFa)}
          />
          {state.errors?.issuerFa && (
            <p className="text-pishnam-danger text-xs">{state.errors.issuerFa}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="issuerEn">Issuer (English)</Label>
          <Input
            id="issuerEn"
            name="issuerEn"
            dir="ltr"
            placeholder="Ministry of Education"
            defaultValue={field("issuerEn", defaultValues?.issuerEn ?? "")}
            aria-invalid={Boolean(state.errors?.issuerEn)}
          />
          {state.errors?.issuerEn && (
            <p className="text-pishnam-danger text-xs">{state.errors.issuerEn}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="year">سال</Label>
          <Input
            id="year"
            name="year"
            type="number"
            min={1300}
            max={2100}
            placeholder="1403"
            defaultValue={field("year", defaultValues?.year ?? "")}
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
            defaultValue={field("order", defaultValues?.order ?? 0)}
            aria-invalid={Boolean(state.errors?.order)}
          />
          {state.errors?.order && (
            <p className="text-pishnam-danger text-xs">{state.errors.order}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="descriptionFa">توضیح (فارسی)</Label>
          <Textarea
            id="descriptionFa"
            name="descriptionFa"
            rows={3}
            defaultValue={field("descriptionFa", defaultValues?.descriptionFa ?? "")}
            aria-invalid={Boolean(state.errors?.descriptionFa)}
          />
          {state.errors?.descriptionFa && (
            <p className="text-pishnam-danger text-xs">{state.errors.descriptionFa}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="descriptionEn">Description (English)</Label>
          <Textarea
            id="descriptionEn"
            name="descriptionEn"
            dir="ltr"
            rows={3}
            defaultValue={field("descriptionEn", defaultValues?.descriptionEn ?? "")}
            aria-invalid={Boolean(state.errors?.descriptionEn)}
          />
          {state.errors?.descriptionEn && (
            <p className="text-pishnam-danger text-xs">{state.errors.descriptionEn}</p>
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

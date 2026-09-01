"use client";

import { useState } from "react";
import { usePreservedFormAction } from "@/lib/hooks/use-preserved-form-action";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
  DOWNLOAD_SECTION_ICONS,
  DOWNLOAD_SECTION_SLUGS,
  DOWNLOAD_SECTION_TYPE_LABELS,
  slugForBuiltinSection,
} from "@/lib/download-sections";
import type { DownloadSectionFormState } from "@/app/admin/(dashboard)/download-sections/actions";
import type { DownloadSectionType } from "@prisma/client";

interface DownloadSectionFormProps {
  action: (
    prevState: DownloadSectionFormState,
    formData: FormData,
  ) => Promise<DownloadSectionFormState>;
  defaultValues?: {
    sectionType: DownloadSectionType;
    slug: string;
    titleFa: string;
    titleEn: string;
    iconKey: string;
    order: number;
    active: boolean;
  };
  availableBuiltinTypes?: DownloadSectionType[];
  submitLabel: string;
}

const initialState: DownloadSectionFormState = { status: "idle" };

export function DownloadSectionForm({
  action,
  defaultValues,
  availableBuiltinTypes = [],
  submitLabel,
}: DownloadSectionFormProps) {
  const { state, formAction, isPending, formKey, field, checked } = usePreservedFormAction(
    action,
    initialState,
  );

  const isEdit = Boolean(defaultValues);
  const initialType =
    defaultValues?.sectionType ?? availableBuiltinTypes[0] ?? ("CUSTOM" as DownloadSectionType);
  const [sectionType, setSectionType] = useState<DownloadSectionType>(
    () => field("sectionType", initialType) as DownloadSectionType,
  );

  const isCustom = sectionType === "CUSTOM";
  const previewSlug = isCustom
    ? field("slug", defaultValues?.slug ?? "")
    : slugForBuiltinSection(sectionType as keyof typeof DOWNLOAD_SECTION_SLUGS);

  return (
    <form key={formKey} action={formAction} className="flex max-w-2xl flex-col gap-5">
      {isEdit ? (
        <>
          <input type="hidden" name="sectionType" value={defaultValues!.sectionType} />
          {!isCustom && <input type="hidden" name="slug" value={defaultValues!.slug} />}
          <div className="flex flex-col gap-1.5">
            <Label>نوع بخش</Label>
            <p className="text-text-primary text-sm font-medium">
              {DOWNLOAD_SECTION_TYPE_LABELS[defaultValues!.sectionType].fa}
            </p>
            <p className="text-text-secondary text-xs" dir="ltr">
              /downloads/{defaultValues!.slug}
            </p>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sectionType">نوع بخش *</Label>
          <NativeSelect
            id="sectionType"
            name="sectionType"
            value={sectionType}
            onChange={(event) => setSectionType(event.target.value as DownloadSectionType)}
            required
            aria-invalid={Boolean(state.errors?.sectionType)}
          >
            {availableBuiltinTypes.map((type) => (
              <option key={type} value={type}>
                {DOWNLOAD_SECTION_TYPE_LABELS[type].fa}
              </option>
            ))}
            <option value="CUSTOM">{DOWNLOAD_SECTION_TYPE_LABELS.CUSTOM.fa}</option>
          </NativeSelect>
          {state.errors?.sectionType && (
            <p className="text-pishnam-danger text-xs">{state.errors.sectionType}</p>
          )}
          <p className="text-text-secondary text-xs">
            بخش‌های از پیش‌تعریف‌شده (نرم‌افزار، پوستر و ...) فقط یک‌بار قابل ثبت هستند. برای
            دسته‌بندی جدید، «بخش سفارشی» را انتخاب کنید.
          </p>
        </div>
      )}

      {(isCustom || (isEdit && defaultValues?.sectionType === "CUSTOM")) && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="slug">نامک (slug) *</Label>
          <Input
            id="slug"
            name="slug"
            dir="ltr"
            placeholder="training-videos"
            defaultValue={field("slug", defaultValues?.slug ?? "")}
            required
            aria-invalid={Boolean(state.errors?.slug)}
          />
          {state.errors?.slug ? (
            <p className="text-pishnam-danger text-xs">{state.errors.slug}</p>
          ) : (
            <p className="text-text-secondary text-xs" dir="ltr">
              آدرس صفحه: /downloads/{previewSlug || "..."}
            </p>
          )}
        </div>
      )}

      {!isEdit && !isCustom && <input type="hidden" name="slug" value={previewSlug} />}

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

      <div className="flex flex-col gap-1.5 sm:max-w-xs">
        <Label htmlFor="iconKey">آیکون</Label>
        <NativeSelect
          id="iconKey"
          name="iconKey"
          defaultValue={field("iconKey", defaultValues?.iconKey ?? "file-text")}
          aria-invalid={Boolean(state.errors?.iconKey)}
        >
          {DOWNLOAD_SECTION_ICONS.map(({ key, label }) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </NativeSelect>
        {state.errors?.iconKey && (
          <p className="text-pishnam-danger text-xs">{state.errors.iconKey}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5 sm:max-w-xs">
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
            بخش‌ها از کوچک به بزرگ مرتب می‌شوند. عدد کوچک‌تر بالاتر نمایش داده می‌شود.
          </p>
        )}
      </div>

      <label className="text-text-primary flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="active"
          defaultChecked={checked("active", defaultValues?.active ?? true)}
          className="border-border accent-pishnam-gold-500 size-4 rounded"
        />
        نمایش در مرکز دانلود
      </label>

      {isCustom && (
        <p className="text-text-secondary -mt-2 text-xs leading-relaxed">
          پس از ثبت، فایل‌های این بخش را از بخش «فایل‌های دانلود» با انتخاب همین دسته‌بندی سفارشی
          اضافه کنید.
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

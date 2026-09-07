"use client";

import Link from "next/link";
import { useState } from "react";
import { usePreservedFormAction } from "@/lib/hooks/use-preserved-form-action";
import { formatPriceInput } from "@/lib/format";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import {
  DatasheetVideosFields,
  type DatasheetVideoDraft,
} from "@/components/admin/datasheet-videos-fields";
import {
  DatasheetImagesFields,
  type DatasheetImageDraft,
} from "@/components/admin/datasheet-images-fields";
import { ProductSpecsFields, type ProductSpecDraft } from "@/components/admin/product-specs-fields";
import type { ProductFormState } from "@/app/admin/(dashboard)/products/actions";

function ProductPriceFields({
  defaultPrice,
  defaultCurrencyFa,
  defaultCurrencyEn,
  priceError,
  currencyFaError,
  currencyEnError,
}: {
  defaultPrice: string;
  defaultCurrencyFa: string;
  defaultCurrencyEn: string;
  priceError?: string;
  currencyFaError?: string;
  currencyEnError?: string;
}) {
  const [value, setValue] = useState(() => formatPriceInput(defaultPrice, "fa"));

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="price">قیمت</Label>
        <Input
          id="price"
          name="price"
          dir="ltr"
          inputMode="numeric"
          placeholder="۱٬۰۰۰٬۰۰۰"
          value={value}
          onChange={(e) => setValue(formatPriceInput(e.target.value, "fa"))}
          aria-invalid={Boolean(priceError)}
        />
        <p className="text-text-secondary text-xs">اختیاری — با جداکننده و ارقام فارسی.</p>
        {priceError && <p className="text-pishnam-danger text-xs">{priceError}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="currencyFa">واحد پول (فارسی)</Label>
        <Input
          id="currencyFa"
          name="currencyFa"
          placeholder="تومان"
          defaultValue={defaultCurrencyFa}
          aria-invalid={Boolean(currencyFaError)}
        />
        {currencyFaError && <p className="text-pishnam-danger text-xs">{currencyFaError}</p>}
      </div>
      <div className="flex flex-col gap-1.5 sm:col-start-2">
        <Label htmlFor="currencyEn">Currency (English)</Label>
        <Input
          id="currencyEn"
          name="currencyEn"
          dir="ltr"
          placeholder="toman"
          defaultValue={defaultCurrencyEn}
          aria-invalid={Boolean(currencyEnError)}
        />
        <p className="text-text-secondary text-xs" dir="ltr">
          Free text — e.g. toman, rial, dollar
        </p>
        {currencyEnError && <p className="text-pishnam-danger text-xs">{currencyEnError}</p>}
      </div>
    </div>
  );
}

interface ProductFormProps {
  action: (prevState: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  tags: { id: string; nameFa: string; nameEn: string; active: boolean }[];
  courses: { id: string; title: string }[];
  defaultValues?: {
    slug: string;
    image: string;
    titleFa: string;
    titleEn: string;
    excerptFa: string | null;
    excerptEn: string | null;
    bodyFa: string | null;
    bodyEn: string | null;
    price: number | null;
    currencyFa: string | null;
    currencyEn: string | null;
    courseId: string | null;
    order: number;
    active: boolean;
    tagIds: string[];
    images?: DatasheetImageDraft[];
    videos?: DatasheetVideoDraft[];
    specs?: ProductSpecDraft[];
  };
  submitLabel: string;
}

const initialState: ProductFormState = { status: "idle" };

export function ProductForm({
  action,
  tags,
  courses,
  defaultValues,
  submitLabel,
}: ProductFormProps) {
  const { state, formAction, isPending, formKey, field, checked, multiValueField } =
    usePreservedFormAction(action, initialState);

  const selectedTagIds = multiValueField("tagIds", defaultValues?.tagIds ?? []).filter(Boolean);

  return (
    <form key={formKey} action={formAction} className="flex max-w-3xl flex-col gap-5">
      <ImageUploadField
        name="image"
        label="تصویر کاور"
        field="product.image"
        defaultValue={field("image", defaultValues?.image)}
        required
        error={state.errors?.image}
      />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="slug">نامک (slug) *</Label>
        <Input
          id="slug"
          name="slug"
          dir="ltr"
          placeholder="rescue-line-kit"
          defaultValue={field("slug", defaultValues?.slug)}
          required
          aria-invalid={Boolean(state.errors?.slug)}
        />
        {state.errors?.slug && <p className="text-pishnam-danger text-xs">{state.errors.slug}</p>}
        <p className="text-text-secondary text-xs" dir="ltr">
          /products/{defaultValues?.slug || "…"}
        </p>
      </div>

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
          <Label htmlFor="excerptFa">خلاصه (فارسی)</Label>
          <Textarea
            id="excerptFa"
            name="excerptFa"
            rows={3}
            defaultValue={field("excerptFa", defaultValues?.excerptFa ?? "")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="excerptEn">Excerpt (English)</Label>
          <Textarea
            id="excerptEn"
            name="excerptEn"
            dir="ltr"
            rows={3}
            defaultValue={field("excerptEn", defaultValues?.excerptEn ?? "")}
          />
        </div>
      </div>

      <ProductPriceFields
        key={`price-${formKey}`}
        defaultPrice={field(
          "price",
          defaultValues?.price != null ? String(defaultValues.price) : "",
        )}
        defaultCurrencyFa={field("currencyFa", defaultValues?.currencyFa ?? "")}
        defaultCurrencyEn={field("currencyEn", defaultValues?.currencyEn ?? "")}
        priceError={state.errors?.price}
        currencyFaError={state.errors?.currencyFa}
        currencyEnError={state.errors?.currencyEn}
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-text-primary text-sm font-medium">نوع محصول *</span>
        {tags.length === 0 ? (
          <p className="text-text-secondary text-sm">
            ابتدا حداقل یک نوع در{" "}
            <Link href="/admin/product-tags/new" className="text-pishnam-gold-600 underline">
              انواع محصول
            </Link>{" "}
            بسازید.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {tags.map((tag) => (
              <li key={tag.id}>
                <label className="text-text-primary flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="tagIds"
                    value={tag.id}
                    defaultChecked={selectedTagIds.includes(tag.id)}
                    className="border-border accent-pishnam-gold-500 size-4 rounded"
                  />
                  <span>
                    {tag.nameFa}
                    <span className="text-text-secondary ms-2 text-xs" dir="ltr">
                      {tag.nameEn}
                    </span>
                    {!tag.active ? (
                      <span className="text-text-secondary ms-2 text-xs">(غیرفعال)</span>
                    ) : null}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
        {state.errors?.tagIds && (
          <p className="text-pishnam-danger text-xs">{state.errors.tagIds}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5 sm:max-w-md">
        <Label htmlFor="courseId">دوره مرتبط</Label>
        <NativeSelect
          id="courseId"
          name="courseId"
          defaultValue={field("courseId", defaultValues?.courseId ?? "")}
        >
          <option value="">بدون دوره مرتبط</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </NativeSelect>
        {state.errors?.courseId && (
          <p className="text-pishnam-danger text-xs">{state.errors.courseId}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>متن کامل (فارسی)</Label>
        <RichTextEditor
          name="bodyFa"
          defaultValue={field("bodyFa", defaultValues?.bodyFa ?? "")}
          error={state.errors?.bodyFa}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>Full text (English)</Label>
        <RichTextEditor
          name="bodyEn"
          defaultValue={field("bodyEn", defaultValues?.bodyEn ?? "")}
          error={state.errors?.bodyEn}
        />
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

      <DatasheetImagesFields
        defaultImages={defaultValues?.images}
        preservedJson={field("imagesJson")}
        error={state.errors?.imagesJson}
      />

      <DatasheetVideosFields
        defaultVideos={defaultValues?.videos}
        preservedJson={field("videosJson")}
        error={state.errors?.videosJson}
      />

      <ProductSpecsFields
        defaultSpecs={defaultValues?.specs}
        preservedJson={field("specsJson")}
        error={state.errors?.specsJson}
      />

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending || tags.length === 0}>
          {isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
